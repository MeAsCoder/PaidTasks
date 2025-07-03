import Layout from '../components/Layout'
import TaskCard from '../components/TaskCard'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useUser } from '../hooks/useUser'
import { useRouter } from 'next/router'

import { FiCheckCircle, FiPlay, FiClock, FiDollarSign, FiUsers } from 'react-icons/fi'


const taskCategories = [
  {
    id: 1,
    name: "Surveys",
    tasks: [
      { 
        id: 101, 
        title: "Consumer Preferences Survey", 
        reward: 0.50, 
        time: "5 mins", 
        completed: 1200,
        link: "/surveys/consumer-preferences"
      },
      { 
        id: 102, 
        title: "Tech Usage Questionnaire", 
        reward: 1.20, 
        time: "8 mins", 
        completed: 850,
        link: "/surveys/tech-usage"
      },
      { 
        id: 103, 
        title: "Social Media Habits Survey", 
        reward: 0.80, 
        time: "6 mins", 
        completed: 950,
        link: "/surveys/social-media"
      },
      { 
        id: 104, 
        title: "Shopping Behavior Study", 
        reward: 1.50, 
        time: "10 mins", 
        completed: 620,
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
        reward: 0.30, 
        time: "2 mins", 
        completed: 3200,
        link: "/videos/product-demo"
      },
      { 
        id: 202, 
        title: "View Advertisement", 
        reward: 0.75, 
        time: "4 mins", 
        completed: 1500,
        link: "/videos/advertisement"
      },
      { 
        id: 203, 
        title: "Educational Content", 
        reward: 0.50, 
        time: "3 mins", 
        completed: 2100,
        link: "/videos/educational"
      },
      { 
        id: 204, 
        title: "Brand Awareness Video", 
        reward: 0.60, 
        time: "2.5 mins", 
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
        reward: 5.00, 
        time: "15 mins", 
        completed: 420,
        link: "/testing/app-beta"
      },
      { 
        id: 302, 
        title: "Physical Product Review", 
        reward: 8.00, 
        time: "Varies", 
        completed: 210,
        link: "/testing/physical-product"
      },
      { 
        id: 303, 
        title: "Website Usability Test", 
        reward: 4.50, 
        time: "12 mins", 
        completed: 380,
        link: "/testing/website-usability"
      },
      { 
        id: 304, 
        title: "Service Experience Review", 
        reward: 6.00, 
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
        reward: 0.10, 
        time: "1 min", 
        completed: 4500,
        link: "/microtasks/image-tagging"
      },
      { 
        id: 402, 
        title: "Data Verification", 
        reward: 0.15, 
        time: "1.5 mins", 
        completed: 3800,
        link: "/microtasks/data-verification"
      },
      { 
        id: 403, 
        title: "Short Translation", 
        reward: 0.25, 
        time: "2 mins", 
        completed: 2700,
        link: "/microtasks/translation"
      },
      { 
        id: 404, 
        title: "Quick Poll", 
        reward: 0.05, 
        time: "30 secs", 
        completed: 6800,
        link: "/microtasks/quick-poll"
      }
    ]
  }
]

export default function Tasks() {
  const [taskStates, setTaskStates] = useState({})
  const [categoryStates, setCategoryStates] = useState({})
  const [isClient, setIsClient] = useState(false)
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)

    // Only run client-side code
    if (typeof window !== 'undefined') {
      // Redirect if not authenticated
      if (!loading && !user) {
        router.push('auth/login')
        return
      }

      // Only load data if user is authenticated
      if (user) {
        const savedTaskStates = JSON.parse(localStorage.getItem('taskStates')) || {}
        const savedCategoryStates = JSON.parse(localStorage.getItem('categoryStates')) || {}
        setTaskStates(savedTaskStates)
        setCategoryStates(savedCategoryStates)
      }
    }
  }, [user, loading, router])

  // Show loading state while checking auth
  if (!isClient || loading) {
    return (
      <Layout title="Loading...">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    )
  }

  // If not authenticated (fallback, though useEffect should handle redirect)
  if (!user) {
    return (
      <Layout title="Access Denied">
        <div className="flex justify-center items-center min-h-screen">
          <p>Redirecting to login...</p>
        </div>
      </Layout>
    )
  }

  // Check if all tasks in a category are completed
  const isCategoryComplete = (category) => {
    return category.tasks.every(task => taskStates[task.id]?.completed)
  }

  // Get task status
  const getTaskStatus = (task) => {
    const state = taskStates[task.id] || {}
    const isCompleted = state.completed || false
    
    return { isCompleted }
  }

  // Get category status (including cooldown)
  const getCategoryStatus = (category) => {
    const state = categoryStates[category.id] || {}
    const now = Date.now()
    const isOnCooldown = state.cooldownEnd > now
    const cooldownRemaining = Math.max(0, Math.ceil((state.cooldownEnd - now) / 60000))
    
    return {
      isComplete: isCategoryComplete(category),
      isOnCooldown,
      cooldownRemaining
    }
  }

  // Format time display
  const formatTime = (minutes) => {
    if (minutes <= 0) return 'now'
    return minutes > 1 ? `${minutes} minutes` : '1 minute'
  }
return (
    <Layout title="Available Tasks">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Available Tasks</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete all surveys in a category to earn rewards.
          </p>
        </div>
        
        {taskCategories.map(category => {
          const { isComplete, isOnCooldown, cooldownRemaining } = getCategoryStatus(category)
          
          return (
            <div key={category.id} className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{category.icon}</span>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {category.name} Tasks
                  </h2>
                </div>
                {isComplete && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Category Completed
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.tasks.map(task => {
                  const { isCompleted } = getTaskStatus(task)
                  
                  return (
                    <div 
                      key={task.id}
                      className={`bg-white rounded-xl shadow-md overflow-hidden border ${
                        isOnCooldown ? 'border-gray-200' : 'border-gray-100 hover:shadow-lg'
                      } transition-all duration-300`}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                          {isCompleted && (
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
                          <span>${task.reward.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-6">
                          <FiUsers className="mr-1.5" />
                          <span>{task.completed.toLocaleString()} completed</span>
                        </div>
                        
                        {isOnCooldown && (
                          <div className="mb-4 bg-yellow-50 p-3 rounded-md text-center">
                            <p className="text-sm text-yellow-700">
                              <FiClock className="inline mr-1" />
                              Retry in {formatTime(cooldownRemaining)}
                            </p>
                          </div>
                        )}
                        
                        <Link 
                          href={!isOnCooldown ? task.link : '#'} 
                          passHref
                          legacyBehavior
                        >
                          <a>
                            <button
                              className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
                                isOnCooldown
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                  : isComplete
                                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                              disabled={isOnCooldown || isComplete}
                            >
                              {isOnCooldown ? (
                                <>
                                  <FiLock className="mr-2" />
                                  On Cooldown
                                </>
                              ) : isComplete ? (
                                <>
                                  <FiCheckCircle className="mr-2" />
                                  Task Complete
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
                  )
                })}
              </div>
            </div>
          )
        })}
        
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-3 text-center">How It Works</h3>
          <ul className="list-disc pl-5 text-blue-700 max-w-3xl mx-auto space-y-2">
            <li>Complete all surveys in a category to mark it as complete</li>
            <li>After completing a category, you'll need to wait 10 minutes before retrying</li>
            <li>Your completion status is saved automatically</li>
            <li>Rewards are credited to your account immediately after completion</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}