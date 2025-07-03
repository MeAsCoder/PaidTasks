import Layout from '../components/Layout'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import ProtectedRoute from '../components/ProtectedRoute';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/userService';





function Dashboard() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { currentUser, userData, logout } = useAuth()
  const router = useRouter()
  const [userData2, setUserData2] = useState(null);



 // Use real user data from AuthContext instead of mock data
  const user = {
    name: userData?.name ||currentUser?.email || 'User',
    email: currentUser?.email || '',
    membership: userData?.membership || 'Bronze',
    nextLevel: userData?.membership === 'Bronze' ? 'Silver' : 
               userData?.membership === 'Silver' ? 'Gold' : 
               userData?.membership === 'Gold' ? 'Platinum' : null,
    progress: userData?.progress || 0,
    qualityScore: userData?.qualityScore || 0,
    tasksCompleted: userData?.tasksCompleted || 0,
    tasksPending: userData?.tasksPending || 0,
    balance: userData?.balance || 0,
    earningsToday: userData?.earningsToday || 0,
    weeklyEarnings: userData?.weeklyEarnings || [0, 0, 0, 0, 0],
    completionRate: userData?.completionRate || 0
  }


  const membershipTiers = [
    {
      name: 'Bronze',
      price: 'Free',
      features: ['Basic tasks', 'Limited earnings', 'Standard support'],
      recommended: false
    },
    {
      name: 'Silver',
      price: '$9.99/month',
      features: ['Higher paying tasks', 'Priority support', 'Daily bonuses'],
      recommended: false
    },
    {
      name: 'Gold',
      price: '$19.99/month',
      features: ['Premium tasks', '24/7 support', 'Weekly bonuses', 'Early access'],
      recommended: true
    },
    {
      name: 'Platinum',
      price: '$29.99/month',
      features: ['All tasks', 'VIP support', 'Daily bonuses', 'Exclusive offers', 'Priority task access'],
      recommended: false
    },
    {
      name: 'Diamond',
      price: '$49.99/month',
      features: ['All Platinum features', 'Double earnings', 'Personal account manager', 'Custom tasks'],
      recommended: false
    }
  ]

  const recentActivities = [
    { id: 1, task: "App Testing", amount: 5.00, date: "2 hours ago", status: "completed", quality: 92 },
    { id: 2, task: "Video Watch", amount: 0.75, date: "Yesterday", status: "completed", quality: 85 },
    { id: 3, task: "Survey", amount: 1.20, date: "2 days ago", status: "pending", quality: null },
    { id: 4, task: "Website Review", amount: 3.50, date: "3 days ago", status: "completed", quality: 95 },
    { id: 5, task: "Product Feedback", amount: 2.00, date: "4 days ago", status: "completed", quality: 88 }
  ]


  const handleSignOut = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

 useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const data = await getUserProfile(auth.currentUser.uid);
        setUserData2(data);
      }
    };

    fetchUserData();
  }, []);

  const user2 = {
    name: userData?.username || 
          auth.currentUser?.displayName || 
          auth.currentUser?.email?.split('@')[0] || 
          'User',
    membership: userData?.membership || 'Bronze',
    nextLevel: userData?.membership === 'Bronze' ? 'Silver' : 
               userData?.membership === 'Silver' ? 'Gold' : 
               userData?.membership === 'Gold' ? 'Platinum' : null,
    progress: userData?.progress || 0,
    qualityScore: userData?.qualityScore || 0,
    tasksCompleted: userData?.tasksCompleted || 0,
    tasksPending: userData?.tasksPending || 0,
    balance: userData?.balance || 0,
    earningsToday: userData?.earningsToday || 0,
    weeklyEarnings: userData?.weeklyEarnings || [0, 0, 0, 0, 0],
    completionRate: userData?.completionRate || 0      
          
    // other fields...
  };


  return (
    <Layout title="My Dashboard">
      {/* Main Dashboard Content */}
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header with User Profile */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user2.name}</h1>
            <p className="text-gray-600">{user.email}</p>

             <button 
              onClick={handleSignOut}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center cursor-pointer"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white p-4 rounded-lg shadow flex items-center">
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">{user.membership.charAt(0)}</span>
                </div>
                <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center ${
                  user.membership === 'Bronze' ? 'bg-amber-500' :
                  user.membership === 'Silver' ? 'bg-gray-300' :
                  user.membership === 'Gold' ? 'bg-yellow-400' : 'bg-purple-500'
                }`}>
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              <div className="ml-4">
                 <p className="text-gray-500 text-sm">Membership</p>
              <div className="flex items-center">
                <p className="font-bold">{user2.membership}</p>
                {user2.nextLevel && (
                  <button 
                    onClick={() => setShowUpgradeModal(true)}
                    className="ml-3 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md shadow-sm transition-colors duration-200"
                  >
                    Upgrade to {user2.nextLevel}
                  </button>
                )}
              </div>
            </div>


            </div>
          </div>
        </div>

        {/* Progress to next tier */}
        {user.nextLevel && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <div className="flex justify-between mb-2">
              <span className="font-medium">{user.membership}</span>
              <span className="font-medium">{user.nextLevel}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${user.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Complete {100 - user.progress}% more to unlock {user.nextLevel} tier benefits
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 mb-2">Balance</h3>
            <p className="text-3xl font-bold">${user.balance.toFixed(2)}</p>
            <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
              Withdraw Earnings
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 mb-2">Tasks Completed</h3>
            <p className="text-3xl font-bold">{user.tasksCompleted}</p>
            <p className="text-sm text-gray-500 mt-1">{user.tasksPending} pending review</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 mb-2">Earnings Today</h3>
            <p className="text-3xl font-bold">${user.earningsToday.toFixed(2)}</p>
            <div className="flex items-center mt-2">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="text-sm text-green-500 ml-1">12% from yesterday</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 mb-2">Quality Score</h3>
            <div className="flex items-center">
              <div className="relative w-12 h-12">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e6e6e6"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray={`${user.qualityScore}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{user.qualityScore}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">
                  {user.qualityScore >= 90 ? 'Excellent' : 
                   user.qualityScore >= 80 ? 'Good' : 
                   user.qualityScore >= 70 ? 'Average' : 'Needs improvement'}
                </p>
                <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                  View feedback
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </button>
          </div>
          <div className="divide-y">
            {recentActivities.map(item => (
              <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div className="flex items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    item.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {item.status === 'completed' ? (
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">{item.task}</p>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${item.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                    ${item.amount.toFixed(2)}
                  </p>
                  {item.quality && (
                    <div className="flex items-center justify-end mt-1">
                      <div className="h-2 w-12 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${item.quality}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-1">{item.quality}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Weekly Earnings</h2>
              <select className="text-sm border rounded px-2 py-1">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
            </div>
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 mb-2">Weekly earnings chart</p>
                <div className="flex justify-center space-x-1 h-40 items-end">
                  {user.weeklyEarnings.map((amount, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-blue-500 rounded-t-sm"
                        style={{ height: `${(amount / 30) * 100}%` }}
                      ></div>
                      <span className="text-xs mt-1">Day {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Task Completion Rate</h2>
              <select className="text-sm border rounded px-2 py-1">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>All Time</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e6e6e6"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${user.completionRate}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold">{user.completionRate}%</span>
                  <span className="text-sm text-gray-500">Success Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="h-6 w-6 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>New Task</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="h-6 w-6 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Withdraw</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="h-6 w-6 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="h-6 w-6 text-amber-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-blue-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Upgrade Your Membership</h2>
                  <p>Unlock more features and earning potential</p>
                </div>
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {membershipTiers.map((tier) => (
                  <div 
                    key={tier.name}
                    className={`border rounded-lg p-6 ${tier.recommended ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'} ${user.membership === tier.name ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold">{tier.name}</h3>
                      {user.membership === tier.name && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Current</span>
                      )}
                      {tier.recommended && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Recommended</span>
                      )}
                    </div>
                    <p className="text-2xl font-bold my-3">{tier.price}</p>
                    <ul className="space-y-2 mb-6">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-2 px-4 rounded-lg font-medium ${
                        user.membership === tier.name
                          ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                          : tier.recommended
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      disabled={user.membership === tier.name}
                    >
                      {user.membership === tier.name ? 'Current Plan' : 'Upgrade'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
              <p className="text-sm text-gray-600 text-center">
                Need help choosing? <a href="#" className="text-blue-600 hover:underline">Contact support</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default function ProtectedDashboard() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}