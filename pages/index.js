import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiArrowRight, FiCheck, FiDollarSign, FiClock, FiAward, FiUsers, FiTrendingUp, FiGlobe, FiCpu, FiFileText, FiMessageSquare, FiImage, FiSearch } from 'react-icons/fi';
import Layout from '@/components/Layout';
import SignupModal from '../components/SignupModal';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const aiTasksRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const { currentUser, loading } = useAuth();
  const [pageLoaded, setPageLoaded] = useState(false);
  const router = useRouter();

  // Smart redirect: logged in → /tasks, logged out → /auth/login
  const handleTasksRedirect = () => {
    if (currentUser) {
      router.push('/tasks');
    } else {
      router.push('/auth/login');
    }
  };

  const handleSignupRedirect = () => {
    if (currentUser) {
      router.push('/tasks');
    } else {
      router.push('/auth/register');
    }
  };

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Freelance Designer",
      country: "United States",
      flag: "🇺🇸",
      content: "EarnFlex has completely transformed how I earn money online. I made $1,200 in my first month just completing simple tasks in my spare time!",
      avatar: "/avatars/sarah.jpg",
      earnings: "$1,200/month"
    },
    {
      id: 2,
      name: "Wanjiru Kamau",
      role: "College Student",
      country: "Kenya",
      flag: "🇰🇪",
      content: "As a student in Nairobi, EarnFlex gives me the flexibility to earn around $320/month between classes. It covers all my transport and food expenses!",
      avatar: "/avatars/wanjiru.jpg",
      earnings: "$320/month"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "Stay-at-Home Mom",
      country: "Mexico",
      flag: "🇲🇽",
      content: "I never thought I could earn real money from home. EarnFlex proved me wrong — $800 last month while taking care of my kids!",
      avatar: "/avatars/emma.jpg",
      earnings: "$800/month"
    },
    {
      id: 4,
      name: "Kipchoge Mutai",
      role: "Freelance Writer",
      country: "Kenya",
      flag: "🇰🇪",
      content: "I complete AI data labeling and text review tasks every evening. Earning consistently every month has helped me save for my own business!",
      avatar: "/avatars/kipchoge.jpg",
      earnings: "$450/month"
    },
    {
      id: 5,
      name: "Priya Patel",
      role: "Digital Nomad",
      country: "India",
      flag: "🇮🇳",
      content: "I travel full-time and EarnFlex provides consistent income anywhere. Made $1,500 last month from beaches in Goa!",
      avatar: "/avatars/priya.jpg",
      earnings: "$1,500/month"
    },
    {
      id: 6,
      name: "Akinyi Otieno",
      role: "Graphic Designer",
      country: "Kenya",
      flag: "🇰🇪",
      content: "The image annotation and AI feedback tasks are perfect for someone with a design background. I earn steady income working just a few hours daily.",
      avatar: "/avatars/akinyi.jpg",
      earnings: "$380/month"
    },
    {
      id: 7,
      name: "Carlos Mendez",
      role: "Part-Time Worker",
      country: "Colombia",
      flag: "🇨🇴",
      content: "EarnFlex helped me cover my rent when I was between jobs. Earned the equivalent of $1,100 last month working 10–15 hours per week!",
      avatar: "/avatars/carlos.jpg",
      earnings: "$1,100/month"
    },
    {
      id: 8,
      name: "Fatuma Noor",
      role: "Teacher",
      country: "Kenya",
      flag: "🇰🇪",
      content: "After school hours, I do translation and survey tasks. This platform has given me a reliable second income that I didn't think was possible.",
      avatar: "/avatars/fatuma.jpg",
      earnings: "$290/month"
    },
    {
      id: 9,
      name: "Aisha Bah",
      role: "Entrepreneur",
      country: "Nigeria",
      flag: "🇳🇬",
      content: "I use EarnFlex to fund my startup. Consistent $1,800/month gives me financial runway to build my business!",
      avatar: "/avatars/aisha.jpg",
      earnings: "$1,800/month"
    },
    {
      id: 10,
      name: "Thomas O'Reilly",
      role: "Retail Worker",
      country: "Ireland",
      flag: "🇮🇪",
      content: "This side hustle pays more than I expected! $2,300 last month — I'm putting it all towards buying my first home.",
      avatar: "/avatars/thomas.jpg",
      earnings: "$2,300/month"
    },
    {
      id: 11,
      name: "Yuki Tanaka",
      role: "Software Engineer",
      country: "Japan",
      flag: "🇯🇵",
      content: "I complete AI model feedback tasks in my free time. The technical tasks pay well and match my background perfectly.",
      avatar: "/avatars/yuki.jpg",
      earnings: "$950/month"
    },
    {
      id: 12,
      name: "Lerato Dlamini",
      role: "Marketing Graduate",
      country: "South Africa",
      flag: "🇿🇦",
      content: "I was job hunting and EarnFlex bridged the gap. The survey and content tasks are simple and the payouts are reliable.",
      avatar: "/avatars/lerato.jpg",
      earnings: "$410/month"
    }
  ];

  const aiTaskCategories = [
    {
      icon: <FiFileText className="w-7 h-7" />,
      title: "AI Text & Data Labeling",
      description: "Help train AI models by labeling datasets, classifying text, and tagging content. No technical background required — just attention to detail.",
      pay: "$5 – $20 per hour",
      color: "blue"
    },
    {
      icon: <FiMessageSquare className="w-7 h-7" />,
      title: "AI Conversation Review",
      description: "Rate and evaluate AI-generated responses for quality, accuracy, and tone. Your feedback directly improves how AI assistants behave.",
      pay: "$8 – $25 per hour",
      color: "emerald"
    },
    {
      icon: <FiImage className="w-7 h-7" />,
      title: "Image & Video Annotation",
      description: "Draw bounding boxes, tag objects, and annotate visual content used to train computer vision and machine learning models.",
      pay: "$6 – $18 per hour",
      color: "teal"
    },
    {
      icon: <FiSearch className="w-7 h-7" />,
      title: "Search Quality Rating",
      description: "Evaluate search engine results for relevance and accuracy. Help improve how the world finds information online.",
      pay: "$10 – $22 per hour",
      color: "cyan"
    },
    {
      icon: <FiCpu className="w-7 h-7" />,
      title: "AI Model Testing",
      description: "Test new AI tools, provide structured feedback, and identify edge cases. You'll be among the first to interact with cutting-edge AI.",
      pay: "$12 – $30 per hour",
      color: "indigo"
    },
    {
      icon: <FiGlobe className="w-7 h-7" />,
      title: "Translation & Localization",
      description: "Translate AI training content and localize datasets across languages. High demand for Swahili, French, Arabic, and more.",
      pay: "$9 – $28 per hour",
      color: "violet"
    }
  ];

  const colorMap = {
    blue:    { bg: "bg-blue-50",    icon: "bg-blue-100 text-blue-600",       badge: "bg-blue-100 text-blue-700" },
    emerald: { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
    teal:    { bg: "bg-teal-50",    icon: "bg-teal-100 text-teal-600",       badge: "bg-teal-100 text-teal-700" },
    cyan:    { bg: "bg-cyan-50",    icon: "bg-cyan-100 text-cyan-600",       badge: "bg-cyan-100 text-cyan-700" },
    indigo:  { bg: "bg-indigo-50",  icon: "bg-indigo-100 text-indigo-600",   badge: "bg-indigo-100 text-indigo-700" },
    violet:  { bg: "bg-violet-50",  icon: "bg-violet-100 text-violet-600",   badge: "bg-violet-100 text-violet-700" }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    setPageLoaded(true);
    const timer = setTimeout(() => {
      const hasSeenModal = localStorage.getItem('hasSeenSignupModal');
      if (!loading && !currentUser && !hasSeenModal) {
        setShowModal(true);
        localStorage.setItem('hasSeenSignupModal', 'true');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [currentUser, loading]);

  const scrollTo = (ref) => {
    setIsScrolling(true);
    ref.current.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => setIsScrolling(false), 1000);
  };

  return (
    <Layout>
      <Head>
        <title>EarnFlex - Earn Money Completing Simple Tasks</title>
        <meta name="description" content="Get paid for completing simple tasks online. Flexible work, instant payouts, and thousands of opportunities." />
      </Head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-500 opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 opacity-20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6 text-sm font-medium backdrop-blur-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
            85,000+ earners active globally right now
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Earn Money On <span className="text-emerald-400">Your Terms</span>
          </h1>
          <p className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto text-blue-100">
            Complete AI-powered tasks and get paid instantly — from anywhere in the world.
          </p>
          <p className="text-md mb-12 max-w-2xl mx-auto text-blue-200">
            Data labeling, AI feedback, content review, and more. No experience needed. Join thousands already earning.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            <button
              onClick={handleTasksRedirect}
              className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/30"
            >
              Explore AI Tasks
            </button>
            <button
              onClick={() => scrollTo(featuresRef)}
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 backdrop-blur-sm"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo(testimonialsRef)}
              className="bg-transparent hover:bg-white/10 border border-white/20 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all"
            >
              Success Stories
            </button>
          </div>
          <div className="animate-bounce mt-4">
            <FiArrowRight className="inline-block transform rotate-90 text-3xl opacity-50" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: <FiDollarSign className="text-3xl text-blue-600 mx-auto mb-3" />, value: "$1.2M+", label: "Paid to Members", bg: "bg-blue-50" },
              { icon: <FiUsers className="text-3xl text-emerald-600 mx-auto mb-3" />, value: "85K+", label: "Active Earners", bg: "bg-emerald-50" },
              { icon: <FiGlobe className="text-3xl text-teal-600 mx-auto mb-3" />, value: "120+", label: "Countries Supported", bg: "bg-teal-50" },
              { icon: <FiTrendingUp className="text-3xl text-indigo-600 mx-auto mb-3" />, value: "95%", label: "Payment Success Rate", bg: "bg-indigo-50" },
            ].map((stat, i) => (
              <div key={i} className={`p-6 ${stat.bg} rounded-2xl border border-gray-100 hover:shadow-md transition-shadow`}>
                {stat.icon}
                <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tasks Section */}
      <section ref={aiTasksRef} className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Powered by AI</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Kind of Tasks Will <span className="text-blue-700">You Complete?</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Our tasks are sourced from leading AI companies and research labs. Your contributions directly improve the AI tools millions of people use daily.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiTaskCategories.map((task, index) => {
              const colors = colorMap[task.color];
              return (
                <div key={index} className={`${colors.bg} border border-gray-100 p-7 rounded-2xl hover:shadow-lg transition-all group`}>
                  <div className={`${colors.icon} w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    {task.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{task.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{task.description}</p>
                  <span className={`inline-block text-xs font-semibold ${colors.badge} px-3 py-1.5 rounded-full`}>
                    Avg. Pay: {task.pay}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-12 bg-gradient-to-r from-blue-800 to-blue-900 rounded-2xl p-8 md:p-12 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">No Technical Skills? No Problem.</h3>
            <p className="text-blue-200 max-w-xl mx-auto mb-6">
              Most tasks take 5–30 minutes and require only basic computer skills. We provide guides and tutorials so you can start earning from day one.
            </p>
            <button
              onClick={handleTasksRedirect}
              className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold py-3 px-8 rounded-xl transition-all"
            >
              Browse All Tasks →
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={featuresRef} className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              How <span className="text-blue-700">EarnFlex</span> Works
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Three simple steps between you and your first payout.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                color: "blue",
                title: "Sign Up Free",
                desc: "Create your account in under 2 minutes. No credit card required. Get instant access to available tasks.",
                perks: ["Instant approval", "No hidden fees", "Available worldwide"]
              },
              {
                step: "2",
                color: "emerald",
                title: "Choose Tasks",
                desc: "Browse thousands of AI and general tasks matched to your skills, language, and availability.",
                perks: ["Flexible schedule", "Multiple categories", "Guided tutorials"]
              },
              {
                step: "3",
                color: "teal",
                title: "Get Paid",
                desc: "Earn money for each completed task. Withdraw via M-Pesa, PayPal, bank transfer, and more.",
                perks: ["Instant payouts", "Secure transfers", "Local currencies"]
              }
            ].map((item, i) => {
              const stepColors = {
                blue: { corner: 'bg-blue-400', badge: 'bg-blue-100 text-blue-600' },
                emerald: { corner: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-600' },
                teal: { corner: 'bg-teal-400', badge: 'bg-teal-100 text-teal-600' },
              };
              const sc = stepColors[item.color];
              return (
                <div key={i} className="bg-gray-50 border border-gray-100 p-8 rounded-2xl hover:shadow-lg transition-shadow relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${sc.corner}`}></div>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-2xl font-bold ${sc.badge}`}>
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 mb-5 text-sm leading-relaxed">{item.desc}</p>
                  <ul className="space-y-2">
                    {item.perks.map((perk, j) => (
                      <li key={j} className="flex items-center text-sm text-gray-700">
                        <FiCheck className="text-emerald-500 mr-2 flex-shrink-0" /> {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-24 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Real People, <span className="text-emerald-400">Real Earnings</span>
            </h2>
            <p className="text-blue-200 mt-3 max-w-xl mx-auto">Meet global earning opportunities, from emerging hubs to established markets</p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`transition-all duration-500 ${activeTestimonial === index ? 'opacity-100 relative' : 'opacity-0 absolute top-0 left-0 pointer-events-none'}`}
              >
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 md:p-10 rounded-2xl shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-sm font-semibold px-3 py-1.5 rounded-full">
                      {testimonial.earnings}
                    </span>
                    <span className="text-blue-200 text-sm">{testimonial.flag} {testimonial.country}</span>
                  </div>
                  <p className="text-lg italic text-blue-50 mb-6 leading-relaxed">&quot;{testimonial.content}&quot;</p>
                  <div className="flex items-center border-t border-white/10 pt-5">
                    <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center overflow-hidden mr-4 flex-shrink-0">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = `<span class="text-white font-bold text-lg">${testimonial.name[0]}</span>`;
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{testimonial.name}</h4>
                      <p className="text-blue-300 text-sm">{testimonial.role} · {testimonial.flag} {testimonial.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`transition-all rounded-full ${activeTestimonial === index ? 'w-6 h-3 bg-emerald-400' : 'w-3 h-3 bg-blue-600 hover:bg-blue-400'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-10 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center text-sm text-gray-400">
            {["🔒 SSL Encrypted Payments", "✅ Verified Task Partners", "🌍 Available in 120+ Countries", "⚡ Payouts within 24 Hours", "🆓 Free to Join — No Hidden Fees"].map((item, i) => (
              <span key={i} className="font-medium">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-blue-200">
            Join thousands of members across the globe earning money on their own schedule — including right here in Kenya.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleSignupRedirect}
              className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold py-4 px-10 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              {currentUser ? 'Go to Tasks' : 'Sign Up Free'}
            </button>
            <button
              onClick={handleTasksRedirect}
              className="bg-transparent hover:bg-white/10 border-2 border-white/40 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all transform hover:scale-105"
            >
              Explore Tasks
            </button>
          </div>
        </div>
      </section>

      {pageLoaded && showModal && (
        <SignupModal onClose={() => setShowModal(false)} />
      )}
    </Layout>
  );
}
