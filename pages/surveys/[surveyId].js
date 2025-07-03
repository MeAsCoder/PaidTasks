import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { FiCheck, FiClock, FiLock } from 'react-icons/fi'


const SurveyPage = () => {
  const router = useRouter()
  const { surveyId } = router.query

  // Define all survey questions

const allSurveys = {
    'consumer-preferences': {
      title: "Consumer Preferences Survey",
      questions: [
        {
          id: 1,
          question: "How often do you shop online for consumer goods?",
          type: "radio",
          options: ["Daily", "Weekly", "Monthly", "A few times a year", "Never"]
        },
        {
          id: 2,
          question: "Which of these product categories do you purchase most frequently?",
          type: "checkbox",
          options: ["Electronics", "Clothing", "Home Goods", "Beauty Products", "Groceries"]
        },
        {
          id: 3,
          question: "What's the most important factor when choosing a product?",
          type: "radio",
          options: ["Price", "Brand", "Quality", "Reviews", "Convenience"]
        },
        {
          id: 4,
          question: "How much do you typically spend on online shopping per month?",
          type: "radio",
          options: ["< $50", "$50-$100", "$100-$200", "$200-$500", "> $500"]
        },
        {
          id: 5,
          question: "Which devices do you use for online shopping?",
          type: "checkbox",
          options: ["Smartphone", "Tablet", "Laptop", "Desktop", "Smart TV"]
        },
        {
          id: 6,
          question: "How important are eco-friendly products to you?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Not important", "Very important"]
        },
        {
          id: 7,
          question: "What payment methods do you prefer?",
          type: "checkbox",
          options: ["Credit Card", "PayPal", "Mobile Pay", "Cash on Delivery", "Bank Transfer"]
        },
        {
          id: 8,
          question: "How likely are you to try new product brands?",
          type: "radio",
          options: ["Very likely", "Somewhat likely", "Neutral", "Unlikely", "Never"]
        },
        {
          id: 9,
          question: "What influences you to try a new product?",
          type: "checkbox",
          options: ["Ads", "Influencers", "Friends", "Discounts", "Reviews"]
        },
        {
          id: 10,
          question: "How do you discover new products?",
          type: "checkbox",
          options: ["Social Media", "Search", "Marketplaces", "Emails", "Word of Mouth"]
        },
        {
          id: 11,
          question: "How important is fast delivery?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Not important", "Very important"]
        },
        {
          id: 12,
          question: "Do you read product reviews before purchasing?",
          type: "radio",
          options: ["Always", "Often", "Sometimes", "Rarely", "Never"]
        },
        {
          id: 13,
          question: "What type of product images do you find most helpful?",
          type: "checkbox",
          options: ["Professional", "Lifestyle", "360°", "User Photos", "Comparisons"]
        },
        {
          id: 14,
          question: "How often do you return purchased items?",
          type: "radio",
          options: ["Frequently", "Occasionally", "Rarely", "Never"]
        },
        {
          id: 15,
          question: "What makes you abandon your shopping cart?",
          type: "checkbox",
          options: ["High Shipping", "Checkout Issues", "Errors", "Better Price", "Changed Mind"]
        },
        {
          id: 16,
          question: "How important are loyalty programs?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Not important", "Very important"]
        },
        {
          id: 17,
          question: "Do you prefer local or international brands?",
          type: "radio",
          options: ["Strongly Local", "Slightly Local", "Neutral", "Slightly Intl", "Strongly Intl"]
        },
        {
          id: 18,
          question: "Which social platforms influence purchases most?",
          type: "checkbox",
          options: ["Facebook", "Instagram", "TikTok", "YouTube", "Twitter", "Pinterest"]
        },
        {
          id: 19,
          question: "How satisfied are you with online shopping?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Very dissatisfied", "Very satisfied"]
        },
        {
          id: 20,
          question: "What could retailers improve?",
          type: "text",
          placeholder: "Your suggestions..."
        },
        {
          id: 21,
          question: "How do you feel about subscription services?",
          type: "radio",
          options: ["Love them", "Like them", "Neutral", "Dislike them", "Hate them"]
        },
        {
          id: 22,
          question: "What time of day do you typically shop online?",
          type: "radio",
          options: ["Morning", "Afternoon", "Evening", "Night", "Any time"]
        }
      ]
    },
    'tech-usage': {
      title: "Tech Usage Questionnaire",
      questions: [
        {
          id: 1,
          question: "How many hours daily do you spend on tech devices?",
          type: "radio",
          options: ["<1", "1-3", "3-5", "5-8", "8+"]
        },
        {
          id: 2,
          question: "Which devices do you use daily?",
          type: "checkbox",
          options: ["Smartphone", "Laptop", "Tablet", "Desktop", "Smartwatch", "Smart TV"]
        },
        {
          id: 3,
          question: "What's your primary smartphone operating system?",
          type: "radio",
          options: ["iOS", "Android", "Other", "Don't use smartphone"]
        },
        {
          id: 4,
          question: "How often do you upgrade your devices?",
          type: "radio",
          options: ["Every year", "2-3 years", "4-5 years", "When broken", "Never"]
        },
        {
          id: 5,
          question: "Which tech services do you subscribe to?",
          type: "checkbox",
          options: ["Streaming", "Cloud Storage", "VPN", "Software", "Gaming", "None"]
        },
        {
          id: 6,
          question: "How comfortable are you with new technology?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Not comfortable", "Very comfortable"]
        },
        {
          id: 7,
          question: "What tech devices do you own?",
          type: "checkbox",
          options: ["Smartphone", "Laptop", "Tablet", "Smartwatch", "Smart Speaker", "Gaming Console"]
        },
        {
          id: 8,
          question: "How important is tech in your daily life?",
          type: "radio",
          options: ["Essential", "Very important", "Somewhat important", "Not important", "Avoid it"]
        },
        {
          id: 9,
          question: "Which activities do you primarily use tech for?",
          type: "checkbox",
          options: ["Work", "Entertainment", "Communication", "Shopping", "Learning", "Health"]
        },
        {
          id: 10,
          question: "How often do you experience tech frustration?",
          type: "radio",
          options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"]
        },
        {
          id: 11,
          question: "How concerned are you about data privacy?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Not concerned", "Very concerned"]
        },
        {
          id: 12,
          question: "Do you use voice assistants?",
          type: "radio",
          options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"]
        },
        {
          id: 13,
          question: "Which smart home devices do you use?",
          type: "checkbox",
          options: ["Lights", "Thermostat", "Security", "Speakers", "TV", "None"]
        },
        {
          id: 14,
          question: "How many hours of screen time daily?",
          type: "radio",
          options: ["<2", "2-4", "4-6", "6-8", "8+"]
        },
        {
          id: 15,
          question: "What frustrates you most about technology?",
          type: "checkbox",
          options: ["Complexity", "Cost", "Updates", "Privacy", "Reliability", "Battery Life"]
        },
        {
          id: 16,
          question: "How often do you experience tech fatigue?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Never", "Constantly"]
        },
        {
          id: 17,
          question: "Preferred method of tech support?",
          type: "radio",
          options: ["Self-service", "Online chat", "Phone", "In-person", "Friends/Family"]
        },
        {
          id: 18,
          question: "Which emerging tech interests you most?",
          type: "checkbox",
          options: ["AI", "VR/AR", "IoT", "Blockchain", "5G", "Robotics"]
        },
        {
          id: 19,
          question: "How satisfied are you with your tech setup?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Very dissatisfied", "Very satisfied"]
        },
        {
          id: 20,
          question: "What tech improvements would you like to see?",
          type: "text",
          placeholder: "Your suggestions..."
        },
        {
          id: 21,
          question: "Do you consider yourself an early tech adopter?",
          type: "radio",
          options: ["Yes, always", "Sometimes", "Neutral", "Rarely", "Never"]
        },
        {
          id: 22,
          question: "How often do you backup your data?",
          type: "radio",
          options: ["Daily", "Weekly", "Monthly", "Yearly", "Never"]
        }
      ]
    },
    'social-media': {
      title: "Social Media Habits Survey",
      questions: [
        {
          id: 1,
          question: "Which platforms do you use regularly?",
          type: "checkbox",
          options: ["Facebook", "Instagram", "Twitter", "TikTok", "LinkedIn", "YouTube", "Pinterest"]
        },
        {
          id: 2,
          question: "How much time daily on social media?",
          type: "radio",
          options: ["<30 min", "30-60 min", "1-2 hrs", "2-4 hrs", "4+ hrs"]
        },
        {
          id: 3,
          question: "Main reason for using social media?",
          type: "radio",
          options: ["Connect", "News", "Entertainment", "Work", "Shopping", "Other"]
        },
        {
          id: 4,
          question: "How often do you post content?",
          type: "radio",
          options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"]
        },
        {
          id: 5,
          question: "Which content types do you engage with?",
          type: "checkbox",
          options: ["Photos", "Videos", "Stories", "Live", "Articles", "Memes"]
        },
        {
          id: 6,
          question: "How authentic do you find social media?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Fake", "Authentic"]
        },
        {
          id: 7,
          question: "Have you ever taken a social media break?",
          type: "radio",
          options: ["Yes", "No", "Considering it"]
        },
        {
          id: 8,
          question: "How does social media affect your mood?",
          type: "radio",
          options: ["Positive", "Neutral", "Negative", "Mixed"]
        },
        {
          id: 9,
          question: "Which platforms influence purchases?",
          type: "checkbox",
          options: ["Instagram", "Pinterest", "TikTok", "YouTube", "Facebook", "None"]
        },
        {
          id: 10,
          question: "How often do you compare yourself to others?",
          type: "radio",
          options: ["Often", "Sometimes", "Rarely", "Never"]
        },
        {
          id: 11,
          question: "How concerned are you about privacy?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Not concerned", "Very concerned"]
        },
        {
          id: 12,
          question: "Do you use social media for work?",
          type: "radio",
          options: ["Yes, primarily", "Yes, sometimes", "No"]
        },
        {
          id: 13,
          question: "Which features do you use most?",
          type: "checkbox",
          options: ["Feed", "Stories", "DM", "Groups", "Marketplace", "Events"]
        },
        {
          id: 14,
          question: "How often do you check social media?",
          type: "radio",
          options: ["Hourly", "Several times/day", "Daily", "Weekly", "Rarely"]
        },
        {
          id: 15,
          question: "What annoys you most about social media?",
          type: "checkbox",
          options: ["Ads", "Fake News", "Toxicity", "Algorithm", "Privacy", "Time Waste"]
        },
        {
          id: 16,
          question: "How addicted do you feel to social media?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Not at all", "Very addicted"]
        },
        {
          id: 17,
          question: "Do you follow influencers?",
          type: "radio",
          options: ["Many", "A few", "None"]
        },
        {
          id: 18,
          question: "Have you ever been cyberbullied?",
          type: "radio",
          options: ["Yes", "No", "Not sure"]
        },
        {
          id: 19,
          question: "Overall satisfaction with social media?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Very dissatisfied", "Very satisfied"]
        },
        {
          id: 20,
          question: "What would improve your social media experience?",
          type: "text",
          placeholder: "Your suggestions..."
        },
        {
          id: 21,
          question: "Do you use social media more on mobile or desktop?",
          type: "radio",
          options: ["Mostly mobile", "Mostly desktop", "Equal", "Only mobile", "Only desktop"]
        },
        {
          id: 22,
          question: "How often do you adjust privacy settings?",
          type: "radio",
          options: ["Regularly", "Occasionally", "Never"]
        }
      ]
    },
    'shopping-behavior': {
      title: "Shopping Behavior Study",
      questions: [
        {
          id: 1,
          question: "What factors influence your purchases most?",
          type: "checkbox",
          options: ["Price", "Quality", "Brand", "Reviews", "Convenience", "Ethics"]
        },
        {
          id: 2,
          question: "How often do you impulse buy?",
          type: "radio",
          options: ["Often", "Sometimes", "Rarely", "Never"]
        },
        {
          id: 3,
          question: "Preferred shopping method?",
          type: "radio",
          options: ["Online", "In-store", "Both equally"]
        },
        {
          id: 4,
          question: "How do you research before buying?",
          type: "checkbox",
          options: ["Google", "Reviews", "Ask friends", "Store visits", "Don't research"]
        },
        {
          id: 5,
          question: "What makes you choose one store over another?",
          type: "checkbox",
          options: ["Prices", "Selection", "Location", "Service", "Loyalty", "Ethics"]
        },
        {
          id: 6,
          question: "How price sensitive are you?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Not sensitive", "Very sensitive"]
        },
        {
          id: 7,
          question: "Do you use shopping lists?",
          type: "radio",
          options: ["Always", "Often", "Sometimes", "Rarely", "Never"]
        },
        {
          id: 8,
          question: "How often do you use coupons/discounts?",
          type: "radio",
          options: ["Always", "Often", "Sometimes", "Rarely", "Never"]
        },
        {
          id: 9,
          question: "What makes you try new stores?",
          type: "checkbox",
          options: ["Ads", "Recommendations", "Location", "Sales", "Curiosity"]
        },
        {
          id: 10,
          question: "How often do you return purchases?",
          type: "radio",
          options: ["Often", "Sometimes", "Rarely", "Never"]
        },
        {
          id: 11,
          question: "How important is store ambiance?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Not important", "Very important"]
        },
        {
          id: 12,
          question: "Do you shop more during sales?",
          type: "radio",
          options: ["Yes", "No", "Sometimes"]
        },
        {
          id: 13,
          question: "Which payment methods do you prefer?",
          type: "checkbox",
          options: ["Cash", "Card", "Mobile", "Credit", "Installments"]
        },
        {
          id: 14,
          question: "How often do you browse without buying?",
          type: "radio",
          options: ["Often", "Sometimes", "Rarely", "Never"]
        },
        {
          id: 15,
          question: "What frustrates you about shopping?",
          type: "checkbox",
          options: ["Prices", "Selection", "Service", "Crowds", "Checkout", "Stock"]
        },
        {
          id: 16,
          question: "How loyal are you to brands?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Not loyal", "Very loyal"]
        },
        {
          id: 17,
          question: "Do you prefer name brands or generics?",
          type: "radio",
          options: ["Always name", "Usually name", "Either", "Usually generic", "Always generic"]
        },
        {
          id: 18,
          question: "How does social media influence shopping?",
          type: "radio",
          options: ["Heavily", "Somewhat", "Minimal", "None"]
        },
        {
          id: 19,
          question: "Overall shopping satisfaction?",
          type: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Very dissatisfied", "Very satisfied"]
        },
        {
          id: 20,
          question: "What would improve your shopping experience?",
          type: "text",
          placeholder: "Your suggestions..."
        },
        {
          id: 21,
          question: "Do you enjoy shopping or see it as a chore?",
          type: "radio",
          options: ["Love it", "Like it", "Neutral", "Dislike it", "Hate it"]
        },
        {
          id: 22,
          question: "How often do you shop secondhand?",
          type: "radio",
          options: ["Regularly", "Occasionally", "Rarely", "Never"]
        }
      ]
    }
  }




  // Get the current survey based on surveyId
  const currentSurvey = allSurveys[surveyId] || allSurveys['consumer-preferences']
  const surveyQuestions = currentSurvey.questions

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canProceed, setCanProceed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60) // 1 minute delay
  const [isCompleted, setIsCompleted] = useState(false)

  const [categoryState, setCategoryState] = useState({
        isCompleted: false,
        coolDownEnd : null
  })
  const [cooldownEnd, setCooldownEnd] = useState(null)



  useEffect(() => {
    const savedState = JSON.parse(localStorage.getItem(`surveyCategory-${surveyId}`)) || {
      isCompleted: false,
      cooldownEnd: null
    }
    setCategoryState(savedState)
  }, [surveyId])

  // Handle question delay timer
  useEffect(() => {
    if (categoryState.isCompleted) return
    
    setCanProceed(false)
    setTimeLeft(60)
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanProceed(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestion, categoryState.isCompleted])

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
        localStorage.setItem(`surveyCategory-${surveyId}`, JSON.stringify(newState))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [categoryState.cooldownEnd, surveyId])


  // Check localStorage for existing completion state
  useEffect(() => {
    const surveyState = JSON.parse(localStorage.getItem(`surveyState-${surveyId}`)) || {}
    setIsCompleted(surveyState.isCompleted || false)
    setCooldownEnd(surveyState.cooldownEnd || null)
  }, [surveyId])

  // Handle question delay timer
  useEffect(() => {
    if (isCompleted) return
    
    setCanProceed(false)
    setTimeLeft(0)
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanProceed(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestion, isCompleted])

  // Handle cooldown timer
  useEffect(() => {
    if (!cooldownEnd) return
    
    const timer = setInterval(() => {
      if (Date.now() >= cooldownEnd) {
        setCooldownEnd(null)
        localStorage.setItem(`surveyState-${surveyId}`, JSON.stringify({
          isCompleted: false,
          cooldownEnd: null
        }))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldownEnd, surveyId])




 

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }


  const handleNext = () => {
    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API submission
    await new Promise(resolve => setTimeout(resolve, 1500))

// Set completion state with 10 minute cooldown
    const newCooldownEnd = Date.now() + (10 * 60 * 1000)
    setCooldownEnd(newCooldownEnd)
    setIsCompleted(true)
    
    // Save to localStorage
    localStorage.setItem(`surveyState-${surveyId}`, JSON.stringify({
      isCompleted: true,
      cooldownEnd: newCooldownEnd
    }))

    router.push('/survey-complete')
  }

  const progress = ((currentQuestion + 1) / surveyQuestions.length) * 100


    // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  if (isCompleted || cooldownEnd) {
    const remainingCooldown = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 60000))
  }


  return (
    <Layout title={currentSurvey.title}>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 my-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of {surveyQuestions.length}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Current Question */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            {surveyQuestions[currentQuestion].question}
          </h3>

          {/* Question Input */}
          {surveyQuestions[currentQuestion].type === 'radio' && (
            <div className="space-y-3">
              {surveyQuestions[currentQuestion].options.map((option, i) => (
                <label key={i} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`q-${surveyQuestions[currentQuestion].id}`}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    checked={answers[surveyQuestions[currentQuestion].id] === option}
                    onChange={() => handleAnswer(surveyQuestions[currentQuestion].id, option)}
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {surveyQuestions[currentQuestion].type === 'checkbox' && (
            <div className="space-y-3">
              {surveyQuestions[currentQuestion].options.map((option, i) => (
                <label key={i} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                    checked={answers[surveyQuestions[currentQuestion].id]?.includes(option) || false}
                    onChange={() => {
                      const currentAnswers = answers[surveyQuestions[currentQuestion].id] || []
                      const newAnswers = currentAnswers.includes(option)
                        ? currentAnswers.filter(a => a !== option)
                        : [...currentAnswers, option]
                      handleAnswer(surveyQuestions[currentQuestion].id, newAnswers)
                    }}
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {surveyQuestions[currentQuestion].type === 'scale' && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>{surveyQuestions[currentQuestion].labels?.[0] || 'Low'}</span>
                <span>{surveyQuestions[currentQuestion].labels?.[1] || 'High'}</span>
              </div>
              <div className="flex justify-between space-x-4">
                {surveyQuestions[currentQuestion].scale.map(num => (
                  <label key={num} className="flex flex-col items-center">
                    <span className="mb-1">{num}</span>
                    <input
                      type="radio"
                      name={`q-${surveyQuestions[currentQuestion].id}`}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      checked={answers[surveyQuestions[currentQuestion].id] === num.toString()}
                      onChange={() => handleAnswer(surveyQuestions[currentQuestion].id, num.toString())}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {surveyQuestions[currentQuestion].type === 'text' && (
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder={surveyQuestions[currentQuestion].placeholder}
              value={answers[surveyQuestions[currentQuestion].id] || ''}
              onChange={(e) => handleAnswer(surveyQuestions[currentQuestion].id, e.target.value)}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`px-4 py-2 rounded-md ${currentQuestion === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Previous
          </button>

          {!canProceed && (
            <div className="flex items-center text-orange-600">
              <FiClock className="mr-2" />
              Submitting question in {formatTime(timeLeft)}
            </div>
          )}

          {currentQuestion < surveyQuestions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed || !answers[surveyQuestions[currentQuestion].id]}
              className={`px-4 py-2 rounded-md flex items-center ${!canProceed || !answers[surveyQuestions[currentQuestion].id] ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !answers[surveyQuestions[currentQuestion].id]}
              className={`px-4 py-2 rounded-md flex items-center ${isSubmitting || !answers[surveyQuestions[currentQuestion].id] ? 'bg-green-300 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : 'Submit Survey'}
            </button>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default SurveyPage