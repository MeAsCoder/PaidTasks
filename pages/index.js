import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { FiArrowRight, FiCheck, FiDollarSign, FiClock, FiAward, FiUsers, FiTrendingUp } from 'react-icons/fi';
import Layout from '@/components/Layout';
import SignupModal from '../components/SignupModal';
//import { useSession } from 'next-auth/react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);

  //const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);
  const { currentUser, loading } = useAuth();
   const [pageLoaded, setPageLoaded] = useState(false);

  // Testimonial data

  const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Freelance Designer",
    content: "TaskEarn has completely transformed how I earn money online. I made $1,200 in my first month just completing simple tasks in my spare time!",
    avatar: "/avatars/sarah.jpg",
    earnings: "$1,200/month"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "College Student",
    content: "As a student, the flexibility is perfect. I earn about $500/month between classes, which covers all my expenses. Highly recommended!",
    avatar: "/avatars/michael.jpg",
    earnings: "$500/month"
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Stay-at-Home Mom",
    content: "I never thought I could earn real money from home. TaskEarn proved me wrong - $800 last month while taking care of my kids!",
    avatar: "/avatars/emma.jpg",
    earnings: "$800/month"
  },
  {
    id: 4,
    name: "David Wilson",
    role: "Retired Veteran",
    content: "This platform gave me purpose after retirement. I'm earning $900/month reviewing products - something I enjoy doing anyway!",
    avatar: "/avatars/david.jpg",
    earnings: "$900/month"
  },
  {
    id: 5,
    name: "Priya Patel",
    role: "Digital Nomad",
    content: "I travel full-time and TaskEarn provides consistent income anywhere. Made $1,500 last month from beaches in Bali!",
    avatar: "/avatars/priya.jpg",
    earnings: "$1,500/month"
  },
  {
    id: 6,
    name: "James Williams",
    role: "Rideshare Driver",
    content: "When I'm waiting for rides, I complete tasks. Extra $600/month with zero effort - it's like free money!",
    avatar: "/avatars/james.jpg",
    earnings: "$600/month"
  },
  {
    id: 7,
    name: "Olivia Kim",
    role: "Graduate Student",
    content: "Paying off student loans faster thanks to TaskEarn. $750/month just during my commute and lunch breaks!",
    avatar: "/avatars/olivia.jpg",
    earnings: "$750/month"
  },
  {
    id: 8,
    name: "Carlos Mendez",
    role: "Part-Time Worker",
    content: "Lost my main job but TaskEarn covered my rent. Earned $1,100 last month working 10-15 hours/week!",
    avatar: "/avatars/carlos.jpg",
    earnings: "$1,100/month"
  },
  {
    id: 9,
    name: "Aisha Bah",
    role: "Entrepreneur",
    content: "I use TaskEarn to fund my startup. Consistent $1,800/month gives me financial runway to build my business!",
    avatar: "/avatars/aisha.jpg",
    earnings: "$1,800/month"
  },
  {
    id: 10,
    name: "Thomas O'Reilly",
    role: "Retail Worker",
    content: "This side hustle pays more than my main job! $2,300 last month - I'm quitting retail to do this full-time!",
    avatar: "/avatars/thomas.jpg",
    earnings: "$2,300/month"
  }
];
  

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

   /*useEffect(() => {
    // Only show modal if user is not authenticated and hasn't seen it before
    const hasSeenModal = localStorage.getItem('hasSeenSignupModal');
    if (status !== 'loading' && !session && !hasSeenModal) {
      setShowModal(true);
      localStorage.setItem('hasSeenSignupModal', 'true');
    }
  }, [session, status]);

  */

  useEffect(() => {
    // Set page as loaded after initial render
    setPageLoaded(true);
    
    // Show modal after slight delay when page is loaded
    const timer = setTimeout(() => {
      const hasSeenModal = localStorage.getItem('hasSeenSignupModal');
      if (!loading && !currentUser && !hasSeenModal) {
        setShowModal(true);
        localStorage.setItem('hasSeenSignupModal', 'true');
      }
    }, 500); // Small delay to ensure page is fully rendered

    return () => clearTimeout(timer);
  }, [currentUser, loading]);

  /*
  // Temporarily force the modal to always show in development
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    setShowModal(true);
  }
}, []);

*/

  // Auto-scroll to features
  const scrollToFeatures = () => {
    setIsScrolling(true);
    featuresRef.current.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => setIsScrolling(false), 1000);
  };

  // Auto-scroll to testimonials
  const scrollToTestimonials = () => {
    setIsScrolling(true);
    testimonialsRef.current.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => setIsScrolling(false), 1000);
  };

  return (
    <Layout>
      <Head>
        <title>TaskEarn - Earn Money Completing Simple Tasks</title>
        <meta name="description" content="Get paid for completing simple tasks online. Flexible work, instant payouts, and thousands of opportunities." />
      </Head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 md:py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Earn Money On <span className="text-orange-400">Your Terms</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
            Complete simple tasks and get paid instantly. Join thousands earning extra income today!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button 
              onClick={scrollToFeatures}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105"
            >
              How It Works
            </button>
            <button 
              onClick={scrollToTestimonials}
              className="bg-white hover:bg-gray-100 text-blue-700 font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105"
            >
              See Success Stories
            </button>
          </div>
          <div className="animate-bounce mt-10">
            <FiArrowRight className="inline-block transform rotate-90 text-3xl opacity-70" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 bg-blue-50 rounded-xl">
              <FiDollarSign className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">$1.2M+</h3>
              <p className="text-gray-600">Paid to Members</p>
            </div>
            <div className="p-6 bg-orange-50 rounded-xl">
              <FiUsers className="text-4xl text-orange-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">85K+</h3>
              <p className="text-gray-600">Active Earners</p>
            </div>
            <div className="p-6 bg-green-50 rounded-xl">
              <FiClock className="text-4xl text-green-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">24/7</h3>
              <p className="text-gray-600">Task Availability</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl">
              <FiTrendingUp className="text-4xl text-purple-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">95%</h3>
              <p className="text-gray-600">Payment Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How <span className="text-blue-600">TaskEarn</span> Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-blue-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Sign Up Free</h3>
              <p className="text-gray-600 mb-6">
                Create your account in under 2 minutes. No credit card required.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> Instant approval
                </li>
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> No hidden fees
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-orange-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Choose Tasks</h3>
              <p className="text-gray-600 mb-6">
                Browse thousands of available tasks that match your skills.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> Flexible schedule
                </li>
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> Various categories
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-green-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Get Paid</h3>
              <p className="text-gray-600 mb-6">
                Earn money for each completed task with multiple payout options.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> Instant payouts
                </li>
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> Secure transfers
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-20 bg-blue-700 text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Real People, <span className="text-orange-300">Real Earnings</span>
          </h2>
          
          <div className="relative max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className={`transition-opacity duration-500 ${activeTestimonial === index ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'}`}
              >
                <div className="bg-blue-800 p-8 md:p-10 rounded-xl shadow-lg">
                  <p className="text-xl italic mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-lg">{testimonial.name}</h4>
                      <p className="text-blue-200">{testimonial.role}</p>
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
                  className={`w-3 h-3 rounded-full ${activeTestimonial === index ? 'bg-orange-400' : 'bg-blue-500'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of members earning money on their own schedule.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white hover:bg-gray-100 text-orange-600 font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105">
              Sign Up Free
            </button>
            <button className="bg-transparent hover:bg-orange-700 border-2 border-white text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105">
              Learn More
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