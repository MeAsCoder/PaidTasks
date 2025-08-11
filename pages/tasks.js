import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useUser } from '../hooks/useUser';
import { useRouter } from 'next/router';
import { 
  FiCheckCircle, 
  FiPlay, 
  FiClock, 
  FiDollarSign, 
  FiUsers, 
  FiLock,
  FiLoader,
  FiAlertCircle,
  FiAlertTriangle,
  FiZap
} from 'react-icons/fi';
import { getDatabase, ref, get } from 'firebase/database';

// Helper to extract surveyId from task links
const getSurveyIdFromLink = (link) => {
  if (link.startsWith('/surveys/')) {
    return link.split('/surveys/')[1];
  }
  return null;
};

const getTaskCompletionStatus = (task) => {
  if (typeof window === 'undefined') return false;
  
  // Check survey-style key first
  if (task.link.startsWith('/surveys/') || task.link.startsWith('/videos/')) {
    const pathSegments = task.link.split('/');
    const taskId = pathSegments[pathSegments.length - 1];
    const surveyKeyState = JSON.parse(localStorage.getItem(`surveyCategory-${taskId}`) || '{"isCompleted":false,"cooldownEnd":null}');
    
    // If cooldown has expired, consider task not completed
    if (surveyKeyState.cooldownEnd && Date.now() >= surveyKeyState.cooldownEnd) {
      return false;
    }
    return surveyKeyState.isCompleted;
  }
  
  // Check task-style key as fallback
  const taskKeyState = JSON.parse(localStorage.getItem(`task-${task.id}`) || '{"isCompleted":false}');
  return taskKeyState.isCompleted;
};

const taskCategories = [
  {
    id: 1,
    name: "Surveys",
    tasks: [
      { 
        id: 101, 
        title: "Consumer Preferences Survey", 
        reward: 5000, 
        time: "5 mins", 
        completed: 1200,
        link: "/surveys/consumer-preferences"
      },
      { 
        id: 102, 
        title: "Tech Usage Questionnaire", 
        reward: 2300, 
        time: "8 mins", 
        completed: 8500,
        link: "/surveys/tech-usage"
      },
      { 
        id: 103, 
        title: "Social Media Habits Survey", 
        reward: 8200, 
        time: "6 mins", 
        completed: 6500,
        link: "/surveys/social-media"
      },
      { 
        id: 104, 
        title: "Shopping Behavior Study", 
        reward: 3200, 
        time: "10 mins", 
        completed: 2500,
        link: "/surveys/shopping-behavior"
      }
    ]
  },
  {
    id: 2,
    name: "Video Watching",
    tasks: [
      { 
        id: 201, 
        title: "Watch Product Demo", 
        reward: 3500, 
        time: "20 mins", 
        completed: 3200,
        link: "/videos/product-demo"
      },
      { 
        id: 202, 
        title: "View Advertisement", 
        reward: 3600, 
        time: "30 mins", 
        completed: 1500,
        link: "/videos/advertisement"
      },
      { 
        id: 203, 
        title: "Educational Content", 
        reward: 6280, 
        time: "30 mins", 
        completed: 2100,
        link: "/videos/educational"
      },
      { 
        id: 204, 
        title: "Brand Awareness Video", 
        reward: 9500, 
        time: "25 mins", 
        completed: 1800,
        link: "/videos/brand-awareness"
      }
    ]
  },
  {
    id: 3,
    name: "Product Testing",
    tasks: [
      { 
        id: 301, 
        title: "App Beta Testing", 
        reward: 8900, 
        time: "15 mins", 
        completed: 420,
        link: "/testing/app-beta"
      },
      { 
        id: 302, 
        title: "Physical Product Review", 
        reward: 8100.00, 
        time: "Varies", 
        completed: 210,
        link: "/testing/physical-product"
      },
      { 
        id: 303, 
        title: "Website Usability Test", 
        reward: 4500, 
        time: "12 mins", 
        completed: 380,
        link: "/testing/website-usability"
      },
      { 
        id: 304, 
        title: "Service Experience Review", 
        reward: 6000.00, 
        time: "20 mins", 
        completed: 290,
        link: "/testing/service-experience"
      }
    ]
  },
  {
    id: 4,
    name: "Micro Tasks",
    tasks: [
      { 
        id: 401, 
        title: "Image Tagging", 
        reward: 7820, 
        time: "1 min", 
        completed: 4500,
        link: "/microtasks/image-tagging"
      },
      { 
        id: 402, 
        title: "Data Verification", 
        reward: 3500, 
        time: "1.5 mins", 
        completed: 3800,
        link: "/microtasks/data-verification"
      },
      { 
        id: 403, 
        title: "Short Translation", 
        reward: 7800, 
        time: "2 mins", 
        completed: 2700,
        link: "/microtasks/translation"
      },
      { 
        id: 404, 
        title: "Quick Poll", 
        reward: 4500, 
        time: "30 secs", 
        completed: 6800,
        link: "/microtasks/quick-poll"
      }
    ]
  }
];

const ActivationModal = ({ onClose, onActivate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <FiAlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Account Not Activated</h3>
          <p className="text-gray-500">
            You need to activate your account to start earning. Choose an activation plan to get started.
          </p>
        </div>
        <div className="mt-6 flex justify-center space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Maybe Later
          </button>
          <button
            type="button"
            onClick={onActivate}
            className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center"
          >
            <FiZap className="mr-2" />
            Activate Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Tasks() {
  const [categoryStates, setCategoryStates] = useState({});
  const [taskStates, setTaskStates] = useState({});
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [clickedTask, setClickedTask] = useState(null);
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  // Load all states from localStorage
  useEffect(() => {
    setIsClient(true);

    const loadStates = () => {
      try {
        setLoading(true);
        
        if (typeof window !== 'undefined') {
          // Load task states with cooldown check
          const loadedTaskStates = {};
          taskCategories.forEach(category => {
            category.tasks.forEach(task => {
              // For surveys and videos, check both completion and cooldown
              if (task.link.startsWith('/surveys/') || task.link.startsWith('/videos/')) {
                const pathSegments = task.link.split('/');
                const taskId = pathSegments[pathSegments.length - 1];
                const savedState = JSON.parse(
                  localStorage.getItem(`surveyCategory-${taskId}`) || 'null'
                ) || {
                  isCompleted: false,
                  cooldownEnd: null
                };
                
                // If cooldown has expired, mark as not completed
                loadedTaskStates[task.id] = {
                  isCompleted: savedState.cooldownEnd && Date.now() < savedState.cooldownEnd 
                    ? savedState.isCompleted 
                    : false,
                  cooldownEnd: savedState.cooldownEnd
                };
              } else {
                // For other tasks, just check completion
                loadedTaskStates[task.id] = {
                  isCompleted: getTaskCompletionStatus(task),
                  cooldownEnd: null
                };
              }
            });
          });
          setTaskStates(loadedTaskStates);

          // Load category states
          const loadedCategoryStates = {};
          taskCategories.forEach(category => {
            const savedState = JSON.parse(
              localStorage.getItem(`category-${category.id}`) || 'null'
            ) || {
              isCompleted: false,
              cooldownEnd: null
            };
            loadedCategoryStates[category.id] = savedState;
          });
          setCategoryStates(loadedCategoryStates);
        }
      } catch (err) {
        console.error('Failed to load task states:', err);
        setError('Failed to load your task progress. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading && user) {
      loadStates();
    }
  }, [user, userLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!userLoading && !user && typeof window !== 'undefined') {
      router.push('/auth/login');
    }
  }, [user, userLoading, router]);

  // Check user activation status
  const checkActivationStatus = async () => {
    if (!user) return false;
    
    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return snapshot.val().isActivated || false;
      }
      return false;
    } catch (error) {
      console.error("Error checking activation status:", error);
      return false;
    }
  };

  // Handle task click
  const handleTaskClick = async (task, e) => {
    e.preventDefault();
    
    const isActivated = await checkActivationStatus();
    if (!isActivated) {
      setClickedTask(task);
      setShowActivationModal(true);
      return;
    }
    
    // Proceed with task if account is activated
    router.push(task.link);
  };

  // Check if all tasks in a category are completed
  const isCategoryComplete = (categoryId) => {
    const category = taskCategories.find(c => c.id === categoryId);
    if (!category) return false;
    
    return category.tasks.every(task => {
      const taskState = taskStates[task.id] || {};
      return taskState.isCompleted;
    });
  };

  // Check cooldown status for a category
  const isCategoryOnCooldown = (categoryId) => {
    const state = categoryStates[categoryId] || {};
    if (!state.cooldownEnd) return false;
    return Date.now() < state.cooldownEnd;
  };

  // Get remaining cooldown time in minutes
  const getCooldownRemaining = (categoryId) => {
    const state = categoryStates[categoryId] || {};
    if (!state.cooldownEnd) return 0;
    return Math.max(0, Math.ceil((state.cooldownEnd - Date.now()) / (1000 * 60)));
  };

  // Format time display
  const formatTime = (minutes) => {
    if (minutes <= 0) return 'now';
    if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Update category state when tasks are completed
  useEffect(() => {
    if (loading) return;

    const updatedStates = { ...categoryStates };
    let hasChanges = false;

    taskCategories.forEach(category => {
      if (isCategoryComplete(category.id)) {
        const currentState = categoryStates[category.id] || {};
        if (!currentState.isCompleted) {
          updatedStates[category.id] = {
            isCompleted: true,
            cooldownEnd: Date.now() + (5 * 60 * 60 * 1000) // 5 hours
          };
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setCategoryStates(updatedStates);
      Object.entries(updatedStates).forEach(([categoryId, state]) => {
        localStorage.setItem(`category-${categoryId}`, JSON.stringify(state));
      });
    }
  }, [taskStates, loading]);

  // Handle cooldown countdown
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (loading) return;

    const hasActiveCooldown = Object.values(categoryStates).some(state => 
      state.cooldownEnd && state.cooldownEnd > now
    );

    if (hasActiveCooldown) {
      const timer = setInterval(() => setNow(Date.now()), 60000); // Update every minute
      return () => clearInterval(timer);
    }
  }, [categoryStates, loading, now]);

  // Loading state
  if (!isClient || userLoading || loading) {
    return (
      <Layout title="Loading Tasks...">
        <div className="flex flex-col items-center justify-center min-h-screen py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4">
            <FiLoader className="w-full h-full text-blue-500" />
          </div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout title="Error Loading Tasks">
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
          <div className="bg-red-100 rounded-full p-4 mb-4">
            <FiAlertCircle className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6 text-center max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Refresh Page
          </button>
        </div>
      </Layout>
    );
  }

  // Main content
  return (
    <Layout title="Available Tasks">
      {showActivationModal && (
        <ActivationModal 
          onClose={() => setShowActivationModal(false)}
          onActivate={() => router.push('/subscription')}
        />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Available Tasks</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete tasks to earn rewards. Categories have a 5-hour cooldown after completion.
          </p>
        </div>

        {taskCategories.map(category => {
          const isComplete = isCategoryComplete(category.id);
          const isOnCooldown = isCategoryOnCooldown(category.id);
          const cooldownRemaining = getCooldownRemaining(category.id);

          return (
            <div key={category.id} className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {category.name}
                </h2>
                {isComplete && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isOnCooldown ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {isOnCooldown ? 'On Cooldown' : 'Completed'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.tasks.map(task => {
                  const taskState = taskStates[task.id] || {};
                  const taskCompleted = taskState.isCompleted;
                  const disabled = isComplete || isOnCooldown;

                  return (
                    <div 
                      key={task.id}
                      className={`bg-white rounded-xl shadow-md overflow-hidden border ${
                        disabled ? 'border-gray-200 opacity-90' : 'border-gray-100 hover:shadow-lg'
                      } transition-all duration-300`}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                          {taskCompleted && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <FiClock className="mr-1.5" />
                          <span>{task.time}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <FiDollarSign className="mr-1.5" />
                          <span>Ksh {task.reward.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-6">
                          <FiUsers className="mr-1.5" /> 
                          <span>{task.completed.toLocaleString()} completed</span>
                        </div>

                        {isOnCooldown && (
                          <div className="mb-4 bg-yellow-50 p-3 rounded-md text-center">
                            <p className="text-sm text-yellow-700">
                              <FiClock className="inline mr-1" />
                              Available in {formatTime(cooldownRemaining)}
                            </p>
                          </div>
                        )}

                        <Link 
                          href={!disabled ? task.link : '#'} 
                          passHref
                          legacyBehavior
                        >
                          <a onClick={(e) => disabled ? null : handleTaskClick(task, e)}>
                            <button
                              className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
                                disabled
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                  : taskCompleted
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                              disabled={disabled}
                            >
                              {disabled ? (
                                <>
                                  <FiLock className="mr-2" />
                                  {isComplete ? 'Category Completed' : 'On Cooldown'}
                                </>
                              ) : taskCompleted ? (
                                <>
                                  <FiCheckCircle className="mr-2" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <FiPlay className="mr-2" />
                                  Start Task
                                </>
                              )}
                            </button>
                          </a>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-3 text-center">How It Works</h3>
          <ul className="list-disc pl-5 text-blue-700 max-w-3xl mx-auto space-y-2">
            <li>Complete all tasks in a category to mark it as complete</li>
            <li>Each category has a 5-hour cooldown period after completion</li>
            <li>During cooldown, all tasks in that category will be disabled</li>
            <li>Your progress is saved automatically between sessions</li>
            <li>Account activation is required to start tasks</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}