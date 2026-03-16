import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useUser } from '../hooks/useUser';
import { useRouter } from 'next/router';
import TaskCard from '../components/TaskCard';
import {
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiAlertCircle,
  FiAlertTriangle,
  FiZap,
  FiGrid,
  FiTrendingUp,
  FiLock,
  FiX,
} from 'react-icons/fi';
import { getDatabase, ref, get } from 'firebase/database';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getTaskCompletionStatus = (task) => {
  if (typeof window === 'undefined') return false;
  if (task.link.startsWith('/surveys/') || task.link.startsWith('/videos/') || task.link.startsWith('/ai-tasks/')) {
    const taskId = task.link.split('/').pop();
    const state = JSON.parse(localStorage.getItem(`surveyCategory-${taskId}`) || '{"isCompleted":false,"cooldownEnd":null}');
    if (state.cooldownEnd && Date.now() >= state.cooldownEnd) return false;
    return state.isCompleted;
  }
  const state = JSON.parse(localStorage.getItem(`task-${task.id}`) || '{"isCompleted":false}');
  return state.isCompleted;
};

// ─── Task Data ───────────────────────────────────────────────────────────────

const taskCategories = [
  {
    id: 1,
    name: "Surveys",
    icon: "📋",
    description: "Share your opinions and help brands improve their products.",
    tasks: [
      { id: 101, title: "Consumer Preferences Survey", reward: 5000, time: "5 mins", completed: 1200, link: "/surveys/consumer-preferences" },
      { id: 102, title: "Tech Usage Questionnaire", reward: 2300, time: "8 mins", completed: 8500, link: "/surveys/tech-usage" },
      { id: 103, title: "Social Media Habits Survey", reward: 8200, time: "6 mins", completed: 6500, link: "/surveys/social-media" },
      { id: 104, title: "Shopping Behavior Study", reward: 3200, time: "10 mins", completed: 2500, link: "/surveys/shopping-behavior" },
    ],
  },
  {
    id: 2,
    name: "Video Watching",
    icon: "🎬",
    description: "Watch short videos and provide feedback for content creators.",
    tasks: [
      { id: 201, title: "Watch Product Demo", reward: 3500, time: "20 mins", completed: 3200, link: "/videos/product-demo" },
      { id: 202, title: "View Advertisement", reward: 3600, time: "30 mins", completed: 1500, link: "/videos/advertisement" },
      { id: 203, title: "Educational Content", reward: 6280, time: "30 mins", completed: 2100, link: "/videos/educational" },
      { id: 204, title: "Brand Awareness Video", reward: 9500, time: "25 mins", completed: 1800, link: "/videos/brand-awareness" },
      { id: 205, title: "Breaking Habits Video", reward: 3500, time: "25 mins", completed: 1800, link: "/videos/breaking-habits" },
    ],
  },
  {
    id: 3,
    name: "Product Testing",
    icon: "🧪",
    description: "Test apps, websites, and physical products, then share your review.",
    tasks: [
      { id: 301, title: "App Beta Testing", reward: 8900, time: "15 mins", completed: 420, link: "/testing/app-beta" },
      { id: 302, title: "Physical Product Review", reward: 8100, time: "Varies", completed: 210, link: "/testing/physical-product" },
      { id: 303, title: "Website Usability Test", reward: 4500, time: "12 mins", completed: 380, link: "/testing/website-usability" },
      { id: 304, title: "Service Experience Review", reward: 6000, time: "20 mins", completed: 290, link: "/testing/service-experience" },
    ],
  },
  {
    id: 4,
    name: "Micro Tasks",
    icon: "⚡",
    description: "Quick bite-sized tasks — label images, verify data, translate phrases.",
    tasks: [
      { id: 401, title: "Image Tagging", reward: 7820, time: "1 min", completed: 4500, link: "/microtasks/image-tagging" },
      { id: 402, title: "Data Verification", reward: 3500, time: "1.5 mins", completed: 3800, link: "/microtasks/data-verification" },
      { id: 403, title: "Short Translation", reward: 7800, time: "2 mins", completed: 2700, link: "/microtasks/translation" },
      { id: 404, title: "Quick Poll", reward: 4500, time: "30 secs", completed: 6800, link: "/microtasks/quick-poll" },
    ],
  },
  {
    id: 5,
    name: "AI Training Tasks",
    icon: "🤖",
    description: "Help train AI models used by millions — no technical skills needed.",
    tasks: [
      { id: 501, title: "Rate AI Responses", reward: 6500, time: "10 mins", completed: 3100, link: "/ai-tasks/rate-responses" },
      { id: 502, title: "Label Training Data", reward: 5200, time: "8 mins", completed: 4700, link: "/ai-tasks/label-data" },
      { id: 503, title: "Annotate Images for Vision AI", reward: 8400, time: "12 mins", completed: 2200, link: "/ai-tasks/annotate-images" },
      { id: 504, title: "Evaluate Search Results", reward: 7100, time: "15 mins", completed: 1900, link: "/ai-tasks/evaluate-search" },
      { id: 505, title: "Transcribe Audio Clips", reward: 4800, time: "10 mins", completed: 3500, link: "/ai-tasks/transcribe-audio" },
      { id: 506, title: "Translate AI Prompts (Swahili)", reward: 9200, time: "20 mins", completed: 1400, link: "/ai-tasks/translate-prompts" },
    ],
  },
];

const categoryAccentMap = {
  Surveys:          { bar: 'bg-blue-500',    iconBg: 'bg-blue-50 border-blue-100' },
  'Video Watching': { bar: 'bg-violet-500',  iconBg: 'bg-violet-50 border-violet-100' },
  'Product Testing':{ bar: 'bg-orange-500',  iconBg: 'bg-orange-50 border-orange-100' },
  'Micro Tasks':    { bar: 'bg-emerald-500', iconBg: 'bg-emerald-50 border-emerald-100' },
  'AI Training Tasks': { bar: 'bg-purple-600', iconBg: 'bg-purple-50 border-purple-100' },
};

// ─── Activation Modal ────────────────────────────────────────────────────────

const ActivationModal = ({ onClose, onActivate, userSubscription }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-sm w-full p-7 shadow-2xl relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
        <FiX className="w-5 h-5" />
      </button>
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 mb-5 mx-auto">
        <FiAlertTriangle className="w-7 h-7 text-amber-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Account Not Activated</h3>
      <div className="text-gray-500 text-sm text-center space-y-1 mb-6">
        {userSubscription ? (
          <>
            <p>Your subscription is not active.</p>
            <p>Plan: <span className="font-semibold text-gray-700">{userSubscription.plan || 'Unknown'}</span></p>
            <p>Status: <span className="font-semibold text-red-600">{userSubscription.status || 'Inactive'}</span></p>
          </>
        ) : (
          <p>You need an active plan to start earning. Choose a plan to unlock all tasks.</p>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
          Later
        </button>
        <button onClick={onActivate} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-semibold text-white transition flex items-center justify-center gap-2">
          <FiZap className="w-4 h-4" />
          {userSubscription ? 'Reactivate' : 'Activate Now'}
        </button>
      </div>
    </div>
  </div>
);

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
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  // Load task & category states from localStorage
  useEffect(() => {
    setIsClient(true);
    const loadStates = () => {
      try {
        setLoading(true);
        if (typeof window !== 'undefined') {
          const loadedTaskStates = {};
          taskCategories.forEach(category => {
            category.tasks.forEach(task => {
              if (
                task.link.startsWith('/surveys/') ||
                task.link.startsWith('/videos/') ||
                task.link.startsWith('/ai-tasks/')
              ) {
                const taskId = task.link.split('/').pop();
                const savedState = JSON.parse(
                  localStorage.getItem(`surveyCategory-${taskId}`) || 'null'
                ) || { isCompleted: false, cooldownEnd: null };
                loadedTaskStates[task.id] = {
                  isCompleted: savedState.cooldownEnd && Date.now() < savedState.cooldownEnd
                    ? savedState.isCompleted
                    : false,
                  cooldownEnd: savedState.cooldownEnd,
                };
              } else {
                loadedTaskStates[task.id] = {
                  isCompleted: getTaskCompletionStatus(task),
                  cooldownEnd: null,
                };
              }
            });
          });
          setTaskStates(loadedTaskStates);

          const loadedCategoryStates = {};
          taskCategories.forEach(category => {
            const savedState = JSON.parse(
              localStorage.getItem(`category-${category.id}`) || 'null'
            ) || { isCompleted: false, cooldownEnd: null };
            loadedCategoryStates[category.id] = savedState;
          });
          setCategoryStates(loadedCategoryStates);
        }
      } catch {
        setError('Failed to load your task progress. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    if (!userLoading && user) loadStates();
  }, [user, userLoading]);

  // Load subscription from Firebase
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setCheckingSubscription(true);
        const db = getDatabase();
        const snapshot = await get(ref(db, `users/${user.uid}`));
        setUserSubscription(snapshot.exists() ? (snapshot.val().subscription || null) : null);
      } catch {
        setUserSubscription(null);
      } finally {
        setCheckingSubscription(false);
      }
    };
    if (!userLoading && user) load();
  }, [user, userLoading]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!userLoading && !user && typeof window !== 'undefined') router.push('/auth/login');
  }, [user, userLoading, router]);

  // Subscription check
  const checkSubscriptionStatus = () => {
    if (!userSubscription) return { isActivated: false };
    if (userSubscription.isActivated === true || userSubscription.status === 'active')
      return { isActivated: true, plan: userSubscription.plan, status: userSubscription.status };
    return { isActivated: false, plan: userSubscription.plan, status: userSubscription.status };
  };

  // ── TASK CLICK HANDLER (single source of truth) ──────────────────────────
  // This mirrors the original logic exactly:
  //   1. Not activated → show modal
  //   2. Activated → navigate to task link
  const handleTaskClick = (task, e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (checkingSubscription) return;

    const status = checkSubscriptionStatus();

    if (!status.isActivated) {
      setShowActivationModal(true);
      return;
    }

    router.push(task.link);
  };

  // Category helpers
  const isCategoryComplete = (categoryId) => {
    const category = taskCategories.find(c => c.id === categoryId);
    return category ? category.tasks.every(t => (taskStates[t.id] || {}).isCompleted) : false;
  };

  const isCategoryOnCooldown = (categoryId) => {
    const state = categoryStates[categoryId] || {};
    return state.cooldownEnd ? Date.now() < state.cooldownEnd : false;
  };

  const getCooldownRemaining = (categoryId) => {
    const state = categoryStates[categoryId] || {};
    return state.cooldownEnd ? Math.max(0, Math.ceil((state.cooldownEnd - Date.now()) / 60000)) : 0;
  };

  const formatTime = (minutes) => {
    if (minutes <= 0) return 'now';
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  // Auto-mark category complete + set cooldown
  useEffect(() => {
    if (loading) return;
    const updatedStates = { ...categoryStates };
    let hasChanges = false;
    taskCategories.forEach(category => {
      if (isCategoryComplete(category.id)) {
        const curr = categoryStates[category.id] || {};
        if (!curr.isCompleted) {
          updatedStates[category.id] = { isCompleted: true, cooldownEnd: Date.now() + 5 * 60 * 60 * 1000 };
          hasChanges = true;
        }
      }
    });
    if (hasChanges) {
      setCategoryStates(updatedStates);
      Object.entries(updatedStates).forEach(([id, state]) =>
        localStorage.setItem(`category-${id}`, JSON.stringify(state))
      );
    }
  }, [taskStates, loading]);

  // Cooldown countdown
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (loading) return;
    const hasActive = Object.values(categoryStates).some(s => s.cooldownEnd && s.cooldownEnd > now);
    if (hasActive) {
      const t = setInterval(() => setNow(Date.now()), 60000);
      return () => clearInterval(t);
    }
  }, [categoryStates, loading, now]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (!isClient || userLoading || loading || checkingSubscription) {
    return (
      <Layout title="Loading Tasks...">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">
            {checkingSubscription ? 'Verifying subscription…' : 'Loading your tasks…'}
          </p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
            <FiAlertCircle className="text-red-500 w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Something went wrong</h2>
          <p className="text-gray-500 text-sm text-center max-w-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition">
            Refresh Page
          </button>
        </div>
      </Layout>
    );
  }

  const subscriptionStatus = checkSubscriptionStatus();
  const totalTasks = taskCategories.reduce((acc, c) => acc + c.tasks.length, 0);
  const completedCount = Object.values(taskStates).filter(s => s.isCompleted).length;
  const totalEarnable = taskCategories.reduce((acc, c) => acc + c.tasks.reduce((a, t) => a + t.reward, 0), 0);

  return (
    <Layout title="Available Tasks">
      {showActivationModal && (
        <ActivationModal
          onClose={() => setShowActivationModal(false)}
          onActivate={() => router.push('/subscription')}
          userSubscription={userSubscription}
        />
      )}

      {/* ── Dark Header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center flex-wrap gap-2 mb-3">
                <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Task Centre</span>
                {subscriptionStatus.isActivated ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    <FiZap className="w-3 h-3" />
                    {subscriptionStatus.plan?.charAt(0).toUpperCase()}{subscriptionStatus.plan?.slice(1)} Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full">
                    <FiLock className="w-3 h-3" /> Not Activated
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Available Tasks</h1>
              <p className="text-gray-400 mt-2 text-sm max-w-lg">
                Complete tasks to earn Ksh rewards. Each category resets after a 5-hour cooldown period.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Completed', value: `${completedCount}/${totalTasks}`, icon: <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" /> },
                { label: 'Max Earnings', value: `Ksh ${totalEarnable.toLocaleString()}`, icon: <FiDollarSign className="w-3.5 h-3.5 text-blue-400" /> },
                { label: 'Categories', value: String(taskCategories.length), icon: <FiGrid className="w-3.5 h-3.5 text-violet-400" /> },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-w-[120px]">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">{s.icon}{s.label}</div>
                  <div className="text-white font-bold text-lg leading-tight">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mt-8">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Overall Progress</span>
              <span>{Math.round((completedCount / totalTasks) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${(completedCount / totalTasks) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {taskCategories.map(category => {
          const accent = categoryAccentMap[category.name] || categoryAccentMap['Surveys'];
          const isComplete = isCategoryComplete(category.id);
          const isOnCooldown = isCategoryOnCooldown(category.id);
          const cooldownRemaining = getCooldownRemaining(category.id);
          const completedInCat = category.tasks.filter(t => (taskStates[t.id] || {}).isCompleted).length;
          const isAI = category.name === 'AI Training Tasks';

          return (
            <div key={category.id}>
              {/* Category header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border ${accent.iconBg}`}>
                    {category.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-gray-900">{category.name}</h2>
                      {isAI && (
                        <span className="text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                          🔥 High Demand
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-gray-400 font-medium">{completedInCat}/{category.tasks.length} done</span>
                  {isOnCooldown && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full">
                      <FiClock className="w-3 h-3" /> Cooldown · {formatTime(cooldownRemaining)}
                    </span>
                  )}
                  {isComplete && !isOnCooldown && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full">
                      <FiCheckCircle className="w-3 h-3" /> All Done
                    </span>
                  )}
                </div>
              </div>

              {/* Category progress bar */}
              <div className="h-1 w-full bg-gray-100 rounded-full mb-6 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${accent.bar}`}
                  style={{ width: `${(completedInCat / category.tasks.length) * 100}%` }}
                />
              </div>

              {/* Task cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {category.tasks.map(task => {
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
                      onStartTask={handleTaskClick}  // ← single unified handler
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* How it works */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-7">
          <div className="flex items-center gap-2 mb-5">
            <FiTrendingUp className="text-blue-600 w-5 h-5" />
            <h3 className="text-base font-bold text-gray-800">How Earnings Work</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { step: '1', text: 'Activate your subscription to unlock all task categories.' },
              { step: '2', text: 'Complete every task in a category to earn the full reward.' },
              { step: '3', text: 'Each category has a 5-hour cooldown after completion.' },
              { step: '4', text: 'Your progress saves automatically between sessions.' },
            ].map(item => (
              <div key={item.step} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {item.step}
                </span>
                <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}