import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useUser } from '../hooks/useUser';
import { useRouter } from 'next/router';
import TaskCard from '../components/TaskCard';
import {
  FiCheckCircle, FiClock, FiDollarSign, FiAlertCircle,
  FiAlertTriangle, FiZap, FiGrid, FiTrendingUp, FiLock,
  FiX, FiAward, FiRefreshCw,
} from 'react-icons/fi';
import { getDatabase, ref, get } from 'firebase/database';
import { creditEarnings, getEarningsSummary } from '../lib/earningsService';
import LoanAdModal from '../components/LoanAdModal'

// ─── Helpers ────────────────────────────────────────────────────────────────

const COOLDOWN_MS = 5 * 60 * 60 * 1000;

const getTaskStorageKey = (task) => {
  if (
    task.link.startsWith('/surveys/') ||
    task.link.startsWith('/videos/') ||
    task.link.startsWith('/ai-tasks/')
  ) {
    return `surveyCategory-${task.link.split('/').pop()}`;
  }
  return `task-${task.id}`;
};

const readTaskState = (task) => {
  if (typeof window === 'undefined') return { isCompleted: false, cooldownEnd: null };
  try {
    const raw = localStorage.getItem(getTaskStorageKey(task));
    const state = raw ? JSON.parse(raw) : { isCompleted: false, cooldownEnd: null };
    if (state.cooldownEnd && Date.now() >= state.cooldownEnd) {
      return { isCompleted: false, cooldownEnd: null };
    }
    return state;
  } catch { return { isCompleted: false, cooldownEnd: null }; }
};

// ─── Task Data ───────────────────────────────────────────────────────────────

const taskCategories = [
  {
    id: 1,
    name: 'Surveys',
    icon: '📋',
    description: 'Share your opinions and help brands improve their products.',
    tasks: [
      { id: 101, title: 'Consumer Preferences Survey',  reward: 5.00, time: '5 mins',  completed: 1200, link: '/surveys/consumer-preferences' },
      { id: 102, title: 'Tech Usage Questionnaire',     reward: 3.50, time: '8 mins',  completed: 8500, link: '/surveys/tech-usage' },
      { id: 103, title: 'Social Media Habits Survey',   reward: 4.00, time: '6 mins',  completed: 6500, link: '/surveys/social-media' },
      { id: 104, title: 'Shopping Behavior Study',      reward: 6.50, time: '10 mins', completed: 2500, link: '/surveys/shopping-behavior' },
    ],
  },
  {
    id: 2,
    name: 'Video Watching',
    icon: '🎬',
    description: 'Watch short videos and provide feedback for content creators.',
    tasks: [
      { id: 201, title: 'Watch Product Demo',     reward: 2.50, time: '20 mins', completed: 3200, link: '/videos/product-demo' },
      { id: 202, title: 'View Advertisement',     reward: 2.00, time: '30 mins', completed: 1500, link: '/videos/advertisement' },
      { id: 203, title: 'Educational Content',    reward: 4.50, time: '30 mins', completed: 2100, link: '/videos/educational' },
      { id: 204, title: 'Brand Awareness Video',  reward: 6.00, time: '25 mins', completed: 1800, link: '/videos/brand-awareness' },
      { id: 205, title: 'Breaking Habits Video',  reward: 3.00, time: '25 mins', completed: 1800, link: '/videos/breaking-habits' },
    ],
  },
  {
    id: 3,
    name: 'Product Testing',
    icon: '🧪',
    description: 'Test apps, websites, and physical products, then share your review.',
    tasks: [
      { id: 301, title: 'App Beta Testing',          reward: 8.00, time: '15 mins', completed: 420,  link: '/testing/app-beta' },
      { id: 302, title: 'Physical Product Review',   reward: 7.50, time: 'Varies',  completed: 210,  link: '/testing/physical-product' },
      { id: 303, title: 'Website Usability Test',    reward: 5.00, time: '12 mins', completed: 380,  link: '/testing/website-usability' },
      { id: 304, title: 'Service Experience Review', reward: 6.00, time: '20 mins', completed: 290,  link: '/testing/service-experience' },
    ],
  },
  {
    id: 4,
    name: 'Micro Tasks',
    icon: '⚡',
    description: 'Quick bite-sized tasks — label images, verify data, translate phrases.',
    tasks: [
      { id: 401, title: 'Image Tagging',      reward: 2.50, time: '1 min',    completed: 4500, link: '/microtasks/image-tagging' },
      { id: 402, title: 'Data Verification',  reward: 3.00, time: '1.5 mins', completed: 3800, link: '/microtasks/data-verification' },
      { id: 403, title: 'Short Translation',  reward: 4.00, time: '2 mins',   completed: 2700, link: '/microtasks/translation' },
      { id: 404, title: 'Quick Poll',         reward: 2.00, time: '30 secs',  completed: 6800, link: '/microtasks/quick-poll' },
    ],
  },
  {
    id: 5,
    name: 'AI Training Tasks',
    icon: '🤖',
    description: 'Help train AI models used by millions — no technical skills needed.',
    tasks: [
      { id: 501, title: 'Rate AI Responses',              reward: 6.50, time: '10 mins', completed: 3100, link: '/ai-tasks/rate-responses' },
      { id: 502, title: 'Label Training Data',            reward: 5.00, time: '8 mins',  completed: 4700, link: '/ai-tasks/label-data' },
      { id: 503, title: 'Annotate Images for Vision AI',  reward: 8.00, time: '12 mins', completed: 2200, link: '/ai-tasks/annotate-images' },
      { id: 504, title: 'Evaluate Search Results',        reward: 7.00, time: '15 mins', completed: 1900, link: '/ai-tasks/evaluate-search' },
      { id: 505, title: 'Transcribe Audio Clips',         reward: 4.50, time: '10 mins', completed: 3500, link: '/ai-tasks/transcribe-audio' },
      { id: 506, title: 'Translate AI Prompts (Swahili)', reward: 9.00, time: '20 mins', completed: 1400, link: '/ai-tasks/translate-prompts' },
    ],
  },
];

// accent colors per category — warm/natural palette matching site theme
const categoryAccentMap = {
  'Surveys':           { color: '#E8541A', light: '#fef3ee', border: 'rgba(232,84,26,0.2)' },
  'Video Watching':    { color: '#7C3AED', light: '#f5f3ff', border: 'rgba(124,58,237,0.2)' },
  'Product Testing':   { color: '#0891B2', light: '#ecfeff', border: 'rgba(8,145,178,0.2)'  },
  'Micro Tasks':       { color: '#059669', light: '#ecfdf5', border: 'rgba(5,150,105,0.2)'  },
  'AI Training Tasks': { color: '#E8541A', light: '#fef3ee', border: 'rgba(232,84,26,0.2)' },
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');`;

// ─── Activation Modal ────────────────────────────────────────────────────────

function ActivationModal({ onClose, onActivate, userSubscription }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 9999, padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, maxWidth: 400, width: '100%',
        padding: '32px 28px 24px', boxShadow: '0 32px 80px rgba(0,0,0,0.18)', position: 'relative',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 4 }}>
          <FiX size={18} />
        </button>

        {/* Icon */}
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #1a0a00, #2d1200)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <FiLock size={24} color="#E8541A" />
        </div>

        {/* Title & subtitle */}
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: '#111', textAlign: 'center', margin: '0 0 8px' }}>
          Account Not Active
        </h3>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#888', lineHeight: 1.65, margin: '0 0 20px' }}>
          {userSubscription
            ? 'Your current plan has expired. Purchase a new plan to continue earning cash.'
            : "You don't have an active plan yet. Purchase a plan to unlock all task categories and start earning cash."}
        </p>

        {/* Benefits */}
        <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 12, padding: '14px 16px', marginBottom: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '✅', text: 'Access to all task categories' },
            { icon: '💵', text: 'Earn real money daily' },
            { icon: '🤖', text: 'Includes high priority AI Training & Survey tasks' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: '#444', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, lineHeight: 1.4 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <button onClick={onClose} style={{ flex: '0 0 auto', padding: '11px 18px', borderRadius: 50, border: '1.5px solid #e8e8e8', background: 'none', fontSize: 13, fontWeight: 600, color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Maybe Later
          </button>
          <button onClick={onActivate} style={{ flex: 1, padding: '12px', borderRadius: 50, background: '#E8541A', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 4px 16px rgba(232,84,26,0.28)' }}>
            <FiDollarSign size={15} />
            {userSubscription ? 'Purchase New Plan' : 'Purchase a Plan'}
          </button>
        </div>

        {/* Fine print */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
          Plans start from $1 · Instant access · No hidden fees
        </p>
      </div>
    </div>
  );
}

// ─── Earnings Toast ──────────────────────────────────────────────────────────

function EarningsToast({ amount, taskTitle, onClose }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: '#fff', border: '1.5px solid #d1fae5',
      borderRadius: 16, padding: '16px 20px',
      boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
      display: 'flex', alignItems: 'center', gap: 14,
      minWidth: 280, maxWidth: 340,
      animation: 'toastSlide 0.3s ease',
    }}>
      <style>{`@keyframes toastSlide { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <FiDollarSign color="#059669" size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#059669', fontFamily: "'DM Sans', sans-serif" }}>+${amount.toFixed(2)} credited!</div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>{taskTitle}</div>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb' }}>
        <FiX size={14} />
      </button>
    </div>
  );
}

// ─── Category Section ────────────────────────────────────────────────────────

function CategorySection({ cat, taskStates, subscriptionStatus, handleTaskClick, isCategoryComplete, isCategoryOnCooldown, getCooldownRemaining, formatTime }) {
  const accent = categoryAccentMap[cat.name] || categoryAccentMap['Surveys'];
  const isComplete = isCategoryComplete(cat.id);
  const isOnCooldown = isCategoryOnCooldown(cat.id);
  const cooldownRemaining = getCooldownRemaining(cat.id);
  const completedInCat = cat.tasks.filter(t => (taskStates[t.id] || {}).isCompleted).length;
  const catEarned = cat.tasks.filter(t => (taskStates[t.id] || {}).isCompleted).reduce((sum, t) => sum + t.reward, 0);
  const catTotal = cat.tasks.reduce((sum, t) => sum + t.reward, 0);
  const progress = (completedInCat / cat.tasks.length) * 100;
  const isAI = cat.name === 'AI Training Tasks';

  return (
    <div style={{ marginBottom: 56 }}>
      {/* Category Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: accent.light, border: `1.5px solid ${accent.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
          }}>
            {cat.icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: '#111', margin: 0 }}>{cat.name}</h2>
              {isAI && (
                <span style={{ fontSize: 11, fontWeight: 700, background: '#fff7ed', color: '#E8541A', border: '1px solid rgba(232,84,26,0.25)', padding: '2px 10px', borderRadius: 20, fontFamily: "'DM Sans', sans-serif" }}>
                  🔥 High Demand
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: '#999', margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{cat.description}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #bbf7d0', padding: '5px 12px', borderRadius: 20, fontFamily: "'DM Sans', sans-serif" }}>
            ${catEarned.toFixed(2)} / ${catTotal.toFixed(2)}
          </span>
          <span style={{ fontSize: 12, color: '#aaa', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
            {completedInCat}/{cat.tasks.length} done
          </span>
          {isOnCooldown && (
            <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', padding: '5px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'DM Sans', sans-serif" }}>
              <FiRefreshCw size={11} /> Resets in {formatTime(cooldownRemaining)}
            </span>
          )}
          {isComplete && !isOnCooldown && (
            <span style={{ fontSize: 12, fontWeight: 600, color: '#059669', background: '#ecfdf5', border: '1px solid #bbf7d0', padding: '5px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'DM Sans', sans-serif" }}>
              <FiCheckCircle size={11} /> All Done
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#f0f0f0', borderRadius: 4, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: accent.color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>

      {/* Task Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {cat.tasks.map(task => {
          const taskState = taskStates[task.id] || {};
          return (
            <TaskCard
              key={task.id}
              task={task}
              taskCompleted={taskState.isCompleted}
              isCategoryComplete={isComplete}
              isOnCooldown={isOnCooldown}
              isActivated={subscriptionStatus.isActivated}
              cooldownRemaining={cooldownRemaining}
              formatTime={formatTime}
              onStartTask={handleTaskClick}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Tasks() {
  const [categoryStates, setCategoryStates] = useState({});
  const [taskStates, setTaskStates] = useState({});
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [userSubscription, setUserSubscription] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);
  const [toast, setToast] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [activeFilter, setActiveFilter] = useState('All');

  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (userLoading || !user) return;
    try {
      setLoading(true);
      const loadedTaskStates = {};
      taskCategories.forEach(cat => {
        cat.tasks.forEach(task => { loadedTaskStates[task.id] = readTaskState(task); });
      });
      setTaskStates(loadedTaskStates);
      const loadedCatStates = {};
      taskCategories.forEach(cat => {
        try {
          const raw = localStorage.getItem(`category-${cat.id}`);
          loadedCatStates[cat.id] = raw ? JSON.parse(raw) : { isCompleted: false, cooldownEnd: null };
        } catch { loadedCatStates[cat.id] = { isCompleted: false, cooldownEnd: null }; }
      });
      setCategoryStates(loadedCatStates);
    } catch { setError('Failed to load task progress. Please refresh.'); }
    finally { setLoading(false); }
  }, [user, userLoading]);

  useEffect(() => {
    if (!user || userLoading) return;
    const load = async () => {
      try {
        setCheckingSubscription(true);
        // subscription still lives at users/{uid}
        const db = getDatabase();
        const snap = await get(ref(db, `users/${user.uid}`));
        if (snap.exists()) {
          const data = snap.val();
          setUserSubscription(data.subscription || null);
        }
        // earnings come from the unified path: usersweb/{uid}
        const summary = await getEarningsSummary(user.uid);
        setTotalEarned(summary.balance);
      } catch { setUserSubscription(null); }
      finally { setCheckingSubscription(false); }
    };
    load();
  }, [user, userLoading]);

  useEffect(() => {
    if (!userLoading && !user) router.push('/auth/login');
  }, [user, userLoading, router]);

  useEffect(() => {
    if (loading) return;
    const hasActive = Object.values(categoryStates).some(s => s.cooldownEnd && s.cooldownEnd > now);
    if (!hasActive) return;
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, [categoryStates, loading, now]);

  useEffect(() => {
    if (loading) return;
    const updated = { ...categoryStates };
    let changed = false;
    taskCategories.forEach(cat => {
      const allDone = cat.tasks.every(t => (taskStates[t.id] || {}).isCompleted);
      if (allDone && !(categoryStates[cat.id] || {}).isCompleted) {
        updated[cat.id] = { isCompleted: true, cooldownEnd: Date.now() + COOLDOWN_MS };
        localStorage.setItem(`category-${cat.id}`, JSON.stringify(updated[cat.id]));
        changed = true;
      }
    });
    if (changed) setCategoryStates(updated);
  }, [taskStates, loading]);

  const checkSubscriptionStatus = useCallback(() => {
    if (!userSubscription) return { isActivated: false };
    if (userSubscription.isActivated === true || userSubscription.status === 'active')
      return { isActivated: true, plan: userSubscription.plan, status: userSubscription.status };
    return { isActivated: false, plan: userSubscription.plan, status: userSubscription.status };
  }, [userSubscription]);

  const handleCreditEarnings = useCallback(async (task) => {
    if (!user) return;
    try {
      const { newBalance } = await creditEarnings({
        uid:       user.uid,
        taskId:    task.id,
        taskTitle: task.title,
        rewardUsd: task.reward,
        taskType:  task.link.startsWith('/surveys/')    ? 'survey'
                 : task.link.startsWith('/ai-tasks/')   ? 'ai-task'
                 : task.link.startsWith('/videos/')     ? 'video'
                 : task.link.startsWith('/microtasks/') ? 'micro'
                 : 'task',
      });
      setTotalEarned(newBalance);
      setToast({ amount: task.reward, title: task.title });
      setTimeout(() => setToast(null), 4000);
    } catch (err) { console.error('Failed to credit earnings:', err); }
  }, [user]);

  const markTaskComplete = useCallback((task) => {
    const key = getTaskStorageKey(task);
    const newState = { isCompleted: true, cooldownEnd: null };
    localStorage.setItem(key, JSON.stringify(newState));
    setTaskStates(prev => ({ ...prev, [task.id]: newState }));
    handleCreditEarnings(task);
  }, [handleCreditEarnings]);

  const handleTaskClick = useCallback((task, e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (checkingSubscription) return;
    const status = checkSubscriptionStatus();
    if (!status.isActivated) { setShowActivationModal(true); return; }
    router.push({ pathname: task.link, query: { taskId: task.id } }).then(() => {
      const handler = (e) => {
        if (e.detail?.taskId === task.id) { markTaskComplete(task); window.removeEventListener('taskCompleted', handler); }
      };
      window.addEventListener('taskCompleted', handler);
    });
  }, [checkingSubscription, checkSubscriptionStatus, router, markTaskComplete]);

  const isCategoryComplete = (categoryId) => {
    const cat = taskCategories.find(c => c.id === categoryId);
    return cat ? cat.tasks.every(t => (taskStates[t.id] || {}).isCompleted) : false;
  };

  const isCategoryOnCooldown = (categoryId) => {
    const s = categoryStates[categoryId] || {};
    return s.cooldownEnd ? Date.now() < s.cooldownEnd : false;
  };

  const getCooldownRemaining = (categoryId) => {
    const s = categoryStates[categoryId] || {};
    return s.cooldownEnd ? Math.max(0, Math.ceil((s.cooldownEnd - Date.now()) / 60000)) : 0;
  };

  const formatTime = (minutes) => {
    if (minutes <= 0) return 'now';
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (!isClient || userLoading || loading || checkingSubscription) {
    return (
      <Layout title="Tasks">
        <style>{FONTS}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
          <div style={{ width: 44, height: 44, border: '3px solid #E8541A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 14, color: '#888', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
            {checkingSubscription ? 'Verifying subscription…' : 'Loading your tasks…'}
          </p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error">
        <style>{FONTS}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, padding: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiAlertCircle size={28} color="#E8541A" />
          </div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: '#111' }}>Something went wrong</h2>
          <p style={{ fontSize: 14, color: '#777', textAlign: 'center', maxWidth: 360, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '11px 28px', background: '#E8541A', color: '#fff', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Refresh Page
          </button>
        </div>
      </Layout>
    );
  }

  const subscriptionStatus = checkSubscriptionStatus();
  const totalTasks = taskCategories.reduce((acc, c) => acc + c.tasks.length, 0);
  const completedCount = Object.values(taskStates).filter(s => s.isCompleted).length;
  const progressPct = Math.round((completedCount / totalTasks) * 100);

  const filterOptions = ['All', ...taskCategories.map(c => c.name)];
  const filteredCategories = activeFilter === 'All' ? taskCategories : taskCategories.filter(c => c.name === activeFilter);

  return (
    <Layout title="Available Tasks">
      <LoanAdModal /> 
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        .task-page { font-family: 'DM Sans', sans-serif; background: #fafafa; min-height: 100vh; }
        .filter-pill { cursor: pointer; padding: 7px 18px; border-radius: 50px; font-size: 13px; font-weight: 600; border: 1.5px solid transparent; transition: all 0.18s; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .filter-pill.active { background: #E8541A; color: #fff; border-color: #E8541A; }
        .filter-pill.inactive { background: #fff; color: #555; border-color: #e8e8e8; }
        .filter-pill.inactive:hover { border-color: #E8541A; color: #E8541A; }
        .stat-card { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18); border-radius: 14px; padding: 16px 20px; min-width: 140px; backdrop-filter: blur(8px); }
        .stat-card.highlight { background: rgba(232,84,26,0.18); border-color: rgba(232,84,26,0.35); }
        @media (max-width: 640px) {
          .header-inner { flex-direction: column !important; }
          .stats-row { flex-direction: column !important; width: 100% !important; }
          .stat-card { min-width: unset !important; width: 100% !important; }
        }
      `}</style>

      {/* Modals & Toasts */}
      {showActivationModal && (
        <ActivationModal onClose={() => setShowActivationModal(false)} onActivate={() => router.push('/subscription')} userSubscription={userSubscription} />
      )}
      {toast && <EarningsToast amount={toast.amount} taskTitle={toast.title} onClose={() => setToast(null)} />}

      <div className="task-page">

        {/* ── Hero Header ────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 30%, #0f1a2e 70%, #0a1628 100%)',
          padding: '52px 24px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 280, height: 280, background: 'radial-gradient(circle, rgba(232,84,26,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 320, height: 320, background: 'radial-gradient(circle, rgba(8,145,178,0.10) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            {/* Top row */}
            <div className="header-inner" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 28, marginBottom: 32 }}>
              <div>
                {/* Badge row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#E8541A', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>Task Centre</span>
                  {subscriptionStatus.isActivated ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, background: 'rgba(5,150,105,0.2)', color: '#34d399', border: '1px solid rgba(5,150,105,0.3)', padding: '3px 10px', borderRadius: 20, fontFamily: "'DM Sans', sans-serif" }}>
                      <FiZap size={11} />
                      {subscriptionStatus.plan?.charAt(0).toUpperCase()}{subscriptionStatus.plan?.slice(1)} Active
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, background: 'rgba(232,84,26,0.2)', color: '#fb923c', border: '1px solid rgba(232,84,26,0.3)', padding: '3px 10px', borderRadius: 20, fontFamily: "'DM Sans', sans-serif" }}>
                      <FiLock size={11} /> Not Active
                    </span>
                  )}
                </div>
                <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1, margin: '0 0 10px' }}>
                  Available Tasks
                </h1>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', maxWidth: 460, margin: 0, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                  Complete tasks to earn USD rewards. Each category resets after a 5-hour cooldown.
                </p>
              </div>

              {/* Stat cards */}
              <div className="stats-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { label: 'Total Earned', value: `$${totalEarned.toFixed(2)}`, icon: <FiDollarSign size={14} color="#fb923c" />, highlight: true },
                  { label: 'Completed', value: `${completedCount} / ${totalTasks}`, icon: <FiCheckCircle size={14} color="rgba(255,255,255,0.5)" /> },
                  { label: 'Categories', value: String(taskCategories.length), icon: <FiGrid size={14} color="rgba(255,255,255,0.5)" /> },
                ].map((s, i) => (
                  <div key={i} className={`stat-card ${s.highlight ? 'highlight' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      {s.icon}
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em' }}>{s.label}</span>
                    </div>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: s.highlight ? '#fb923c' : '#fff', lineHeight: 1 }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>Overall Progress</span>
                <span style={{ fontSize: 12, color: '#E8541A', fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{progressPct}% complete</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #E8541A, #fb923c)', borderRadius: 6, transition: 'width 0.7s ease' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter Pills ────────────────────────────────────────────────── */}
        <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 0', scrollbarWidth: 'none' }}>
            {filterOptions.map(opt => (
              <button
                key={opt}
                className={`filter-pill ${activeFilter === opt ? 'active' : 'inactive'}`}
                onClick={() => setActiveFilter(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* ── Task Categories ─────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
          {filteredCategories.map(cat => (
            <CategorySection
              key={cat.id}
              cat={cat}
              taskStates={taskStates}
              subscriptionStatus={subscriptionStatus}
              handleTaskClick={handleTaskClick}
              isCategoryComplete={isCategoryComplete}
              isCategoryOnCooldown={isCategoryOnCooldown}
              getCooldownRemaining={getCooldownRemaining}
              formatTime={formatTime}
            />
          ))}

          {/* ── How Earnings Work ──────────────────────────────────────── */}
          <div style={{
            background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 40%, #0f1a2e 100%)',
            borderRadius: 20, padding: '36px 32px',
            marginTop: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232,84,26,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiAward size={18} color="#E8541A" />
              </div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>How Earnings Work</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              {[
                { step: '01', text: 'Activate your subscription to unlock all task categories.' },
                { step: '02', text: 'Complete every task in a category to earn your USD reward.' },
                { step: '03', text: 'Earnings are credited to your account automatically.' },
                { step: '04', text: 'Each category resets after a 5-hour cooldown — repeat daily.' },
              ].map(item => (
                <div key={item.step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{
                    flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(232,84,26,0.15)', border: '1px solid rgba(232,84,26,0.3)',
                    color: '#E8541A', fontSize: 12, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Sora', sans-serif",
                  }}>{item.step}</span>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
