import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { FiCheck, FiClock, FiArrowLeft } from 'react-icons/fi'

const VideoPage = () => {
  const router = useRouter()
  const { videoId } = router.query
  const [hasWatched, setHasWatched] = useState(false)
  const [timeWatched, setTimeWatched] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoryState, setCategoryState] = useState({
    isCompleted: false,
    cooldownEnd: null
  })

  // Video data for each video type
  const videoData = {
    'product-demo': {
      id: 201, // Matching the task ID from your tasks list
      title: "Watch Product Demo",
      reward: 0.30,
      description: "Watch this demonstration of our latest product features and capabilities.",
      duration: 120, // 2 minutes in seconds
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail: "https://sample-videos.com/img/Sample-jpg-image-500kb.jpg"
    },
    'advertisement': {
      id: 202,
      title: "View Advertisement",
      reward: 0.75,
      description: "View this promotional content from our advertising partners.",
      duration: 240, // 4 minutes in seconds
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnail: "https://sample-videos.com/img/Sample-jpg-image-1mb.jpg"
    },
    'educational': {
      id: 203,
      title: "Educational Content",
      reward: 0.50,
      description: "Learn something new with this informative educational video.",
      duration: 180, // 3 minutes in seconds
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail: "https://sample-videos.com/img/Sample-jpg-image-1.5mb.jpg"
    },
    'brand-awareness': {
      id: 204,
      title: "Brand Awareness Video",
      reward: 0.60,
      description: "This video helps build recognition for our partner brands.",
      duration: 150, // 2.5 minutes in seconds
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      thumbnail: "https://sample-videos.com/img/Sample-jpg-image-2mb.jpg"
    }
  }

  // Get current video data
  const currentVideo = videoData[videoId] || videoData['product-demo']

  // Check if video has been watched completely
  useEffect(() => {
    if (timeWatched >= currentVideo.duration * 0.9) { // 90% watched
      setHasWatched(true)
    }
  }, [timeWatched, currentVideo.duration])

  // Load saved state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check both possible storage keys for backward compatibility
      const savedState = 
        JSON.parse(localStorage.getItem(`surveyCategory-${videoId}`)) || 
        JSON.parse(localStorage.getItem(`task-${currentVideo.id}`)) || {
          isCompleted: false,
          cooldownEnd: null
        }
      setCategoryState(savedState)
    }
  }, [videoId, currentVideo.id])

  // Handle cooldown timer
  useEffect(() => {
    if (!categoryState.cooldownEnd) return
    
    const timer = setInterval(() => {
      if (Date.now() >= categoryState.cooldownEnd) {
        const newState = {
          isCompleted: false,
          cooldownEnd: null
        }
        setCategoryState(newState)
        // Update both storage keys
        localStorage.setItem(`surveyCategory-${videoId}`, JSON.stringify(newState))
        localStorage.setItem(`task-${currentVideo.id}`, JSON.stringify(newState))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [categoryState.cooldownEnd, videoId, currentVideo.id])

  const handleTimeUpdate = (e) => {
    setTimeWatched(e.target.currentTime)
  }

  const handleSubmit = async () => {
    if (!hasWatched || categoryState.isCompleted) return
    
    setIsSubmitting(true)
    
    try {
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Set completion state with 5 hour cooldown
      const cooldownHours = 5
      const newCooldownEnd = Date.now() + (cooldownHours * 60 * 60 * 1000)
      
      const newState = {
        isCompleted: true,
        cooldownEnd: newCooldownEnd
      }
      
      setCategoryState(newState)
      // Update both storage keys
      localStorage.setItem(`surveyCategory-${videoId}`, JSON.stringify(newState))
      localStorage.setItem(`task-${currentVideo.id}`, JSON.stringify(newState))
      
      // Redirect to completion page with reward info
      router.push({
        pathname: '/video-complete',
        query: { 
          reward: currentVideo.reward,
          videoTitle: currentVideo.title 
        }
      })
    } catch (error) {
      console.error('Submission error:', error)
      setIsSubmitting(false)
    }
  }

  // Render completed state with cooldown
  if (categoryState.isCompleted && categoryState.cooldownEnd) {
    const remainingHours = Math.ceil((categoryState.cooldownEnd - Date.now()) / (60 * 60 * 1000))
    
    return (
      <Layout title="Video Completed">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 my-8 text-center">
          <div className="mb-6 text-green-500">
            <FiCheck className="inline-block text-5xl" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Video Completed!</h2>
          <p className="text-lg text-blue-600 mb-2">
            +${currentVideo.reward.toFixed(2)} earned!
          </p>
          <p className="text-gray-600 mb-6">
            Thank you for watching &quot;{currentVideo.title}&quot;.
          </p>
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
            <FiArrowLeft className="mr-2" />
            Back to Available Tasks
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={currentVideo.title}>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 my-8">
        <h1 className="text-2xl font-bold mb-4">{currentVideo.title}</h1>
        <p className="text-gray-600 mb-6">{currentVideo.description}</p>
        
        {/* Video Player */}
        <div className="mb-6 rounded-lg overflow-hidden">
          <video
            controls
            className="w-full"
            poster={currentVideo.thumbnail}
            onTimeUpdate={handleTimeUpdate}
          >
            <source src={currentVideo.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Progress Information */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Watched: {Math.floor(timeWatched)}s / {currentVideo.duration}s
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.min(100, Math.floor((timeWatched / currentVideo.duration) * 100))}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ 
                width: `${Math.min(100, (timeWatched / currentVideo.duration) * 100)}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Reward Information */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-blue-800 mb-1">Task Reward</h3>
          <p className="text-blue-600">
            {hasWatched ? (
              <>
                You&apos;ve qualified for the reward of ${currentVideo.reward.toFixed(2)}! 
                Submit to claim your payment.
              </>
            ) : (
              "Watch at least 90% of the video to qualify for the reward."
            )}
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!hasWatched || isSubmitting}
          className={`w-full py-3 px-4 rounded-md flex items-center justify-center ${
            !hasWatched || isSubmitting 
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
          ) : (
            `Submit to Claim Your $${currentVideo.reward.toFixed(2)} Reward`
          )}
        </button>
      </div>
    </Layout>
  )
}

export default VideoPage