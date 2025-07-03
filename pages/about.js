import Link from 'next/link';
import Layout from '../components/Layout';
import { FiCheck, FiUsers, FiGlobe, FiDollarSign, FiAward, FiClock, FiTrendingUp } from 'react-icons/fi';

export default function About() {
  return (
    <Layout title="About Us">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Vision for the Future of Work</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Empowering a global workforce through flexible earning opportunities and AI-powered task matching
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 bg-blue-50 rounded-xl">
              <FiUsers className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">85K+</h3>
              <p className="text-gray-600">Active Earners</p>
            </div>
            <div className="p-6 bg-orange-50 rounded-xl">
              <FiGlobe className="text-4xl text-orange-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">120+</h3>
              <p className="text-gray-600">Countries</p>
            </div>
            <div className="p-6 bg-green-50 rounded-xl">
              <FiDollarSign className="text-4xl text-green-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">$1.2M+</h3>
              <p className="text-gray-600">Paid Out</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl">
              <FiAward className="text-4xl text-purple-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">4.9/5</h3>
              <p className="text-gray-600">Trustpilot Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 bg-blue-700 p-12 text-white">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl mb-8">
                Democratize access to income opportunities by connecting businesses with a global on-demand workforce
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FiCheck className="text-2xl mr-3 mt-1 flex-shrink-0" />
                  <p>Create flexible earning opportunities</p>
                </div>
                <div className="flex items-start">
                  <FiCheck className="text-2xl mr-3 mt-1 flex-shrink-0" />
                  <p>Deliver high-quality data solutions</p>
                </div>
                <div className="flex items-start">
                  <FiCheck className="text-2xl mr-3 mt-1 flex-shrink-0" />
                  <p>Build economic empowerment</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 p-12 bg-gray-50">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Story</h2>
              <p className="text-gray-700 mb-6">
                Founded in 2018 by former tech executives, TaskEarn began with a simple idea: create a platform where anyone could earn money by completing microtasks that help businesses improve their products.
              </p>
              <p className="text-gray-700">
                Today, we&apos;ve grown into a global marketplace trusted by Fortune 500 companies and independent earners alike, processing millions of tasks monthly while maintaining a 98% satisfaction rate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Value Propositions */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose TaskEarn</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FiClock className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Flexible Work</h3>
              <p className="text-gray-600">
                Earn on your schedule with tasks that fit your availability and skills. No minimum hours required.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FiDollarSign className="text-orange-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Instant Payouts</h3>
              <p className="text-gray-600">
                Get paid immediately via multiple methods including bank transfer, PayPal, and mobile money.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FiTrendingUp className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Growth Opportunities</h3>
              <p className="text-gray-600">
                Access higher-paying tasks as you build your reputation and complete more work.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-16">Meet Our Leadership</h2>
        
        <div className="grid md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="w-48 h-48 mx-auto mb-6 rounded-full bg-gray-200 overflow-hidden">
              {/* Replace with actual team member image */}
              <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl">JD</div>
            </div>
            <h3 className="text-xl font-bold">Jamie Dawson</h3>
            <p className="text-blue-600 mb-2">CEO & Co-Founder</p>
            <p className="text-gray-600">
              Former VP of Product at TechScale with 15+ years in platform economics
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-48 h-48 mx-auto mb-6 rounded-full bg-gray-200 overflow-hidden">
              <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 text-4xl">MP</div>
            </div>
            <h3 className="text-xl font-bold">Maria Perez</h3>
            <p className="text-blue-600 mb-2">CTO</p>
            <p className="text-gray-600">
              AI and machine learning expert from Stanford&apos;s Computer Science program
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-48 h-48 mx-auto mb-6 rounded-full bg-gray-200 overflow-hidden">
              <div className="w-full h-full bg-green-100 flex items-center justify-center text-green-600 text-4xl">TK</div>
            </div>
            <h3 className="text-xl font-bold">Tunde Kolawole</h3>
            <p className="text-blue-600 mb-2">Head of Community</p>
            <p className="text-gray-600">
              Built Africa&apos;s largest gig economy platform before joining TaskEarn
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Join Our Community?</h2>
          <p className="text-xl mb-8">
            Whether you want to earn or need tasks completed, we have solutions for you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
           <Link href="/auth/register" passHref legacyBehavior>
          <a className="inline-block"> {/* Wrapping anchor tag for better semantics */}
           <button className="bg-white hover:bg-gray-100 text-orange-600 font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 cursor-pointer">
            Sign Up as Earner
          </button>
           </a>
          </Link>
           <Link href="/business-solutions" passHref legacyBehavior>
            <a className="inline-block"> {/* Wrapping anchor tag */}
           <button className="bg-transparent hover:bg-orange-700 border-2 border-white text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 cursor-pointer">
               Business Solutions
          </button>
            </a>
          </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}