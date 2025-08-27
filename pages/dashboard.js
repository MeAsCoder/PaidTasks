import Layout from '../components/Layout'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import ProtectedRoute from '../components/ProtectedRoute';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/userService';
// Import Firebase Realtime Database functions
import { ref, get, query, orderByChild, equalTo } from 'firebase/database'
import { database } from '@/lib/firebase'

function Dashboard() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { currentUser, userData, logout } = useAuth()
  const router = useRouter()
  const [userData2, setUserData2] = useState(null);
  const [surveyStats, setSurveyStats] = useState({
    totalCompleted: 0,
    totalEarned: 0,
    recentCompletions: [],
    todayEarnings: 0,
    weeklyEarnings: [0, 0, 0, 0, 0, 0, 0],
    categoryBreakdown: {}
  });
  const [loading, setLoading] = useState(true);

  // Fetch survey completion data from Firebase
  const fetchSurveyData = async () => {
    if (!currentUser?.uid) return;
    
    try {
      // Fetch user's survey completions
      const surveyCompletionsRef = ref(database, 'surveyCompletions');
      const userSurveysQuery = query(
        surveyCompletionsRef, 
        orderByChild('userId'), 
        equalTo(currentUser.uid)
      );
      
      const snapshot = await get(userSurveysQuery);
      
      if (snapshot.exists()) {
        const completions = [];
        snapshot.forEach((child) => {
          completions.push({
            id: child.key,
            ...child.val()
          });
        });
        
        // Sort by completion date (most recent first)
        completions.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        
        // Calculate stats
        const stats = calculateSurveyStats(completions);
        setSurveyStats(stats);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching survey data:', error);
      setLoading(false);
    }
  };

  // Calculate comprehensive survey statistics
  const calculateSurveyStats = (completions) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let totalEarned = 0;
    let todayEarnings = 0;
    const weeklyEarnings = [0, 0, 0, 0, 0, 0, 0];
    const categoryBreakdown = {};
    
    completions.forEach(completion => {
      const completedDate = new Date(completion.completedAt);
      const points = completion.pointsEarned || 0;
      
      totalEarned += points;
      
      // Today's earnings
      if (completedDate >= today) {
        todayEarnings += points;
      }
      
      // Weekly earnings (last 7 days)
      if (completedDate >= weekAgo) {
        const daysAgo = Math.floor((now - completedDate) / (24 * 60 * 60 * 1000));
        if (daysAgo >= 0 && daysAgo < 7) {
          weeklyEarnings[6 - daysAgo] += points;
        }
      }
      
      // Category breakdown
      const category = completion.category || 'other';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { count: 0, earned: 0 };
      }
      categoryBreakdown[category].count++;
      categoryBreakdown[category].earned += points;
    });
    
    return {
      totalCompleted: completions.length,
      totalEarned,
      recentCompletions: completions.slice(0, 5), // Last 5 completions
      todayEarnings,
      weeklyEarnings,
      categoryBreakdown
    };
  };

  // Format survey activity for display
  const formatSurveyActivity = (completion) => {
    const completedDate = new Date(completion.completedAt);
    const now = new Date();
    const diffTime = now - completedDate;
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let timeAgo;
    if (diffHours < 1) {
      timeAgo = 'Just now';
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      timeAgo = 'Yesterday';
    } else {
      timeAgo = `${diffDays} days ago`;
    }
    
    return {
      id: completion.id,
      task: completion.surveyTitle || `${completion.category} Survey`,
      amount: (completion.pointsEarned || 0) / 100, // Convert points to currency
      date: timeAgo,
      status: 'completed',
      quality: Math.floor(Math.random() * 15) + 85 // Simulate quality score
    };
  };

  useEffect(() => {
    fetchSurveyData();
  }, [currentUser]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const data = await getUserProfile(auth.currentUser.uid);
        setUserData2(data);
      }
    };

    fetchUserData();
  }, []);

  // Combine real survey data with user profile data
  const user = {
    name: userData?.username || 
          auth.currentUser?.displayName || 
          auth.currentUser?.email?.split('@')[0] || 
          'User',
    email: currentUser?.email || '',
    membership: userData?.membership || 'Bronze',
    nextLevel: userData?.membership === 'Bronze' ? 'Silver' : 
               userData?.membership === 'Silver' ? 'Gold' : 
               userData?.membership === 'Gold' ? 'Platinum' : null,
    progress: userData?.progress || 0,
    qualityScore: userData?.qualityScore || 
                  (surveyStats.totalCompleted > 0 ? Math.floor(Math.random() * 15) + 85 : 0),
    tasksCompleted: surveyStats.totalCompleted,
    tasksPending: Math.floor(surveyStats.totalCompleted * 0.1), // Assume 10% pending
    balance: surveyStats.totalEarned / 100, // Convert points to currency
    earningsToday: surveyStats.todayEarnings / 100,
    weeklyEarnings: surveyStats.weeklyEarnings.map(points => points / 100),
    completionRate: surveyStats.totalCompleted > 0 ? 
                   Math.floor(((surveyStats.totalCompleted) / (surveyStats.totalCompleted + Math.floor(surveyStats.totalCompleted * 0.1))) * 100) : 0
  };

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
  ];

  // Convert recent survey completions to activity format
  const recentActivities = surveyStats.recentCompletions.map(formatSurveyActivity);

  const handleSignOut = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <Layout title="My Dashboard">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading your dashboard...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Dashboard">
      {/* Main Dashboard Content */}
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header with User Profile */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.name}</h1>
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
                  <p className="font-bold">{user.membership}</p>
                  {user.nextLevel && (
                    <button 
                      onClick={() => setShowUpgradeModal(true)}
                      className="ml-3 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md shadow-sm transition-colors duration-200"
                    >
                      Upgrade to {user.nextLevel}
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
            <h3 className="text-gray-500 mb-2">Total Earnings</h3>
            <p className="text-3xl font-bold">Ksh {user.balance.toFixed(2)}</p>
            <p className="text-sm text-green-500 mt-1">
              +Ksh {user.earningsToday.toFixed(2)} today
            </p>
            <button 
              onClick={() => router.push('/withdraw')}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Withdraw Earnings
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 mb-2">Surveys Completed</h3>
            <p className="text-3xl font-bold">{user.tasksCompleted}</p>
            <p className="text-sm text-gray-500 mt-1">{user.tasksPending} pending review</p>
            <button 
              onClick={() => router.push('/tasks')}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Take More Surveys
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 mb-2">Earnings Today</h3>
            <p className="text-3xl font-bold">Ksh {user.earningsToday.toFixed(2)}</p>
            {surveyStats.todayEarnings > 0 ? (
              <div className="flex items-center mt-2">
                <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span className="text-sm text-green-500 ml-1">Active today</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">Complete surveys to earn</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 mb-2">Completion Rate</h3>
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
                    strokeDasharray={`${user.completionRate}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{user.completionRate}%</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">
                  {user.completionRate >= 90 ? 'Excellent' : 
                   user.completionRate >= 80 ? 'Good' : 
                   user.completionRate >= 70 ? 'Average' : 
                   user.completionRate > 0 ? 'Improving' : 'New'}
                </p>
                {surveyStats.totalCompleted > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    {surveyStats.totalCompleted} surveys completed
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Survey Completions</h2>
            <button 
              onClick={() => router.push('/tasks')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Tasks
            </button>
          </div>
          <div className="divide-y">
            {recentActivities.length > 0 ? recentActivities.map(item => (
              <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-green-100">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">{item.task}</p>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    Ksh {item.amount.toFixed(2)}
                  </p>
                  <div className="flex items-center justify-end mt-1">
                    <div className="h-2 w-12 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${item.quality}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-1">{item.quality}%</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500">
                <svg className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>No surveys completed yet</p>
                <button 
                  onClick={() => router.push('/tasks')}
                  className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Start your first survey
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Weekly Earnings</h2>
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
            <div className="h-64 flex items-end justify-center space-x-2">
              {user.weeklyEarnings.map((amount, index) => {
                const maxEarning = Math.max(...user.weeklyEarnings, 1);
                const height = (amount / maxEarning) * 200;
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayIndex = (new Date().getDay() - 6 + index + 7) % 7;
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs mb-1">Ksh {amount.toFixed(0)}</div>
                    <div 
                      className="w-8 bg-blue-500 rounded-t-sm"
                      style={{ height: `${height || 4}px` }}
                    ></div>
                    <span className="text-xs mt-1">{days[dayIndex]}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Survey Categories</h2>
              <span className="text-sm text-gray-500">Completed</span>
            </div>
            <div className="space-y-4">
              {Object.keys(surveyStats.categoryBreakdown).length > 0 ? 
                Object.entries(surveyStats.categoryBreakdown).map(([category, data]) => (
                  <div key={category} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium capitalize">{category.replace('-', ' ')}</p>
                      <p className="text-sm text-gray-500">{data.count} completed</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Ksh {(data.earned / 100).toFixed(2)}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>No surveys completed yet</p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/tasks')}
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="h-6 w-6 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Take Survey</span>
            </button>
            <button 
              onClick={() => router.push('/withdraw')}
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="h-6 w-6 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Withdraw</span>
            </button>
            <button 
              onClick={() => router.push('/profile')}
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="h-6 w-6 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>
            <button 
              onClick={() => router.push('/support')}
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
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