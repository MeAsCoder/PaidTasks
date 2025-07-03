import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

const ProductTestingPage = () => {
  const router = useRouter();
  const { productId } = router.query;
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [linkClicked, setLinkClicked] = useState(false);
  const [downloadClicked, setDownloadClicked] = useState(false);


  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  // Determine if Next button should be enabled
  const isNextEnabled = () => {
    const currentStepData = currentTest.steps[currentStep];
    
    // For download step (first step)
    if (currentStep === 0 && currentStepData.type === "instructions") {
      return downloadClicked;
    }
    
    // For question steps
    if (currentStepData.type === "question") {
      return answers[currentStep] !== undefined;
    }
    
    // For other step types
    return true;
  };

  // Product testing tasks data
  const productTestingData = {
    'app-beta': {
      title: "App Beta Testing",
      description: "Test our new application and provide feedback on your experience.",
      steps: [
       {
      type: "instructions",
      content: (
        <p>
          Download and install the beta app from the{' '}
          <a 
                  href="https://play.google.com/store/apps/details?id=com.tap2cash.earntompesa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  onClick={() => setDownloadClicked(true)}
                >
            link
          </a>{' '}
          below. You'll need to complete 5 tasks within the app.
        </p>
      )
    },
      
        {
          type: "question",
          question: "Was the installation process smooth?",
          inputType: "radio",
          options: ["Very smooth", "Somewhat smooth", "Neutral", "Somewhat difficult", "Very difficult"]
        },
        {
          type: "question",
          question: "Which features did you test? (Select all that apply)",
          inputType: "checkbox",
          options: ["Login flow", "Dashboard", "Settings", "Search function", "Payment process", "Notifications"]
        },
        {
          type: "question",
          question: "How would you rate the app performance?",
          inputType: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Very poor", "Excellent"]
        },
        {
          type: "question",
          question: "Did you encounter any bugs or crashes?",
          inputType: "radio",
          options: ["Yes, frequently", "Yes, occasionally", "No"]
        },
        {
          type: "question",
          question: "Describe any bugs you encountered:",
          inputType: "text",
          placeholder: "Please describe the issue...",
          required: false
        },
        {
          type: "question",
          question: "How intuitive was the user interface?",
          inputType: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Not intuitive", "Very intuitive"]
        },
        {
          type: "question",
          question: "Would you recommend this app to others?",
          inputType: "radio",
          options: ["Definitely", "Probably", "Not sure", "Probably not", "Definitely not"]
        },
        {
          type: "question",
          question: "Additional comments or suggestions:",
          inputType: "textarea",
          placeholder: "Your feedback is valuable to us...",
          required: false
        }
      ],
      reward: 5.00,
      estimatedTime: 15
    },
    'physical-product': {
      title: "Physical Product Review",
      description: "Evaluate our physical product and share your honest feedback.",
      steps: [
        {
          type: "instructions",
          content: "You should have received the physical product. Please inspect it carefully before answering."
        },
        {
          type: "question",
          question: "How would you rate the product packaging?",
          inputType: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Poor", "Excellent"]
        },
        {
          type: "question",
          question: "First impressions of the product design?",
          inputType: "radio",
          options: ["Excellent", "Good", "Average", "Below average", "Poor"]
        },
        {
          type: "question",
          question: "Which features did you test? (Select all that apply)",
          inputType: "checkbox",
          options: ["Durability", "Ease of use", "Functionality", "Comfort", "Portability", "Battery life"]
        },
        {
          type: "question",
          question: "How would you rate the build quality?",
          inputType: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Cheap", "Premium"]
        },
        {
          type: "question",
          question: "Did the product meet your expectations?",
          inputType: "radio",
          options: ["Exceeded expectations", "Met expectations", "Below expectations", "Far below expectations"]
        },
        {
          type: "question",
          question: "Upload photos of the product (optional):",
          inputType: "file",
          accept: "image/*",
          multiple: true
        },
        {
          type: "question",
          question: "How likely are you to purchase this product?",
          inputType: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Not likely", "Very likely"]
        },
        {
          type: "question",
          question: "What improvements would you suggest?",
          inputType: "textarea",
          placeholder: "Your suggestions...",
          required: false
        },
        {
          type: "question",
          question: "Final overall rating:",
          inputType: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Poor", "Excellent"]
        }
      ],
      reward: 8.00,
      estimatedTime: "Varies"
    },
    'website-usability': {
      title: "Website Usability Test",
      description: "Evaluate the usability of our website by completing specific tasks.",
      steps: [
        {
          type: "instructions",
          content: "Visit our test website at https://test.example.com and complete the following tasks."
        },
        {
          type: "link",
          url: "https://test.example.com",
          buttonText: "Open Test Website"
        },
        {
          type: "question",
          question: "How easy was it to navigate to the product page?",
          inputType: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Very difficult", "Very easy"]
        },
        {
          type: "question",
          question: "Which issues did you encounter? (Select all that apply)",
          inputType: "checkbox",
          options: ["Broken links", "Slow loading", "Confusing layout", "Unclear instructions", "Mobile responsiveness", "Other"]
        },
        {
          type: "question",
          question: "How would you rate the visual design?",
          inputType: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Poor", "Excellent"]
        },
        {
          type: "question",
          question: "Were you able to complete the checkout process successfully?",
          inputType: "radio",
          options: ["Yes, easily", "Yes, with some difficulty", "No"]
        },
        {
          type: "question",
          question: "How intuitive was the search functionality?",
          inputType: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Not intuitive", "Very intuitive"]
        },
        {
          type: "question",
          question: "Screenshot of any issues (optional):",
          inputType: "file",
          accept: "image/*"
        },
        {
          type: "question",
          question: "What was your overall impression of the website?",
          inputType: "textarea",
          placeholder: "Your comments...",
          required: false
        },
        {
          type: "question",
          question: "How likely are you to return to this website?",
          inputType: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Not likely", "Very likely"]
        }
      ],
      reward: 4.50,
      estimatedTime: 12
    },
    'service-experience': {
      title: "Service Experience Review",
      description: "Evaluate your experience with our customer service team.",
      steps: [
        {
          type: "instructions",
          content: "You'll be interacting with our customer service team. Please document your experience."
        },
        {
          type: "question",
          question: "How would you rate the response time?",
          inputType: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Too slow", "Very fast"]
        },
        {
          type: "question",
          question: "Was your issue resolved satisfactorily?",
          inputType: "radio",
          options: ["Completely resolved", "Partially resolved", "Not resolved"]
        },
        {
          type: "question",
          question: "Which positive aspects did you notice? (Select all that apply)",
          inputType: "checkbox",
          options: ["Polite staff", "Knowledgeable", "Efficient", "Helpful", "Proactive", "None"]
        },
        {
          type: "question",
          question: "How would you rate the communication clarity?",
          inputType: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Unclear", "Very clear"]
        },
        {
          type: "question",
          question: "Did you feel valued as a customer?",
          inputType: "radio",
          options: ["Definitely", "Somewhat", "Not really", "Not at all"]
        },
        {
          type: "question",
          question: "What could be improved about the service?",
          inputType: "textarea",
          placeholder: "Your suggestions...",
          required: false
        },
        {
          type: "question",
          question: "How knowledgeable was the representative?",
          inputType: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Not knowledgeable", "Very knowledgeable"]
        },
        {
          type: "question",
          question: "Would you recommend this service to others?",
          inputType: "radio",
          options: ["Definitely", "Probably", "Not sure", "Probably not", "Definitely not"]
        },
        {
          type: "question",
          question: "Upload any supporting documents (optional):",
          inputType: "file",
          accept: ".pdf,.doc,.docx",
          multiple: true
        },
        {
          type: "question",
          question: "Final overall rating of the service experience:",
          inputType: "scale",
          scale: [1, 2, 3, 4, 5],
          labels: ["Poor", "Excellent"]
        }
      ],
      reward: 6.00,
      estimatedTime: 20
    }
  };

  // Get current product test data
  const currentTest = productTestingData[productId] || productTestingData['app-beta'];
  const currentStepData = currentTest.steps[currentStep];

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentStep < currentTest.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    router.push('/testing-complete');
  };

  const progress = ((currentStep + 1) / currentTest.steps.length) * 100;

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Layout title={currentTest.title}>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 my-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{currentTest.title}</h1>
            <p className="text-gray-600">{currentTest.description}</p>
          </div>
          <div className="bg-blue-50 px-3 py-2 rounded-lg">
            <span className="font-semibold text-blue-700">Reward: ${currentTest.reward.toFixed(2)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {currentTest.steps.length}
            </span>
            <div className="flex space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Time: {formatTime(timeSpent)}
              </span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round(progress)}% Complete
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="mb-8">
          {currentStepData.type === "instructions" && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Instructions</h3>
              <p className="text-blue-700">{currentStepData.content}</p>

            </div>
          )}

          {currentStepData.type === "download" && (
            <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-4">Download Required</h3>
              <a 
                href={currentStepData.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                onClick={() => setDownloadClicked(true)}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {currentStepData.buttonText}
              </a>
            </div>
          )}

          {currentStepData.type === "link" && (
            <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-4">Visit Website</h3>
              <a 
                href={currentStepData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {currentStepData.buttonText}
              </a>
            </div>
          )}

          {currentStepData.type === "question" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {currentStepData.question}
                {currentStepData.required === false && (
                  <span className="text-gray-500 text-sm ml-2">(optional)</span>
                )}
              </h3>

              {currentStepData.inputType === "radio" && (
                <div className="space-y-3">
                  {currentStepData.options.map((option, i) => (
                    <label key={i} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`q-${currentStep}`}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        checked={answers[currentStep] === option}
                        onChange={() => handleAnswer(currentStep, option)}
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentStepData.inputType === "checkbox" && (
                <div className="space-y-3">
                  {currentStepData.options.map((option, i) => (
                    <label key={i} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                        checked={answers[currentStep]?.includes(option) || false}
                        onChange={() => {
                          const currentAnswers = answers[currentStep] || [];
                          const newAnswers = currentAnswers.includes(option)
                            ? currentAnswers.filter(a => a !== option)
                            : [...currentAnswers, option];
                          handleAnswer(currentStep, newAnswers);
                        }}
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentStepData.inputType === "scale" && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>{currentStepData.labels[0]}</span>
                    <span>{currentStepData.labels[1]}</span>
                  </div>
                  <div className="flex justify-between space-x-4">
                    {currentStepData.scale.map(num => (
                      <label key={num} className="flex flex-col items-center">
                        <span className="mb-1">{num}</span>
                        <input
                          type="radio"
                          name={`q-${currentStep}`}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          checked={answers[currentStep] === num.toString()}
                          onChange={() => handleAnswer(currentStep, num.toString())}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {currentStepData.inputType === "text" && (
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={currentStepData.placeholder}
                  value={answers[currentStep] || ''}
                  onChange={(e) => handleAnswer(currentStep, e.target.value)}
                />
              )}

              {currentStepData.inputType === "textarea" && (
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder={currentStepData.placeholder}
                  value={answers[currentStep] || ''}
                  onChange={(e) => handleAnswer(currentStep, e.target.value)}
                />
              )}

              {currentStepData.inputType === "file" && (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Upload files</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only"
                          accept={currentStepData.accept}
                          multiple={currentStepData.multiple}
                          onChange={(e) => handleAnswer(currentStep, e.target.files)}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {currentStepData.accept === "image/*" 
                        ? "PNG, JPG, GIF up to 10MB" 
                        : "PDF, DOC up to 10MB"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-md ${currentStep === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Previous
          </button>

          {currentStep < currentTest.steps.length - 1 ? (
           <button
            onClick={handleNext}
            disabled={!isNextEnabled()}
            className={`px-4 py-2 rounded-md ${
              !isNextEnabled() 
                ? 'bg-blue-300 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md flex items-center ${isSubmitting ? 'bg-green-300 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : 'Submit Review'}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductTestingPage;