import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { ref, set, update, get } from "firebase/database";
import { FiCheck, FiClock, FiArrowLeft } from 'react-icons/fi'
import { database } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'

const VideoPage = () => {
  const router = useRouter()
  const { videoId } = router.query
  const { currentUser } = useAuth()
  const videoRef = useRef(null)
  const [hasWatched, setHasWatched] = useState(false)
  const [timeWatched, setTimeWatched] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoryState, setCategoryState] = useState({
    isCompleted: false,
    cooldownEnd: null
  })
  const [videoLoaded, setVideoLoaded] = useState(false)
  
  // Debug state to track issues
  const [debugInfo, setDebugInfo] = useState({
    lastTimeUpdate: 0,
    calculatedProgress: 0,
    shouldEnable: false
  })

  // Updated video data with working video URLs and reasonable durations
  const videoData = {
    'product-demo': {
      id: 201,
      title: "Watch Product Demo",
      reward: 0.30,
      description: "Watch this demonstration of our latest product features and capabilities.",
      duration: 120, // 2 minutes
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail: "https://sample-videos.com/img/Sample-jpg-image-500kb.jpg"
    },
    'advertisement': {
      id: 202,
      title: "View Advertisement",
      reward: 0.75,
      description: "View this promotional content from our advertising partners.",
      duration: 60, // 1 minute
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnail: "https://sample-videos.com/img/Sample-jpg-image-1mb.jpg"
    },
    'educational': {
      id: 203,
      title: "Educational Content",
      reward: 0.50,
      description: "Learn something new with this informative educational video.",
      duration: 90, // 1.5 minutes
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail: "https://sample-videos.com/img/Sample-jpg-image-1.5mb.jpg"
    },
    'brand-awareness': {
      id: 204,
      title: "Brand Awareness Video",
      reward: 0.60,
      description: "This video helps build recognition for our partner brands.",
      duration: 75, // 1.25 minutes
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      thumbnail: "https://sample-videos.com/img/Sample-jpg-image-2mb.jpg"
    },
    'ted-talk': {
      id: 205,
      title: "Breaking Bad Habits",
      reward: 0.80,
      description: "This video helps build awareness on breaking bad habits.",
      duration: 180, // 3 minutes
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
      thumbnail: "https://sample-videos.com/img/Sample-jpg-image-2mb.jpg"
    }
  }

  const currentVideo = videoData[videoId] || videoData['product-demo']

  // Enhanced progress check with better debugging
  useEffect(() => {
    const actualDuration = videoDuration || currentVideo.duration
    const requiredWatchTime = actualDuration * 0.3
    const calculatedProgress = actualDuration > 0 ? (timeWatched / actualDuration) * 100 : 0
    const shouldEnable = timeWatched >= requiredWatchTime && actualDuration > 0
    
    // Update debug info
    setDebugInfo({
      lastTimeUpdate: timeWatched,
      calculatedProgress,
      shouldEnable
    })
    
    console.log('=== PROGRESS CHECK DEBUG ===')
    console.log('Time watched:', timeWatched.toFixed(2))
    console.log('Actual duration:', actualDuration.toFixed(2))
    console.log('Required watch time (30%):', requiredWatchTime.toFixed(2))
    console.log('Progress percentage:', calculatedProgress.toFixed(1) + '%')
    console.log('Should enable button:', shouldEnable)
    console.log('Current hasWatched state:', hasWatched)
    console.log('Category state completed:', categoryState.isCompleted)
    console.log('=== END DEBUG ===')
    
    if (shouldEnable) {
      console.log('✅ 30% threshold reached - enabling submit button')
      setHasWatched(true)
    } else {
      console.log('❌ 30% threshold not reached yet')
      setHasWatched(false)
    }
  }, [timeWatched, videoDuration, currentVideo.duration])

  // Load state from localStorage with better error handling
  useEffect(() => {
    if (typeof window !== 'undefined' && videoId && currentVideo.id) {
      try {
        const savedState =
          JSON.parse(localStorage.getItem(`surveyCategory-${videoId}`)) ||
          JSON.parse(localStorage.getItem(`task-${currentVideo.id}`)) || {
            isCompleted: false,
            cooldownEnd: null
          }
        console.log('Loaded category state:', savedState)
        setCategoryState(savedState)
      } catch (error) {
        console.error('Error loading saved state:', error)
        setCategoryState({ isCompleted: false, cooldownEnd: null })
      }
    }
  }, [videoId, currentVideo.id])

  // Cooldown timer
  useEffect(() => {
    if (!categoryState.cooldownEnd) return

    const timer = setInterval(() => {
      if (Date.now() >= categoryState.cooldownEnd) {
        const newState = { isCompleted: false, cooldownEnd: null }
        setCategoryState(newState)
        if (typeof window !== 'undefined') {
          localStorage.setItem(`surveyCategory-${videoId}`, JSON.stringify(newState))
          localStorage.setItem(`task-${currentVideo.id}`, JSON.stringify(newState))
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [categoryState.cooldownEnd, videoId, currentVideo.id])

  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration
      console.log('Video metadata loaded - Duration:', duration)
      setVideoDuration(duration)
      setVideoLoaded(true)
    }
  }

  // Enhanced time update handler
  const handleTimeUpdate = (e) => {
    const currentTime = e.target.currentTime
    const duration = e.target.duration || videoDuration || currentVideo.duration
    
    // Ensure we have valid values
    if (isNaN(currentTime) || currentTime < 0) {
      console.warn('Invalid currentTime:', currentTime)
      return
    }
    
    setTimeWatched(currentTime)
    
    console.log('Time update - Current:', currentTime.toFixed(1), 'Duration:', duration.toFixed(1))

    // Update progress in Firebase if user is logged in
    if (currentUser && duration > 0) {
      const progress = Math.min(100, Math.floor((currentTime / duration) * 100))
      update(ref(database, `usersweb/${currentUser.uid}/videos/${currentVideo.id}`), {
        lastWatched: Date.now(),
        progress: progress
      }).catch(error => {
        console.error('Firebase update error:', error)
      })
    }
  }

  // Handle video ended
  const handleVideoEnded = () => {
    console.log('🏁 Video ended - enabling submit button')
    setHasWatched(true)
  }

  // Enhanced submit handler with better error handling
  const handleSubmit = async () => {
    console.log('🔘 Submit button clicked')
    console.log('hasWatched:', hasWatched)
    console.log('categoryState.isCompleted:', categoryState.isCompleted)
    console.log('isSubmitting:', isSubmitting)
    
    // Check if submission should be blocked
    if (!hasWatched) {
      console.log('❌ Submission blocked - hasWatched is false')
      alert('Please watch at least 30% of the video to submit.')
      return
    }
    
    if (categoryState.isCompleted) {
      console.log('❌ Submission blocked - task already completed')
      alert('This task has already been completed.')
      return
    }
    
    if (isSubmitting) {
      console.log('❌ Submission blocked - already submitting')
      return
    }

    console.log('✅ Starting submission process...')
    setIsSubmitting(true)

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500))

      const cooldownHours = 5
      const newCooldownEnd = Date.now() + cooldownHours * 60 * 60 * 1000
      const newState = { isCompleted: true, cooldownEnd: newCooldownEnd }

      setCategoryState(newState)
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`surveyCategory-${videoId}`, JSON.stringify(newState))
        localStorage.setItem(`task-${currentVideo.id}`, JSON.stringify(newState))
      }

      // Save to Firebase if user is logged in
      if (currentUser) {
        console.log('💾 Saving to Firebase...')
        
        // Save video completion
        await set(ref(database, `usersweb/${currentUser.uid}/videos/${currentVideo.id}`), {
          videoId: currentVideo.id,
          title: currentVideo.title,
          reward: currentVideo.reward,
          completedAt: Date.now(),
          cooldownEnd: newCooldownEnd,
          status: "completed",
          watchTime: timeWatched,
          totalDuration: videoDuration || currentVideo.duration
        })

        // Update rewards balance
        const statsRef = ref(database, `usersweb/${currentUser.uid}/stats`)
        const statsSnap = await get(statsRef)
        const prevStats = statsSnap.exists() ? statsSnap.val() : { totalEarned: 0 }

        await update(statsRef, {
          totalEarned: (prevStats.totalEarned || 0) + currentVideo.reward
        })
        
        console.log('✅ Firebase save completed')
      }

      console.log('🚀 Redirecting to completion page...')
      router.push({
        pathname: '/video-complete',
        query: { reward: currentVideo.reward, videoTitle: currentVideo.title }
      })
    } catch (error) {
      console.error("❌ Submission error:", error)
      alert('An error occurred while submitting. Please try again.')
      setIsSubmitting(false)
    }
  }

  // If already completed
  if (categoryState.isCompleted && categoryState.cooldownEnd) {
    const remainingHours = Math.ceil((categoryState.cooldownEnd - Date.now()) / (60 * 60 * 1000))
    return (
      <Layout title="Video Completed">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 my-8 text-center">
          <div className="mb-6 text-green-500"><FiCheck className="inline-block text-5xl" /></div>
          <h2 className="text-2xl font-bold mb-2">Video Completed!</h2>
          <p className="text-lg text-blue-600 mb-2">+${currentVideo.reward.toFixed(2)} earned!</p>
          <p className="text-gray-600 mb-6">Thank you for watching &quot;{currentVideo.title}&quot;.</p>
          <div className="bg-blue-50 p-4 rounded-lg inline-flex items-center">
            <FiClock className="mr-2 text-blue-500" />
            <span className="text-blue-700">
              You can watch this video again in {remainingHours} hour{remainingHours !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => router.push('/tasks')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center mx-auto"
          >
            <FiArrowLeft className="mr-2" /> Back to Available Tasks
          </button>
        </div>
      </Layout>
    )
  }

  const actualDuration = videoDuration || currentVideo.duration
  const watchProgress = actualDuration > 0 ? (timeWatched / actualDuration) * 100 : 0
  const requiredProgress = 30

  // Enhanced button disabled logic
  const isButtonDisabled = !hasWatched || isSubmitting || categoryState.isCompleted

  return (
    <Layout title={currentVideo.title}>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 my-8">
        <h1 className="text-2xl font-bold mb-4">{currentVideo.title}</h1>
        <p className="text-gray-600 mb-6">{currentVideo.description}</p>

        {/* Video Player */}
        <div className="mb-6 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            controls
            className="w-full"
            poster={currentVideo.thumbnail}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onLoadedMetadata={handleLoadedMetadata}
          >
            <source src={currentVideo.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Loading state for video metadata */}
        {!videoLoaded && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">Loading video...</p>
          </div>
        )}

        {/* Progress Info */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Watched: {Math.floor(timeWatched)}s / {Math.floor(actualDuration)}s
            </span>
            <span className="text-sm font-medium text-gray-700">
              {watchProgress.toFixed(1)}% Complete (Need {requiredProgress}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                watchProgress >= requiredProgress ? 'bg-green-600' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, watchProgress)}%` }}
            ></div>
          </div>
          
          {/* Progress milestone indicator */}
          <div className="mt-2 text-xs text-gray-500">
            {watchProgress >= requiredProgress ? (
              <span className="text-green-600 font-medium">✓ Minimum watch time achieved!</span>
            ) : (
              <span>Watch {requiredProgress}% to qualify for reward</span>
            )}
          </div>
        </div>

        {/* Enhanced Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs space-y-1">
            <p><strong>🐛 DEBUG INFO:</strong></p>
            <p>Has Watched: <span className={hasWatched ? 'text-green-600' : 'text-red-600'}>{hasWatched ? 'Yes' : 'No'}</span></p>
            <p>Time Watched: {timeWatched.toFixed(1)}s</p>
            <p>Video Duration: {actualDuration.toFixed(1)}s</p>
            <p>Required Time (30%): {(actualDuration * 0.3).toFixed(1)}s</p>
            <p>Progress: {watchProgress.toFixed(1)}%</p>
            <p>Button Disabled: <span className={isButtonDisabled ? 'text-red-600' : 'text-green-600'}>{isButtonDisabled ? 'Yes' : 'No'}</span></p>
            <p>Is Submitting: {isSubmitting ? 'Yes' : 'No'}</p>
            <p>Category Completed: {categoryState.isCompleted ? 'Yes' : 'No'}</p>
            <p>Video Loaded: {videoLoaded ? 'Yes' : 'No'}</p>
          </div>
        )}

        {/* Reward Info */}
        <div className={`p-4 rounded-lg mb-6 ${hasWatched ? 'bg-green-50' : 'bg-blue-50'}`}>
          <h3 className={`font-medium mb-1 ${hasWatched ? 'text-green-800' : 'text-blue-800'}`}>
            Task Reward
          </h3>
          <p className={hasWatched ? 'text-green-600' : 'text-blue-600'}>
            {hasWatched
              ? <>You&apos;ve qualified for the reward of ${currentVideo.reward.toFixed(2)}! Submit to claim your payment.</>
              : `Watch at least ${requiredProgress}% of the video to qualify for the $${currentVideo.reward.toFixed(2)} reward.`}
          </p>
        </div>

        {/* Enhanced Submit Button with better debugging */}
        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className={`w-full py-3 px-4 rounded-md flex items-center justify-center font-medium transition-colors ${
            isButtonDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : hasWatched ? (
            `Submit to Claim Your $${currentVideo.reward.toFixed(2)} Reward`
          ) : (
            `Watch ${requiredProgress}% to Enable Submission`
          )}
        </button>
        
        {/* Debug button state info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-xs text-center text-gray-500">
            Button State: {isButtonDisabled ? '🔒 Disabled' : '✅ Enabled'} | 
            Reason: {!hasWatched ? 'Not watched enough' : isSubmitting ? 'Submitting' : categoryState.isCompleted ? 'Already completed' : 'Ready to submit'}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default VideoPage