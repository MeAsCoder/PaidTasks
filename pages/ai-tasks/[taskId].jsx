/**
 * pages/ai-tasks/[taskId].jsx
 *
 * Dynamic AI Training Task page.
 * Handles all 6 AI task types from the tasks page:
 *   - rate-responses
 *   - label-data
 *   - annotate-images
 *   - evaluate-search
 *   - transcribe-audio
 *   - translate-prompts
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '@/context/AuthContext';
import { ref, get, set, update, push } from 'firebase/database';
import { database } from '@/lib/firebase';
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiCheckCircle,
  FiClock, FiDollarSign, FiLock, FiStar, FiThumbsUp,
  FiThumbsDown, FiTag, FiSearch, FiMic, FiGlobe, FiCpu,
  FiZap, FiAward,
} from 'react-icons/fi';

// ─── Task Definitions ─────────────────────────────────────────────────────────
const AI_TASKS = {
  'rate-responses': {
    id: 'rate-responses',
    title: 'Rate AI Responses',
    rewardUsd: 6.50,
    time: '10 mins',
    completed: 3100,
    icon: '⭐',
    color: '#E8541A',
    colorLight: 'rgba(232,84,26,0.10)',
    colorBorder: 'rgba(232,84,26,0.25)',
    description: 'Evaluate AI-generated responses for quality, accuracy, helpfulness, and safety. Your ratings directly improve how AI assistants behave.',
    instructions: [
      'Read each AI response carefully',
      'Rate it on accuracy, helpfulness, and safety',
      'Flag any harmful or misleading content',
      'Leave a brief justification for your rating',
    ],
    steps: generateRateResponsesSteps(),
  },
  'label-data': {
    id: 'label-data',
    title: 'Label Training Data',
    rewardUsd: 5.00,
    time: '8 mins',
    completed: 4700,
    icon: '🏷️',
    color: '#7C3AED',
    colorLight: 'rgba(124,58,237,0.10)',
    colorBorder: 'rgba(124,58,237,0.25)',
    description: 'Classify and label text samples to help train AI language models. Choose the correct category for each piece of content.',
    instructions: [
      'Read the text sample carefully',
      'Select the most appropriate label from the options',
      'Consider tone, intent, and subject matter',
      'If uncertain, choose the closest match',
    ],
    steps: generateLabelDataSteps(),
  },
  'annotate-images': {
    id: 'annotate-images',
    title: 'Annotate Images for Vision AI',
    rewardUsd: 8.00,
    time: '12 mins',
    completed: 2200,
    icon: '🖼️',
    color: '#0891B2',
    colorLight: 'rgba(8,145,178,0.10)',
    colorBorder: 'rgba(8,145,178,0.25)',
    description: 'Describe and tag visual content to help train computer vision models. Your annotations help AI understand the visual world.',
    instructions: [
      'Look at the image description provided',
      'Select all objects/elements present',
      'Rate the image quality and clarity',
      'Add any additional observations',
    ],
    steps: generateAnnotateImageSteps(),
  },
  'evaluate-search': {
    id: 'evaluate-search',
    title: 'Evaluate Search Results',
    rewardUsd: 7.00,
    time: '15 mins',
    completed: 1900,
    icon: '🔍',
    color: '#059669',
    colorLight: 'rgba(5,150,105,0.10)',
    colorBorder: 'rgba(5,150,105,0.25)',
    description: 'Judge the relevance of search results for given queries. Help improve how search engines rank and return information.',
    instructions: [
      'Read the search query carefully',
      'Review each result for relevance',
      'Rate from 1 (irrelevant) to 5 (perfect match)',
      'Consider user intent when scoring',
    ],
    steps: generateEvaluateSearchSteps(),
  },
  'transcribe-audio': {
    id: 'transcribe-audio',
    title: 'Transcribe Audio Clips',
    rewardUsd: 4.50,
    time: '10 mins',
    completed: 3500,
    icon: '🎙️',
    color: '#B45309',
    colorLight: 'rgba(180,83,9,0.10)',
    colorBorder: 'rgba(180,83,9,0.25)',
    description: 'Read provided audio transcripts and verify their accuracy. Correct errors to improve speech recognition AI models.',
    instructions: [
      'Read the provided transcript carefully',
      'Identify any errors or missing words',
      'Select the correct transcription from options',
      'Mark unclear or unintelligible sections',
    ],
    steps: generateTranscribeSteps(),
  },
  'translate-prompts': {
    id: 'translate-prompts',
    title: 'Translate AI Prompts (Swahili)',
    rewardUsd: 9.00,
    time: '20 mins',
    completed: 1400,
    icon: '🌍',
    color: '#BE185D',
    colorLight: 'rgba(190,24,93,0.10)',
    colorBorder: 'rgba(190,24,93,0.25)',
    description: 'Translate AI training prompts between English and Swahili. Help make AI models more accessible across East Africa.',
    instructions: [
      'Read the English prompt carefully',
      'Select the most accurate Swahili translation',
      'Consider natural phrasing and context',
      'Flag any culturally inappropriate content',
    ],
    steps: generateTranslateSteps(),
  },
};

// ─── Step Generators ──────────────────────────────────────────────────────────

function generateRateResponsesSteps() {
  return [
    {
      id: 1,
      prompt: 'User asked: "What is the capital of France?"',
      aiResponse: 'The capital of France is Paris. It has been the country\'s capital since 987 AD and is home to over 2 million people in the city proper.',
      type: 'rate',
      ratingLabels: ['Inaccurate', 'Poor', 'Acceptable', 'Good', 'Excellent'],
      aspects: ['Accuracy', 'Helpfulness', 'Safety', 'Clarity'],
    },
    {
      id: 2,
      prompt: 'User asked: "How do I bake chocolate chip cookies?"',
      aiResponse: 'To bake cookies: mix butter and sugar, add eggs, fold in flour and chocolate chips, then bake at 375°F for 9-11 minutes. Let cool before serving.',
      type: 'rate',
      ratingLabels: ['Inaccurate', 'Poor', 'Acceptable', 'Good', 'Excellent'],
      aspects: ['Accuracy', 'Helpfulness', 'Safety', 'Clarity'],
    },
    {
      id: 3,
      prompt: 'User asked: "What are the symptoms of dehydration?"',
      aiResponse: 'Common dehydration symptoms include thirst, dark urine, dizziness, fatigue, and dry mouth. Severe cases may cause confusion or rapid heartbeat. Drink water and see a doctor if symptoms worsen.',
      type: 'rate',
      ratingLabels: ['Inaccurate', 'Poor', 'Acceptable', 'Good', 'Excellent'],
      aspects: ['Accuracy', 'Helpfulness', 'Safety', 'Clarity'],
    },
    {
      id: 4,
      prompt: 'User asked: "Can you help me write a professional email?"',
      aiResponse: 'Sure! A professional email should have a clear subject line, polite greeting, concise body, and a professional sign-off. Would you like me to write one for a specific situation?',
      type: 'rate',
      ratingLabels: ['Inaccurate', 'Poor', 'Acceptable', 'Good', 'Excellent'],
      aspects: ['Accuracy', 'Helpfulness', 'Safety', 'Clarity'],
    },
    {
      id: 5,
      prompt: 'User asked: "What is machine learning?"',
      aiResponse: 'Machine learning is a type of artificial intelligence where computers learn from data to make predictions or decisions without being explicitly programmed for each task.',
      type: 'rate',
      ratingLabels: ['Inaccurate', 'Poor', 'Acceptable', 'Good', 'Excellent'],
      aspects: ['Accuracy', 'Helpfulness', 'Safety', 'Clarity'],
    },
  ];
}

function generateLabelDataSteps() {
  return [
    { id: 1, text: '"Just got a promotion! Best day ever! 🎉"', type: 'label', options: ['Positive Sentiment', 'Negative Sentiment', 'Neutral', 'Spam', 'Offensive'] },
    { id: 2, text: '"The product broke after two days. Terrible quality and the support team was useless."', type: 'label', options: ['Positive Sentiment', 'Negative Sentiment', 'Product Review', 'Neutral', 'Customer Complaint'] },
    { id: 3, text: '"Meeting scheduled for Tuesday at 3pm in Conference Room B."', type: 'label', options: ['Personal', 'Business/Professional', 'News', 'Social', 'Technical'] },
    { id: 4, text: '"Scientists discover new species of deep-sea fish off the coast of New Zealand."', type: 'label', options: ['Science & Nature', 'Politics', 'Entertainment', 'Sports', 'Business'] },
    { id: 5, text: '"Click here to claim your FREE prize! Limited time offer! Act NOW!!!"', type: 'label', options: ['Spam/Scam', 'Advertisement', 'News', 'Positive Sentiment', 'Helpful Information'] },
    { id: 6, text: '"The quarterly earnings report shows a 12% increase in revenue YoY."', type: 'label', options: ['Business/Finance', 'Science', 'Politics', 'Sports', 'Entertainment'] },
  ];
}

function generateAnnotateImageSteps() {
  return [
    {
      id: 1, type: 'annotate',
      imageDesc: '🌆 Urban street scene at sunset with people walking',
      question: 'Which objects are present in this image?',
      options: ['People/Pedestrians', 'Vehicles/Cars', 'Buildings', 'Street Lights', 'Trees/Vegetation', 'Shadows'],
      qualityQ: 'Rate image clarity for AI training:',
    },
    {
      id: 2, type: 'annotate',
      imageDesc: '🐕 A golden retriever sitting in a park on grass',
      question: 'Which elements are present?',
      options: ['Dog/Animal', 'Grass/Ground', 'Trees', 'Sky', 'Person', 'Water'],
      qualityQ: 'Rate image clarity for AI training:',
    },
    {
      id: 3, type: 'annotate',
      imageDesc: '🍎 Assorted fruits arranged on a wooden table',
      question: 'Which items can you identify?',
      options: ['Apples', 'Oranges', 'Bananas', 'Wooden Surface', 'Bowl/Container', 'Leaves'],
      qualityQ: 'Rate image clarity for AI training:',
    },
    {
      id: 4, type: 'annotate',
      imageDesc: '🏢 Modern office interior with desks and computers',
      question: 'What objects are visible?',
      options: ['Computers/Monitors', 'Desks/Tables', 'Chairs', 'Windows', 'People', 'Indoor Plants'],
      qualityQ: 'Rate image clarity for AI training:',
    },
  ];
}

function generateEvaluateSearchSteps() {
  return [
    {
      id: 1, type: 'search',
      query: 'best restaurants in Nairobi 2024',
      results: [
        { title: 'Top 10 Restaurants in Nairobi - TripAdvisor', desc: 'Comprehensive guide to the finest dining in Nairobi with reviews and ratings.', url: 'tripadvisor.com/nairobi-restaurants' },
        { title: 'Nairobi Weather Forecast - Weather.com', desc: 'Get the latest weather updates for Nairobi, Kenya.', url: 'weather.com/nairobi' },
        { title: 'Best Places to Eat in Nairobi 2024 - Eater', desc: 'Our food critics pick the top dining spots across the city this year.', url: 'eater.com/nairobi-best' },
      ],
    },
    {
      id: 2, type: 'search',
      query: 'how to learn Python programming for beginners',
      results: [
        { title: 'Python.org - Official Beginner\'s Guide', desc: 'The official Python documentation with tutorials for absolute beginners.', url: 'python.org/beginners' },
        { title: 'Python Tutorial - W3Schools', desc: 'Step-by-step Python tutorial with examples and exercises.', url: 'w3schools.com/python' },
        { title: 'Buy Python Books on Amazon', desc: 'Shop for Python programming books. Free delivery on eligible orders.', url: 'amazon.com/python-books' },
      ],
    },
    {
      id: 3, type: 'search',
      query: 'symptoms of malaria treatment options',
      results: [
        { title: 'Malaria - WHO Fact Sheet', desc: 'Comprehensive information on malaria symptoms, prevention and treatment from WHO.', url: 'who.int/malaria' },
        { title: 'Malaria Symptoms & Treatment - Mayo Clinic', desc: 'Medical guide covering symptoms, diagnosis and treatment of malaria.', url: 'mayoclinic.org/malaria' },
        { title: 'Malaria History - Wikipedia', desc: 'Historical overview of malaria as a disease throughout human history.', url: 'wikipedia.org/malaria' },
      ],
    },
  ];
}

function generateTranscribeSteps() {
  return [
    {
      id: 1, type: 'transcribe',
      context: 'Audio clip from a business meeting (30 seconds)',
      givenTranscript: '"The quarterly review shows strong performance in the East Africa region, with revenue up fourteen percent compared to last quarter."',
      options: [
        '"The quarterly review shows strong performance in the East Africa region, with revenue up fourteen percent compared to last quarter."',
        '"The quarterly review shows strong preformance in the East Africa region, with revenue up fourty percent compared to last quater."',
        '"The quarterly review shows strong performance in East Africa region, with revenue up 14% compare to last quarter."',
        '"The quarterly reviews shows strong performance in the East Africa region, with revenues up fourteen percent compared to last quarter."',
      ],
    },
    {
      id: 2, type: 'transcribe',
      context: 'Audio clip of a weather forecast (20 seconds)',
      givenTranscript: '"Nairobi residents can expect partly cloudy skies throughout the week with light showers expected on Wednesday and Thursday afternoon."',
      options: [
        '"Nairobi residents can expect partly cloudy skies throughout the weak with light showers expected on Wednesday and Thursday afternoon."',
        '"Nairobi residents can expect partly cloudy skies throughout the week with light showers expected on Wednesday and Thursday afternoon."',
        '"Nairobi residence can expect partly cloudy sky throughout the week with light shower expected Wednesday and Thursday afternoon."',
        '"Nairobi residents can except partly cloudy skies throughout the week with lite showers expected on Wednesday and Thursday afternoon."',
      ],
    },
    {
      id: 3, type: 'transcribe',
      context: 'Customer service call recording (25 seconds)',
      givenTranscript: '"Thank you for calling HandShake AI support. My name is Grace and I\'ll be assisting you today. Could you please provide your account number?"',
      options: [
        '"Thank you for calling HandShake AI support. My name is Grace and I\'ll be assisting you today. Could you please provide your account number?"',
        '"Thank you for calling HandShake AI support. My name is Grace and ill be assisting you today. Can you please provide you account number?"',
        '"Thank you for calling HandShake AI support. My name is Grace and I will be assisting you today. Could you please provide your account numbers?"',
        '"Thanks for calling HandShake AI support. My name is Grace and I\'ll be assisting you today. Could you please provide you\'re account number?"',
      ],
    },
    {
      id: 4, type: 'transcribe',
      context: 'News broadcast clip (15 seconds)',
      givenTranscript: '"The Central Bank of Kenya has announced a reduction in the base lending rate from ten to nine point five percent effective immediately."',
      options: [
        '"The Central Bank of Kenya has announced a reduction in the base lending rate from ten to nine point five percent effective immediately."',
        '"The Central Bank of Kenya has announced a reduction in the base lending rate from ten to nine point five percent, effective imediately."',
        '"The Central Bank of Kenya announced a reduction in the base landing rate from ten to nine point five percent effective immediately."',
        '"The Central Bank of Kenya has announced the reduction in base lending rate from ten to nine point five percent effectively immediately."',
      ],
    },
  ];
}

function generateTranslateSteps() {
  return [
    {
      id: 1, type: 'translate',
      english: 'What is the weather like today in Nairobi?',
      options: [
        'Hali ya hewa ni vipi leo Nairobi?',
        'Nairobi ina hali gani ya hewa leo?',
        'Leo Nairobi kuna hali gani ya anga?',
        'Je, hali ya hewa ya Nairobi leo ni ipi?',
      ],
      correct: 1,
    },
    {
      id: 2, type: 'translate',
      english: 'Please help me understand this document.',
      options: [
        'Tafadhali nisaidie kuelewa hati hii.',
        'Saidia mimi kuelewa karatasi hii.',
        'Tafadhali nielewe hati hii.',
        'Niambie kuhusu hati hii tafadhali.',
      ],
      correct: 0,
    },
    {
      id: 3, type: 'translate',
      english: 'The meeting has been rescheduled to next Monday.',
      options: [
        'Mkutano umebadilishwa kuwa Jumatatu ijayo.',
        'Mkutano umehamishwa kwa Jumatatu inayokuja.',
        'Mkutano umepangwa upya kwa Jumatatu ijayo.',
        'Mkutano utafanyika Jumatatu ya pili.',
      ],
      correct: 2,
    },
    {
      id: 4, type: 'translate',
      english: 'Can you recommend a good restaurant near here?',
      options: [
        'Je, unaweza kunipendekeza mkahawa mzuri karibu hapa?',
        'Unajua mkahawa mzuri karibu nasi?',
        'Niambie mkahawa nzuri karibu na hapa.',
        'Je, kuna mkahawa mzuri karibu?',
      ],
      correct: 0,
    },
    {
      id: 5, type: 'translate',
      english: 'Thank you for your patience and understanding.',
      options: [
        'Asante kwa subira yako na uelewa.',
        'Asante kwa uvumilivu wako na kuelewa.',
        'Shukrani kwa subira na uelewa wako.',
        'Asante kwa subira yako na kuelewa kwako.',
      ],
      correct: 3,
    },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatUsd = (n) => `$${Number(n).toFixed(2)}`;

// ─── Earnings Animation Overlay ───────────────────────────────────────────────
function EarningsOverlay({ amount, taskTitle, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @keyframes popIn   { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes coinUp  { 0%{transform:translateY(40px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes fadeOut { 0%{opacity:1} 80%{opacity:1} 100%{opacity:0} }
        .earn-wrap { animation: popIn 0.5s ease forwards, fadeOut 3.2s ease forwards; }
        .coin-row span { animation: coinUp 0.4s ease forwards; }
        .coin-row span:nth-child(2){animation-delay:0.1s}
        .coin-row span:nth-child(3){animation-delay:0.2s}
        .coin-row span:nth-child(4){animation-delay:0.3s}
        .coin-row span:nth-child(5){animation-delay:0.4s}
      `}</style>
      <div className="earn-wrap" style={{ textAlign: 'center', padding: 40 }}>
        {/* Coin burst */}
        <div className="coin-row" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24, fontSize: 32 }}>
          {['💰','💵','🏆','💵','💰'].map((e, i) => <span key={i} style={{ display: 'inline-block' }}>{e}</span>)}
        </div>

        {/* Amount */}
        <div style={{ background: 'rgba(5,150,105,0.2)', border: '2px solid rgba(5,150,105,0.5)', borderRadius: 20, padding: '20px 40px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            You earned
          </div>
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 52, fontWeight: 800, color: '#34d399', lineHeight: 1, animation: 'shimmer 1s ease infinite' }}>
            {formatUsd(amount)}
          </div>
        </div>

        {/* Task name */}
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
          {taskTitle}
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          Credited to your account instantly
        </p>

        {/* Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
          {[0,1,2,3,4].map(i => (
            <FiStar key={i} size={20} color="#fbbf24" fill="#fbbf24" style={{ animation: `coinUp 0.3s ease ${i * 0.08}s forwards`, opacity: 0 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step Renderers ───────────────────────────────────────────────────────────

function RateResponseStep({ step, answer, onChange }) {
  const [ratings, setRatings] = useState(answer || {});

  const setAspectRating = (aspect, val) => {
    const updated = { ...ratings, [aspect]: val };
    setRatings(updated);
    onChange(updated);
  };

  return (
    <div>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#fb923c', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>Prompt</p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.6 }}>{step.prompt}</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '18px 20px', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>AI Response</p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.7 }}>{step.aiResponse}</p>
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>Rate each aspect:</p>
      {step.aspects.map(aspect => (
        <div key={aspect} style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: '0 0 8px' }}>{aspect}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {step.ratingLabels.map((label, i) => {
              const val = i + 1;
              const sel = ratings[aspect] === val;
              return (
                <button key={val} onClick={() => setAspectRating(aspect, val)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `1.5px solid ${sel ? '#E8541A' : 'rgba(255,255,255,0.12)'}`, background: sel ? 'rgba(232,84,26,0.2)' : 'rgba(255,255,255,0.04)', color: sel ? '#fb923c' : 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: sel ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" }}>
                  {val}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{step.ratingLabels[0]}</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{step.ratingLabels[4]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LabelDataStep({ step, answer, onChange }) {
  return (
    <div>
      <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '20px', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>Text Sample</p>
        <p style={{ fontSize: 16, color: '#fff', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>{step.text}</p>
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>Select the correct label:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {step.options.map((opt) => {
          const sel = answer === opt;
          return (
            <button key={opt} onClick={() => onChange(opt)} style={{ padding: '14px 18px', borderRadius: 12, border: `1.5px solid ${sel ? '#7C3AED' : 'rgba(255,255,255,0.1)'}`, background: sel ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)', color: sel ? '#a78bfa' : 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: sel ? 700 : 400, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${sel ? '#7C3AED' : 'rgba(255,255,255,0.2)'}`, background: sel ? '#7C3AED' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {sel && <FiCheck size={11} color="#fff" strokeWidth={3} />}
              </div>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AnnotateImageStep({ step, answer, onChange }) {
  const current = answer || { tags: [], quality: null };

  const toggleTag = (tag) => {
    const tags = current.tags.includes(tag)
      ? current.tags.filter(t => t !== tag)
      : [...current.tags, tag];
    onChange({ ...current, tags });
  };

  const setQuality = (q) => onChange({ ...current, quality: q });

  return (
    <div>
      <div style={{ background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.25)', borderRadius: 14, padding: '24px', marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>{step.imageDesc.split(' ')[0]}</div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{step.imageDesc.slice(2)}</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '6px 0 0' }}>Simulated image description for annotation</p>
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>{step.question}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {step.options.map((opt) => {
          const sel = current.tags.includes(opt);
          return (
            <button key={opt} onClick={() => toggleTag(opt)} style={{ padding: '8px 16px', borderRadius: 50, border: `1.5px solid ${sel ? '#0891B2' : 'rgba(255,255,255,0.12)'}`, background: sel ? 'rgba(8,145,178,0.2)' : 'rgba(255,255,255,0.04)', color: sel ? '#38bdf8' : 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: sel ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
              {sel && <FiCheck size={11} strokeWidth={3} />} {opt}
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>{step.qualityQ}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        {[1,2,3,4,5].map(q => (
          <button key={q} onClick={() => setQuality(q)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1.5px solid ${current.quality === q ? '#0891B2' : 'rgba(255,255,255,0.1)'}`, background: current.quality === q ? 'rgba(8,145,178,0.2)' : 'rgba(255,255,255,0.04)', color: current.quality === q ? '#38bdf8' : 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Sora', sans-serif" }}>
            {q}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Poor quality</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Excellent quality</span>
      </div>
    </div>
  );
}

function EvaluateSearchStep({ step, answer, onChange }) {
  const ratings = answer || {};
  const setRating = (idx, val) => onChange({ ...ratings, [idx]: val });

  return (
    <div>
      <div style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>Search Query</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>"{step.query}"</p>
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>Rate each result's relevance (1–5):</p>
      {step.results.map((result, idx) => (
        <div key={idx} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px', marginBottom: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8', margin: '0 0 4px' }}>{result.title}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>{result.url}</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 12px', lineHeight: 1.5 }}>{result.desc}</p>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginRight: 4 }}>Relevance:</span>
            {[1,2,3,4,5].map(v => (
              <button key={v} onClick={() => setRating(idx, v)} style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${ratings[idx] === v ? '#059669' : 'rgba(255,255,255,0.1)'}`, background: ratings[idx] === v ? 'rgba(5,150,105,0.25)' : 'rgba(255,255,255,0.04)', color: ratings[idx] === v ? '#34d399' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Sora', sans-serif" }}>
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TranscribeStep({ step, answer, onChange }) {
  return (
    <div>
      <div style={{ background: 'rgba(180,83,9,0.1)', border: '1px solid rgba(180,83,9,0.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#fb923c', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>Audio Context</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{step.context}</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 8px' }}>Given Transcript</p>
        <p style={{ fontSize: 14, color: '#fff', margin: 0, lineHeight: 1.7, fontFamily: 'monospace' }}>{step.givenTranscript}</p>
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>Select the most accurate transcription:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {step.options.map((opt, i) => {
          const sel = answer === i;
          return (
            <button key={i} onClick={() => onChange(i)} style={{ padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${sel ? '#B45309' : 'rgba(255,255,255,0.1)'}`, background: sel ? 'rgba(180,83,9,0.15)' : 'rgba(255,255,255,0.04)', color: sel ? '#fb923c' : 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: sel ? 600 : 400, cursor: 'pointer', textAlign: 'left', lineHeight: 1.6, transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif", display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${sel ? '#B45309' : 'rgba(255,255,255,0.2)'}`, background: sel ? '#B45309' : 'transparent', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {sel && <FiCheck size={11} color="#fff" strokeWidth={3} />}
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TranslateStep({ step, answer, onChange }) {
  return (
    <div>
      <div style={{ background: 'rgba(190,24,93,0.1)', border: '1px solid rgba(190,24,93,0.25)', borderRadius: 14, padding: '20px', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#f9a8d4', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>🇬🇧 English</p>
        <p style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.5 }}>"{step.english}"</p>
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>🇰🇪 Select the best Swahili translation:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {step.options.map((opt, i) => {
          const sel = answer === i;
          return (
            <button key={i} onClick={() => onChange(i)} style={{ padding: '16px 18px', borderRadius: 12, border: `1.5px solid ${sel ? '#BE185D' : 'rgba(255,255,255,0.1)'}`, background: sel ? 'rgba(190,24,93,0.15)' : 'rgba(255,255,255,0.04)', color: sel ? '#f9a8d4' : 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: sel ? 700 : 400, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif", display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${sel ? '#BE185D' : 'rgba(255,255,255,0.2)'}`, background: sel ? '#BE185D' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {sel && <FiCheck size={12} color="#fff" strokeWidth={3} />}
              </div>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AITaskPage() {
  const router = useRouter();
  const { taskId } = router.query;
  const { currentUser } = useAuth();

  const task = AI_TASKS[taskId];

  const [currentStep, setCurrentStep]     = useState(0);
  const [answers, setAnswers]             = useState({});
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [canProceed, setCanProceed]       = useState(false);
  const [timeLeft, setTimeLeft]           = useState(20);
  const [showEarnings, setShowEarnings]   = useState(false);
  const [categoryState, setCategoryState] = useState({ isCompleted: false, cooldownEnd: null });
  const timerRef = useRef(null);

  // Load localStorage state
  useEffect(() => {
    if (!taskId) return;
    const saved = JSON.parse(localStorage.getItem(`surveyCategory-${taskId}`)) || { isCompleted: false, cooldownEnd: null };
    setCategoryState(saved);
  }, [taskId]);

  // Per-step 20 s timer
  useEffect(() => {
    if (!task || categoryState.isCompleted) return;
    setCanProceed(false);
    setTimeLeft(20);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setCanProceed(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentStep, task, categoryState.isCompleted]);

  // Cooldown ticker
  useEffect(() => {
    if (!categoryState.cooldownEnd || !taskId) return;
    const t = setInterval(() => {
      if (Date.now() >= categoryState.cooldownEnd) {
        const s = { isCompleted: false, cooldownEnd: null };
        setCategoryState(s);
        localStorage.setItem(`surveyCategory-${taskId}`, JSON.stringify(s));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [categoryState.cooldownEnd, taskId]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!currentUser?.uid || !task) return;
    setIsSubmitting(true);
    try {
      // Update Firebase earnings
      const userRef = ref(database, `usersweb/${currentUser.uid}`);
      const snap    = await get(userRef);
      const data    = snap.exists() ? snap.val() : null;

      if (!data) {
        await set(userRef, {
          totalEarningsUsd: task.rewardUsd,
          balance:          task.rewardUsd,
          completed:        1,
          lastTaskCompleted: new Date().toISOString(),
          createdAt:        new Date().toISOString(),
        });
      } else {
        await update(userRef, {
          totalEarningsUsd:  parseFloat(((data.totalEarningsUsd || data.earnings || 0) + task.rewardUsd).toFixed(2)),
          balance:           parseFloat(((data.balance || 0) + task.rewardUsd).toFixed(2)),
          completed:         (data.completed || 0) + 1,
          lastTaskCompleted: new Date().toISOString(),
          lastUpdated:       new Date().toISOString(),
        });
      }

      // Log completion
      await set(push(ref(database, 'aiTaskCompletions')), {
        userId:    currentUser.uid,
        taskId,
        taskTitle: task.title,
        rewardUsd: task.rewardUsd,
        answers,
        completedAt: new Date().toISOString(),
      });

      // Set cooldown
      const newState = { isCompleted: true, cooldownEnd: Date.now() + 5 * 60 * 60 * 1000 };
      setCategoryState(newState);
      localStorage.setItem(`surveyCategory-${taskId}`, JSON.stringify(newState));

      // Show earnings animation
      setShowEarnings(true);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to submit. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleEarningsDone = () => {
    setShowEarnings(false);
    router.push({ pathname: '/survey-complete', query: { reward: task.rewardUsd, surveyName: task.title } });
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!task && taskId) {
    return (
      <Layout title="Task Not Found">
        <div style={{ textAlign: 'center', padding: '80px 24px', fontFamily: "'DM Sans', sans-serif" }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🤖</p>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 8 }}>Task Not Found</h2>
          <p style={{ color: '#888', marginBottom: 24 }}>This AI task doesn't exist.</p>
          <button onClick={() => router.push('/tasks')} style={{ padding: '11px 28px', background: '#E8541A', color: '#fff', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Back to Tasks</button>
        </div>
      </Layout>
    );
  }

  if (!currentUser) {
    return (
      <Layout title="AI Task">
        <div style={{ maxWidth: 440, margin: '60px auto', padding: '40px 32px', background: '#fff', borderRadius: 20, border: '1px solid #f0f0f0', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <FiLock size={26} color="#E8541A" />
          </div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 8 }}>Login Required</h2>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 1.6 }}>Please log in to complete AI tasks and earn rewards.</p>
          <button onClick={() => router.push('/auth/login')} style={{ padding: '11px 28px', background: '#E8541A', color: '#fff', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Go to Login</button>
        </div>
      </Layout>
    );
  }

  if (categoryState.isCompleted && categoryState.cooldownEnd) {
    const hrs = Math.ceil((categoryState.cooldownEnd - Date.now()) / 3600000);
    return (
      <Layout title="Task Completed">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
        <div style={{ maxWidth: 440, margin: '60px auto', padding: '40px 32px', background: '#fff', borderRadius: 20, border: '1px solid #f0f0f0', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>{task?.icon || '🤖'}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 50, padding: '6px 16px', marginBottom: 14 }}>
            <FiDollarSign size={14} color="#059669" />
            <span style={{ fontSize: 16, fontWeight: 800, color: '#059669', fontFamily: "'Sora', sans-serif" }}>{formatUsd(task?.rewardUsd)} earned!</span>
          </div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: '#111', margin: '0 0 8px' }}>Task Completed!</h2>
          <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, margin: '0 0 20px' }}>Thank you for completing {task?.title}. Your contribution helps improve AI.</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 16px', marginBottom: 24 }}>
            <FiClock size={13} color="#92400e" />
            <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>Available again in {hrs} hour{hrs !== 1 ? 's' : ''}</span>
          </div>
          <br />
          <button onClick={() => router.push('/tasks')} style={{ padding: '11px 28px', background: '#E8541A', color: '#fff', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <FiArrowLeft size={14} /> Back to Tasks
          </button>
        </div>
      </Layout>
    );
  }

  if (!task) return null;

  const steps       = task.steps;
  const totalSteps  = steps.length;
  const progress    = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep  = currentStep === totalSteps - 1;

  const isStepAnswered = () => {
    const s = steps[currentStep];
    const a = answers[currentStep];
    if (!a) return false;
    if (s.type === 'rate') return s.aspects.every(asp => a[asp]);
    if (s.type === 'annotate') return a.tags?.length > 0 && a.quality;
    if (s.type === 'search') return Object.keys(a).length === s.results.length;
    return a !== undefined && a !== null && a !== '';
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep(p => p + 1);
  };

  const renderStep = () => {
    const s = steps[currentStep];
    const a = answers[currentStep];
    const set = (val) => setAnswers(prev => ({ ...prev, [currentStep]: val }));

    switch (s.type) {
      case 'rate':      return <RateResponseStep     step={s} answer={a} onChange={set} />;
      case 'label':     return <LabelDataStep        step={s} answer={a} onChange={set} />;
      case 'annotate':  return <AnnotateImageStep    step={s} answer={a} onChange={set} />;
      case 'search':    return <EvaluateSearchStep   step={s} answer={a} onChange={set} />;
      case 'transcribe':return <TranscribeStep       step={s} answer={a} onChange={set} />;
      case 'translate': return <TranslateStep        step={s} answer={a} onChange={set} />;
      default:          return null;
    }
  };

  const canGoNext = canProceed && isStepAnswered();

  return (
    <Layout title={task.title}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      {showEarnings && <EarningsOverlay amount={task.rewardUsd} taskTitle={task.title} onDone={handleEarningsDone} />}

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#0d0d0d', minHeight: '100vh' }}>

        {/* ── Header ── */}
        <div style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 35%, #0f1a2e 70%, #0a1628 100%)', padding: '28px 24px 32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, background: `radial-gradient(circle, ${task.colorLight} 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 1 }}>

            {/* Back + badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <button onClick={() => router.push('/tasks')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 50, padding: '7px 14px', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                <FiArrowLeft size={13} /> Back to Tasks
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)', borderRadius: 50, padding: '7px 16px' }}>
                <FiDollarSign size={14} color="#34d399" />
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: '#34d399' }}>{formatUsd(task.rewardUsd)}</span>
                <span style={{ fontSize: 11, color: 'rgba(52,211,153,0.6)' }}>reward</span>
              </div>
            </div>

            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: task.colorLight, border: `1.5px solid ${task.colorBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                {task.icon}
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#E8541A', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>AI Training Task</p>
                <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>{task.title}</h1>
              </div>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Step {currentStep + 1} of {totalSteps}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: task.color }}>{Math.round(progress)}% complete</span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${task.color}, #fb923c)`, borderRadius: 5, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>

        {/* ── Instructions (first step only) ── */}
        {currentStep === 0 && (
          <div style={{ maxWidth: 720, margin: '20px auto 0', padding: '0 24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 20px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 10px' }}>How this task works</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {task.instructions.map((ins, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(232,84,26,0.2)', border: '1px solid rgba(232,84,26,0.3)', color: '#E8541A', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{ins}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step content ── */}
        <div style={{ maxWidth: 720, margin: '20px auto', padding: '0 24px 100px' }}>
          <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '28px 24px' }}>
            {renderStep()}
          </div>
        </div>

        {/* ── Sticky Footer Nav ── */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(13,13,13,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '14px 24px', zIndex: 100 }}>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>

            {/* Previous */}
            <button
              onClick={() => setCurrentStep(p => Math.max(0, p - 1))}
              disabled={currentStep === 0}
              style={{ padding: '11px 20px', borderRadius: 50, border: '1.5px solid rgba(255,255,255,0.12)', background: 'none', color: currentStep === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: currentStep === 0 ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <FiArrowLeft size={13} /> Prev
            </button>

            {/* Timer */}
            {!canProceed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, padding: '7px 14px' }}>
                <FiClock size={12} color="rgba(255,255,255,0.4)" />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{formatTime(timeLeft)}</span>
              </div>
            )}

            {/* Next / Submit */}
            {!isLastStep ? (
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                style={{ padding: '11px 24px', borderRadius: 50, background: !canGoNext ? 'rgba(255,255,255,0.08)' : task.color, border: 'none', color: !canGoNext ? 'rgba(255,255,255,0.3)' : '#fff', fontSize: 13, fontWeight: 700, cursor: !canGoNext ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s', boxShadow: canGoNext ? `0 4px 14px ${task.colorLight}` : 'none' }}
              >
                Next <FiArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !canGoNext}
                style={{ padding: '11px 28px', borderRadius: 50, background: isSubmitting || !canGoNext ? 'rgba(255,255,255,0.08)' : '#059669', border: 'none', color: isSubmitting || !canGoNext ? 'rgba(255,255,255,0.3)' : '#fff', fontSize: 13, fontWeight: 700, cursor: isSubmitting || !canGoNext ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s', boxShadow: !isSubmitting && canGoNext ? '0 4px 14px rgba(5,150,105,0.3)' : 'none' }}
              >
                {isSubmitting ? (
                  <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Submitting…</>
                ) : (
                  <><FiZap size={14} /> Submit & Earn {formatUsd(task.rewardUsd)}</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
