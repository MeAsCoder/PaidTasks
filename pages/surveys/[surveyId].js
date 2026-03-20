import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { FiCheck, FiClock, FiLock, FiArrowLeft, FiArrowRight, FiDollarSign } from 'react-icons/fi'
import { push, ref, set } from 'firebase/database'
import { database } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { creditEarnings } from '@/lib/earningsService'

// ─── Survey Data ──────────────────────────────────────────────────────────────
const allSurveys = {
  'consumer-preferences': {
    title: "Consumer Preferences Survey", rewardUsd: 5.00, category: 'consumer-preferences',
    questions: [
      { id: 1,  question: "How often do you shop online for consumer goods?", type: "radio", options: ["Daily", "Weekly", "Monthly", "A few times a year", "Never"] },
      { id: 2,  question: "Which product categories do you purchase most frequently?", type: "checkbox", options: ["Electronics", "Clothing", "Home Goods", "Beauty Products", "Groceries"] },
      { id: 3,  question: "What's the most important factor when choosing a product?", type: "radio", options: ["Price", "Brand", "Quality", "Reviews", "Convenience"] },
      { id: 4,  question: "How much do you typically spend on online shopping per month?", type: "radio", options: ["< $50", "$50-$100", "$100-$200", "$200-$500", "> $500"] },
      { id: 5,  question: "Which devices do you use for online shopping?", type: "checkbox", options: ["Smartphone", "Tablet", "Laptop", "Desktop", "Smart TV"] },
      { id: 6,  question: "How important are eco-friendly products to you?", type: "scale", scale: [1,2,3,4,5], labels: ["Not important", "Very important"] },
      { id: 7,  question: "What payment methods do you prefer?", type: "checkbox", options: ["Credit Card", "PayPal", "Mobile Pay", "Cash on Delivery", "Bank Transfer"] },
      { id: 8,  question: "How likely are you to try new product brands?", type: "radio", options: ["Very likely", "Somewhat likely", "Neutral", "Unlikely", "Never"] },
      { id: 9,  question: "What influences you to try a new product?", type: "checkbox", options: ["Ads", "Influencers", "Friends", "Discounts", "Reviews"] },
      { id: 10, question: "How do you discover new products?", type: "checkbox", options: ["Social Media", "Search", "Marketplaces", "Emails", "Word of Mouth"] },
      { id: 11, question: "How important is fast delivery?", type: "scale", scale: [1,2,3,4,5], labels: ["Not important", "Very important"] },
      { id: 12, question: "Do you read product reviews before purchasing?", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { id: 13, question: "What type of product images do you find most helpful?", type: "checkbox", options: ["Professional", "Lifestyle", "360°", "User Photos", "Comparisons"] },
      { id: 14, question: "How often do you return purchased items?", type: "radio", options: ["Frequently", "Occasionally", "Rarely", "Never"] },
      { id: 15, question: "What makes you abandon your shopping cart?", type: "checkbox", options: ["High Shipping", "Checkout Issues", "Errors", "Better Price", "Changed Mind"] },
      { id: 16, question: "How important are loyalty programs?", type: "scale", scale: [1,2,3,4,5], labels: ["Not important", "Very important"] },
      { id: 17, question: "Do you prefer local or international brands?", type: "radio", options: ["Strongly Local", "Slightly Local", "Neutral", "Slightly Intl", "Strongly Intl"] },
      { id: 18, question: "Which social platforms influence purchases most?", type: "checkbox", options: ["Facebook", "Instagram", "TikTok", "YouTube", "Twitter", "Pinterest"] },
      { id: 19, question: "How satisfied are you with online shopping?", type: "scale", scale: [1,2,3,4,5], labels: ["Very dissatisfied", "Very satisfied"] },
      { id: 20, question: "What could retailers improve?", type: "text", placeholder: "Your suggestions..." },
      { id: 21, question: "How do you feel about subscription services?", type: "radio", options: ["Love them", "Like them", "Neutral", "Dislike them", "Hate them"] },
      { id: 22, question: "What time of day do you typically shop online?", type: "radio", options: ["Morning", "Afternoon", "Evening", "Night", "Any time"] },
    ],
  },
  'tech-usage': {
    title: "Tech Usage Questionnaire", rewardUsd: 3.50, category: 'tech-usage',
    questions: [
      { id: 1,  question: "How many hours daily do you spend on tech devices?", type: "radio", options: ["<1", "1-3", "3-5", "5-8", "8+"] },
      { id: 2,  question: "Which devices do you use daily?", type: "checkbox", options: ["Smartphone", "Laptop", "Tablet", "Desktop", "Smartwatch", "Smart TV"] },
      { id: 3,  question: "What's your primary smartphone operating system?", type: "radio", options: ["iOS", "Android", "Other", "Don't use smartphone"] },
      { id: 4,  question: "How often do you upgrade your devices?", type: "radio", options: ["Every year", "2-3 years", "4-5 years", "When broken", "Never"] },
      { id: 5,  question: "Which tech services do you subscribe to?", type: "checkbox", options: ["Streaming", "Cloud Storage", "VPN", "Software", "Gaming", "None"] },
      { id: 6,  question: "How comfortable are you with new technology?", type: "scale", scale: [1,2,3,4,5], labels: ["Not comfortable", "Very comfortable"] },
      { id: 7,  question: "What tech devices do you own?", type: "checkbox", options: ["Smartphone", "Laptop", "Tablet", "Smartwatch", "Smart Speaker", "Gaming Console"] },
      { id: 8,  question: "How important is tech in your daily life?", type: "radio", options: ["Essential", "Very important", "Somewhat important", "Not important", "Avoid it"] },
      { id: 9,  question: "Which activities do you primarily use tech for?", type: "checkbox", options: ["Work", "Entertainment", "Communication", "Shopping", "Learning", "Health"] },
      { id: 10, question: "How often do you experience tech frustration?", type: "radio", options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"] },
      { id: 11, question: "How concerned are you about data privacy?", type: "scale", scale: [1,2,3,4,5], labels: ["Not concerned", "Very concerned"] },
      { id: 12, question: "Do you use voice assistants?", type: "radio", options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"] },
      { id: 13, question: "Which smart home devices do you use?", type: "checkbox", options: ["Lights", "Thermostat", "Security", "Speakers", "TV", "None"] },
      { id: 14, question: "How many hours of screen time daily?", type: "radio", options: ["<2", "2-4", "4-6", "6-8", "8+"] },
      { id: 15, question: "What frustrates you most about technology?", type: "checkbox", options: ["Complexity", "Cost", "Updates", "Privacy", "Reliability", "Battery Life"] },
      { id: 16, question: "How often do you experience tech fatigue?", type: "scale", scale: [1,2,3,4,5], labels: ["Never", "Constantly"] },
      { id: 17, question: "Preferred method of tech support?", type: "radio", options: ["Self-service", "Online chat", "Phone", "In-person", "Friends/Family"] },
      { id: 18, question: "Which emerging tech interests you most?", type: "checkbox", options: ["AI", "VR/AR", "IoT", "Blockchain", "5G", "Robotics"] },
      { id: 19, question: "How satisfied are you with your tech setup?", type: "scale", scale: [1,2,3,4,5], labels: ["Very dissatisfied", "Very satisfied"] },
      { id: 20, question: "What tech improvements would you like to see?", type: "text", placeholder: "Your suggestions..." },
      { id: 21, question: "Do you consider yourself an early tech adopter?", type: "radio", options: ["Yes, always", "Sometimes", "Neutral", "Rarely", "Never"] },
      { id: 22, question: "How often do you backup your data?", type: "radio", options: ["Daily", "Weekly", "Monthly", "Yearly", "Never"] },
    ],
  },
  'social-media': {
    title: "Social Media Habits Survey", rewardUsd: 4.00, category: 'social-media',
    questions: [
      { id: 1,  question: "Which platforms do you use regularly?", type: "checkbox", options: ["Facebook", "Instagram", "Twitter", "TikTok", "LinkedIn", "YouTube", "Pinterest"] },
      { id: 2,  question: "How much time daily on social media?", type: "radio", options: ["<30 min", "30-60 min", "1-2 hrs", "2-4 hrs", "4+ hrs"] },
      { id: 3,  question: "Main reason for using social media?", type: "radio", options: ["Connect", "News", "Entertainment", "Work", "Shopping", "Other"] },
      { id: 4,  question: "How often do you post content?", type: "radio", options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"] },
      { id: 5,  question: "Which content types do you engage with?", type: "checkbox", options: ["Photos", "Videos", "Stories", "Live", "Articles", "Memes"] },
      { id: 6,  question: "How authentic do you find social media?", type: "scale", scale: [1,2,3,4,5], labels: ["Fake", "Authentic"] },
      { id: 7,  question: "Have you ever taken a social media break?", type: "radio", options: ["Yes", "No", "Considering it"] },
      { id: 8,  question: "How does social media affect your mood?", type: "radio", options: ["Positive", "Neutral", "Negative", "Mixed"] },
      { id: 9,  question: "Which platforms influence purchases?", type: "checkbox", options: ["Instagram", "Pinterest", "TikTok", "YouTube", "Facebook", "None"] },
      { id: 10, question: "How often do you compare yourself to others?", type: "radio", options: ["Often", "Sometimes", "Rarely", "Never"] },
      { id: 11, question: "How concerned are you about privacy?", type: "scale", scale: [1,2,3,4,5], labels: ["Not concerned", "Very concerned"] },
      { id: 12, question: "Do you use social media for work?", type: "radio", options: ["Yes, primarily", "Yes, sometimes", "No"] },
      { id: 13, question: "Which features do you use most?", type: "checkbox", options: ["Feed", "Stories", "DM", "Groups", "Marketplace", "Events"] },
      { id: 14, question: "How often do you check social media?", type: "radio", options: ["Hourly", "Several times/day", "Daily", "Weekly", "Rarely"] },
      { id: 15, question: "What annoys you most about social media?", type: "checkbox", options: ["Ads", "Fake News", "Toxicity", "Algorithm", "Privacy", "Time Waste"] },
      { id: 16, question: "How addicted do you feel to social media?", type: "scale", scale: [1,2,3,4,5], labels: ["Not at all", "Very addicted"] },
      { id: 17, question: "Do you follow influencers?", type: "radio", options: ["Many", "A few", "None"] },
      { id: 18, question: "Have you ever been cyberbullied?", type: "radio", options: ["Yes", "No", "Not sure"] },
      { id: 19, question: "Overall satisfaction with social media?", type: "scale", scale: [1,2,3,4,5], labels: ["Very dissatisfied", "Very satisfied"] },
      { id: 20, question: "What would improve your social media experience?", type: "text", placeholder: "Your suggestions..." },
      { id: 21, question: "Do you use social media more on mobile or desktop?", type: "radio", options: ["Mostly mobile", "Mostly desktop", "Equal", "Only mobile", "Only desktop"] },
      { id: 22, question: "How often do you adjust privacy settings?", type: "radio", options: ["Regularly", "Occasionally", "Never"] },
    ],
  },
  'shopping-behavior': {
    title: "Shopping Behavior Study", rewardUsd: 6.50, category: 'shopping-behavior',
    questions: [
      { id: 1,  question: "What factors influence your purchases most?", type: "checkbox", options: ["Price", "Quality", "Brand", "Reviews", "Convenience", "Ethics"] },
      { id: 2,  question: "How often do you impulse buy?", type: "radio", options: ["Often", "Sometimes", "Rarely", "Never"] },
      { id: 3,  question: "Preferred shopping method?", type: "radio", options: ["Online", "In-store", "Both equally"] },
      { id: 4,  question: "How do you research before buying?", type: "checkbox", options: ["Google", "Reviews", "Ask friends", "Store visits", "Don't research"] },
      { id: 5,  question: "What makes you choose one store over another?", type: "checkbox", options: ["Prices", "Selection", "Location", "Service", "Loyalty", "Ethics"] },
      { id: 6,  question: "How price sensitive are you?", type: "scale", scale: [1,2,3,4,5], labels: ["Not sensitive", "Very sensitive"] },
      { id: 7,  question: "Do you use shopping lists?", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { id: 8,  question: "How often do you use coupons/discounts?", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { id: 9,  question: "What makes you try new stores?", type: "checkbox", options: ["Ads", "Recommendations", "Location", "Sales", "Curiosity"] },
      { id: 10, question: "How often do you return purchases?", type: "radio", options: ["Often", "Sometimes", "Rarely", "Never"] },
      { id: 11, question: "How important is store ambiance?", type: "scale", scale: [1,2,3,4,5], labels: ["Not important", "Very important"] },
      { id: 12, question: "Do you shop more during sales?", type: "radio", options: ["Yes", "No", "Sometimes"] },
      { id: 13, question: "Which payment methods do you prefer?", type: "checkbox", options: ["Cash", "Card", "Mobile", "Credit", "Installments"] },
      { id: 14, question: "How often do you browse without buying?", type: "radio", options: ["Often", "Sometimes", "Rarely", "Never"] },
      { id: 15, question: "What frustrates you about shopping?", type: "checkbox", options: ["Prices", "Selection", "Service", "Crowds", "Checkout", "Stock"] },
      { id: 16, question: "How loyal are you to brands?", type: "scale", scale: [1,2,3,4,5], labels: ["Not loyal", "Very loyal"] },
      { id: 17, question: "Do you prefer name brands or generics?", type: "radio", options: ["Always name", "Usually name", "Either", "Usually generic", "Always generic"] },
      { id: 18, question: "How does social media influence shopping?", type: "radio", options: ["Heavily", "Somewhat", "Minimal", "None"] },
      { id: 19, question: "Overall shopping satisfaction?", type: "scale", scale: [1,2,3,4,5], labels: ["Very dissatisfied", "Very satisfied"] },
      { id: 20, question: "What would improve your shopping experience?", type: "text", placeholder: "Your suggestions..." },
      { id: 21, question: "Do you enjoy shopping or see it as a chore?", type: "radio", options: ["Love it", "Like it", "Neutral", "Dislike it", "Hate it"] },
      { id: 22, question: "How often do you shop secondhand?", type: "radio", options: ["Regularly", "Occasionally", "Rarely", "Never"] },
    ],
  },
};

const formatUsd = (n) => `$${Number(n).toFixed(2)}`;

const SurveyPage = () => {
  const router = useRouter();
  const { surveyId } = router.query;
  const { currentUser } = useAuth();

  const currentSurvey   = allSurveys[surveyId] || allSurveys['consumer-preferences'];
  const surveyQuestions = currentSurvey.questions;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers]                 = useState({});
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [canProceed, setCanProceed]           = useState(false);
  const [timeLeft, setTimeLeft]               = useState(15);
  const [validationError, setValidationError] = useState('');
  const [categoryState, setCategoryState]     = useState({ isCompleted: false, cooldownEnd: null });

  useEffect(() => {
    if (!surveyId) return;
    const saved = JSON.parse(localStorage.getItem(`surveyCategory-${surveyId}`)) || { isCompleted: false, cooldownEnd: null };
    setCategoryState(saved);
  }, [surveyId]);

  useEffect(() => {
    if (categoryState.isCompleted) return;
    setCanProceed(false);
    setTimeLeft(15);
    setValidationError('');
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); setCanProceed(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuestion, categoryState.isCompleted]);

  useEffect(() => {
    if (!categoryState.cooldownEnd) return;
    const t = setInterval(() => {
      if (Date.now() >= categoryState.cooldownEnd) {
        const s = { isCompleted: false, cooldownEnd: null };
        setCategoryState(s);
        localStorage.setItem(`surveyCategory-${surveyId}`, JSON.stringify(s));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [categoryState.cooldownEnd, surveyId]);

  // ── Submit via earningsService ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateCurrentQuestion()) return;
    if (!currentUser?.uid) { alert('Please log in to submit the survey'); return; }
    setIsSubmitting(true);
    try {
      // Single write via unified earningsService → usersweb/{uid}
      await creditEarnings({
        uid:       currentUser.uid,
        taskId:    `survey-${currentSurvey.category}`,
        taskTitle: currentSurvey.title,
        rewardUsd: currentSurvey.rewardUsd,
        taskType:  'survey',
      });

      // Log answers for analytics (separate collection, not earnings)
      await set(push(ref(database, 'surveyCompletions')), {
        userId:      currentUser.uid,
        surveyId,
        category:    currentSurvey.category,
        surveyTitle: currentSurvey.title,
        completedAt: new Date().toISOString(),
        answers,
        rewardUsd:   currentSurvey.rewardUsd,
      });

      const newState = { isCompleted: true, cooldownEnd: Date.now() + 5 * 60 * 60 * 1000 };
      setCategoryState(newState);
      localStorage.setItem(`surveyCategory-${surveyId}`, JSON.stringify(newState));

      router.push({ pathname: '/survey-complete', query: { reward: currentSurvey.rewardUsd, surveyName: currentSurvey.title } });
    } catch (err) {
      console.error('Survey submission error:', err);
      alert('Failed to submit. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleAnswer = (questionId, answer) => { setAnswers(prev => ({ ...prev, [questionId]: answer })); setValidationError(''); };
  const validateCurrentQuestion = () => {
    const q = surveyQuestions[currentQuestion];
    if (q.required && !answers[q.id]) { setValidationError('This question is required'); return false; }
    return true;
  };
  const handleNext     = () => { if (!validateCurrentQuestion()) return; if (currentQuestion < surveyQuestions.length - 1) setCurrentQuestion(p => p + 1); };
  const handlePrevious = () => { if (currentQuestion > 0) setCurrentQuestion(p => p - 1); };
  const formatTime     = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const progress       = ((currentQuestion + 1) / surveyQuestions.length) * 100;

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'radio': return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {question.options.map((opt, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${answers[question.id] === opt ? '#E8541A' : '#ececec'}`, background: answers[question.id] === opt ? '#fff7ed' : '#fafafa', transition: 'all 0.15s' }}>
              <input type="radio" name={`q-${question.id}`} style={{ accentColor: '#E8541A', width: 16, height: 16, flexShrink: 0 }} checked={answers[question.id] === opt} onChange={() => handleAnswer(question.id, opt)} />
              <span style={{ fontSize: 14, color: answers[question.id] === opt ? '#111' : '#555', fontWeight: answers[question.id] === opt ? 600 : 400 }}>{opt}</span>
            </label>
          ))}
        </div>
      );
      case 'checkbox': return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {question.options.map((opt, i) => {
            const checked = answers[question.id]?.includes(opt) || false;
            return (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${checked ? '#E8541A' : '#ececec'}`, background: checked ? '#fff7ed' : '#fafafa', transition: 'all 0.15s' }}>
                <input type="checkbox" style={{ accentColor: '#E8541A', width: 16, height: 16, flexShrink: 0 }} checked={checked} onChange={() => { const cur = answers[question.id] || []; handleAnswer(question.id, cur.includes(opt) ? cur.filter(a => a !== opt) : [...cur, opt]); }} />
                <span style={{ fontSize: 14, color: checked ? '#111' : '#555', fontWeight: checked ? 600 : 400 }}>{opt}</span>
              </label>
            );
          })}
        </div>
      );
      case 'scale': return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13, color: '#888' }}><span>{question.labels?.[0]}</span><span>{question.labels?.[1]}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            {question.scale.map(num => {
              const selected = answers[question.id] === num.toString();
              return (
                <label key={num} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${selected ? '#E8541A' : '#ececec'}`, background: selected ? '#E8541A' : '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: selected ? '#fff' : '#555', transition: 'all 0.15s' }}>{num}</div>
                  <input type="radio" name={`q-${question.id}`} style={{ display: 'none' }} checked={selected} onChange={() => handleAnswer(question.id, num.toString())} />
                </label>
              );
            })}
          </div>
        </div>
      );
      case 'text': return (
        <textarea rows={4} placeholder={question.placeholder || 'Type your answer here...'} value={answers[question.id] || ''} onChange={e => handleAnswer(question.id, e.target.value)}
          style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e8e8', borderRadius: 12, fontSize: 14, color: '#111', background: '#fafafa', outline: 'none', resize: 'vertical', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = '#E8541A'} onBlur={e => e.target.style.borderColor = '#e8e8e8'} />
      );
      default: return null;
    }
  };

  if (!currentUser) return (
    <Layout title="Survey">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ maxWidth: 440, margin: '60px auto', padding: '48px 32px', background: '#fff', borderRadius: 20, border: '1px solid #f0f0f0', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}><FiLock size={26} color="#E8541A" /></div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 8 }}>Authentication Required</h2>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 1.6 }}>Please log in to take surveys and earn rewards.</p>
        <button onClick={() => router.push('/auth/login')} style={{ padding: '11px 28px', background: '#E8541A', color: '#fff', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Go to Login</button>
      </div>
    </Layout>
  );

  if (categoryState.isCompleted && categoryState.cooldownEnd) {
    const hrs = Math.ceil((categoryState.cooldownEnd - Date.now()) / 3600000);
    return (
      <Layout title="Survey Completed">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
        <div style={{ maxWidth: 440, margin: '60px auto', padding: '48px 32px', background: '#fff', borderRadius: 20, border: '1px solid #f0f0f0', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(5,150,105,0.1)', border: '1.5px solid rgba(5,150,105,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}><FiCheck size={28} color="#059669" /></div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 8 }}>Survey Completed!</h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 50, padding: '6px 16px', marginBottom: 12 }}>
            <FiDollarSign size={14} color="#059669" />
            <span style={{ fontSize: 16, fontWeight: 800, color: '#059669', fontFamily: "'Sora', sans-serif" }}>{formatUsd(currentSurvey.rewardUsd)} earned!</span>
          </div>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 20, lineHeight: 1.6 }}>Thank you for completing {currentSurvey.title}.</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 16px', marginBottom: 24 }}>
            <FiClock size={13} color="#92400e" /><span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>Available again in {hrs} hour{hrs !== 1 ? 's' : ''}</span>
          </div>
          <br />
          <button onClick={() => router.push('/tasks')} style={{ padding: '11px 28px', background: '#E8541A', color: '#fff', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <FiArrowLeft size={14} /> Back to Tasks
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={currentSurvey.title}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap'); * { box-sizing: border-box; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px 60px', fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 40%, #0f1a2e 100%)', borderRadius: 18, padding: '24px 28px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'radial-gradient(circle, rgba(232,84,26,0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, position: 'relative', zIndex: 1 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#E8541A', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>Survey</p>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3 }}>{currentSurvey.title}</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(5,150,105,0.2)', border: '1px solid rgba(5,150,105,0.35)', borderRadius: 50, padding: '8px 16px', flexShrink: 0 }}>
              <FiDollarSign size={15} color="#34d399" />
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: '#34d399' }}>{formatUsd(currentSurvey.rewardUsd)}</span>
              <span style={{ fontSize: 11, color: 'rgba(52,211,153,0.7)', fontWeight: 500 }}>reward</span>
            </div>
          </div>
        </div>
        {/* Progress */}
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '16px 20px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>Question {currentQuestion + 1} of {surveyQuestions.length}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#E8541A' }}>{Math.round(progress)}% complete</span>
          </div>
          <div style={{ height: 6, background: '#f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #E8541A, #fb923c)', borderRadius: 6, transition: 'width 0.4s ease' }} />
          </div>
        </div>
        {/* Question */}
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 18, padding: '28px 24px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: '#111', marginBottom: 24, lineHeight: 1.45 }}>
            {surveyQuestions[currentQuestion].question}
            {surveyQuestions[currentQuestion].required && <span style={{ color: '#E8541A', marginLeft: 4 }}>*</span>}
          </h3>
          {renderQuestionInput(surveyQuestions[currentQuestion])}
          {validationError && <p style={{ fontSize: 13, color: '#E8541A', marginTop: 12, fontWeight: 600 }}>{validationError}</p>}
        </div>
        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <button onClick={handlePrevious} disabled={currentQuestion === 0} style={{ padding: '11px 20px', borderRadius: 50, border: '1.5px solid #e8e8e8', background: 'none', fontSize: 13, fontWeight: 600, color: currentQuestion === 0 ? '#ccc' : '#555', cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiArrowLeft size={14} /> Previous
          </button>
          {!canProceed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 50, padding: '7px 14px' }}>
              <FiClock size={13} color="#92400e" /><span style={{ fontSize: 12, color: '#92400e', fontWeight: 700 }}>{formatTime(timeLeft)}</span>
            </div>
          )}
          {currentQuestion < surveyQuestions.length - 1 ? (
            <button onClick={handleNext} disabled={!canProceed} style={{ padding: '11px 24px', borderRadius: 50, background: !canProceed ? '#e0e0e0' : '#E8541A', border: 'none', color: !canProceed ? '#aaa' : '#fff', fontSize: 13, fontWeight: 700, cursor: !canProceed ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6, boxShadow: canProceed ? '0 4px 14px rgba(232,84,26,0.3)' : 'none' }}>
              Next <FiArrowRight size={14} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting || !canProceed} style={{ padding: '11px 28px', borderRadius: 50, background: isSubmitting || !canProceed ? '#e0e0e0' : '#059669', border: 'none', color: isSubmitting || !canProceed ? '#aaa' : '#fff', fontSize: 13, fontWeight: 700, cursor: isSubmitting || !canProceed ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 8, boxShadow: !isSubmitting && canProceed ? '0 4px 14px rgba(5,150,105,0.3)' : 'none' }}>
              {isSubmitting ? <><div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Submitting…</> : <><FiCheck size={14} /> Submit & Earn {formatUsd(currentSurvey.rewardUsd)}</>}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SurveyPage;
