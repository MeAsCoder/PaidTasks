/**
 * lib/earningsService.js
 *
 * ─── SINGLE SOURCE OF TRUTH FOR ALL EARNINGS ─────────────────────────────────
 *
 * ALL pages (Tasks, SurveyPage, AITaskPage, Dashboard) must use this service
 * to read and write earnings. This eliminates the fragmented writes that caused
 * earnings not to update.
 *
 * Firebase path: usersweb/{uid}
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Unified schema at usersweb/{uid}:
 * {
 *   balance:          number,   // current withdrawable balance in USD
 *   totalEarningsUsd: number,   // lifetime total earned in USD
 *   completed:        number,   // total tasks/surveys completed
 *   lastTaskCompleted: string,  // ISO timestamp
 *   earnings: {
 *     tasks: {
 *       [taskId]: { title, amount, completedAt, type }
 *     }
 *   }
 * }
 */

import { getDatabase, ref, get, update, increment } from 'firebase/database';

const DB_PATH = (uid) => `usersweb/${uid}`;

/**
 * Credit earnings for a completed task/survey.
 * Writes to usersweb/{uid} — the single path all pages read from.
 *
 * @param {object} params
 * @param {string}  params.uid          Firebase user UID
 * @param {string}  params.taskId       e.g. '501' or 'consumer-preferences'
 * @param {string}  params.taskTitle    Display name
 * @param {number}  params.rewardUsd    Amount in USD (e.g. 6.50)
 * @param {string}  params.taskType     'survey' | 'ai-task' | 'video' | 'micro' | 'testing'
 *
 * @returns {Promise<{ newBalance: number, newTotal: number }>}
 */
export async function creditEarnings({ uid, taskId, taskTitle, rewardUsd, taskType = 'task' }) {
  if (!uid) throw new Error('User UID is required');
  if (!rewardUsd || rewardUsd <= 0) throw new Error('Invalid reward amount');

  const db      = getDatabase();
  const userRef = ref(db, DB_PATH(uid));

  // Read current state first so we can return accurate new values
  const snap = await get(userRef);
  const data = snap.exists() ? snap.val() : {};

  const currentBalance = parseFloat(data.balance || 0);
  const currentTotal   = parseFloat(data.totalEarningsUsd || data.earnings?.total || 0);
  const newBalance     = parseFloat((currentBalance + rewardUsd).toFixed(2));
  const newTotal       = parseFloat((currentTotal   + rewardUsd).toFixed(2));

  const updates = {
    balance:           newBalance,
    totalEarningsUsd:  newTotal,
    completed:         (data.completed || 0) + 1,
    lastTaskCompleted: new Date().toISOString(),
    lastUpdated:       new Date().toISOString(),
    // Log individual task earning
    [`earnings/tasks/${String(taskId).replace(/[.#$[\]/]/g, '_')}`]: {
      title:       taskTitle,
      amount:      rewardUsd,
      completedAt: Date.now(),
      type:        taskType,
    },
  };

  await update(userRef, updates);

  return { newBalance, newTotal };
}

/**
 * Read the user's current earnings summary from usersweb/{uid}.
 *
 * @param {string} uid
 * @returns {Promise<EarningsSummary>}
 */
export async function getEarningsSummary(uid) {
  if (!uid) return defaultSummary();
  const db   = getDatabase();
  const snap = await get(ref(db, DB_PATH(uid)));

  if (!snap.exists()) return defaultSummary();

  const data = snap.val();
  return buildSummary(data);
}

/**
 * Get recent task completions for the dashboard activity feed.
 * Returns the last `limit` completed tasks sorted newest-first.
 *
 * @param {string} uid
 * @param {number} limit
 * @returns {Promise<ActivityItem[]>}
 */
export async function getRecentActivity(uid, limit = 10) {
  if (!uid) return [];
  const db   = getDatabase();
  const snap = await get(ref(db, `${DB_PATH(uid)}/earnings/tasks`));

  if (!snap.exists()) return [];

  const tasks = [];
  snap.forEach(child => {
    tasks.push({ id: child.key, ...child.val() });
  });

  // Sort newest first
  tasks.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  return tasks.slice(0, limit).map(t => ({
    id:        t.id,
    task:      t.title || 'Task',
    amount:    parseFloat(t.amount || 0),
    type:      t.type || 'task',
    timestamp: t.completedAt || 0,
    date:      formatTimeAgo(t.completedAt),
  }));
}

/**
 * Get weekly earnings (last 7 days) for the dashboard chart.
 * Returns array of 7 numbers [oldest → newest].
 *
 * @param {string} uid
 * @returns {Promise<number[]>}
 */
export async function getWeeklyEarnings(uid) {
  if (!uid) return [0, 0, 0, 0, 0, 0, 0];

  const db   = getDatabase();
  const snap = await get(ref(db, `${DB_PATH(uid)}/earnings/tasks`));

  const weekly = [0, 0, 0, 0, 0, 0, 0];
  if (!snap.exists()) return weekly;

  const now     = Date.now();
  const weekMs  = 7 * 24 * 60 * 60 * 1000;
  const dayMs   = 24 * 60 * 60 * 1000;
  const weekAgo = now - weekMs;

  snap.forEach(child => {
    const t = child.val();
    const ts = t.completedAt || 0;
    if (ts >= weekAgo) {
      const daysAgo = Math.floor((now - ts) / dayMs);
      if (daysAgo >= 0 && daysAgo < 7) {
        weekly[6 - daysAgo] += parseFloat(t.amount || 0);
      }
    }
  });

  return weekly.map(v => parseFloat(v.toFixed(2)));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSummary(data) {
  const balance    = parseFloat(data.balance          || 0);
  const totalUsd   = parseFloat(data.totalEarningsUsd || data.earnings?.total || 0);
  const completed  = data.completed || 0;

  // Today's earnings from tasks log
  const today    = new Date(); today.setHours(0, 0, 0, 0);
  let todayTotal = 0;

  const tasks = data.earnings?.tasks || {};
  Object.values(tasks).forEach(t => {
    if (t.completedAt && new Date(t.completedAt) >= today) {
      todayTotal += parseFloat(t.amount || 0);
    }
  });

  return {
    balance:         parseFloat(balance.toFixed(2)),
    totalEarningsUsd: parseFloat(totalUsd.toFixed(2)),
    completed,
    todayEarnings:   parseFloat(todayTotal.toFixed(2)),
    lastTaskCompleted: data.lastTaskCompleted || null,
  };
}

function defaultSummary() {
  return { balance: 0, totalEarningsUsd: 0, completed: 0, todayEarnings: 0, lastTaskCompleted: null };
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Unknown';
  const diffMs    = Date.now() - timestamp;
  const diffMins  = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays  = Math.floor(diffMs / 86400000);
  if (diffMins  < 1)  return 'Just now';
  if (diffMins  < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays  === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

/**
 * @typedef {object} EarningsSummary
 * @property {number} balance
 * @property {number} totalEarningsUsd
 * @property {number} completed
 * @property {number} todayEarnings
 * @property {string|null} lastTaskCompleted
 *
 * @typedef {object} ActivityItem
 * @property {string} id
 * @property {string} task
 * @property {number} amount
 * @property {string} type
 * @property {number} timestamp
 * @property {string} date
 */