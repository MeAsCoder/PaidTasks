import Layout from '../components/Layout';
import Link from 'next/link';
import { FiCheck, FiUsers, FiBarChart2, FiShield, FiClock, FiDollarSign } from 'react-icons/fi';

export default function BusinessSolutions() {
  return (
    <Layout title="Business Solutions">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Enterprise-Grade Task Completion</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Leverage our global workforce of 85,000+ vetted earners to scale your business operations
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-blue-50 rounded-xl">
              <FiUsers className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">85K+</h3>
              <p className="text-gray-600">Vetted Earners</p>
            </div>
            <div className="p-6 bg-green-50 rounded-xl">
              <FiBarChart2 className="text-4xl text-green-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">24h</h3>
              <p className="text-gray-600">Average Completion Time</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl">
              <FiShield className="text-4xl text-purple-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800">99.8%</h3>
              <p className="text-gray-600">Accuracy Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">How Businesses Use TaskEarn</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FiCheck className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Data Collection & Annotation</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Image/Video labeling for ML training</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Sentiment analysis on text data</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Survey responses collection</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FiUsers className="text-orange-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Market Research</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Product testing & feedback</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Competitive analysis</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Demographic-specific surveys</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FiClock className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Operational Support</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Content moderation</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Data verification</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Local business listings validation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-16">Our Process</h2>
        
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-700 text-3xl font-bold">1</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Task Design Consultation</h3>
              <p className="text-gray-700">
                Our solutions team works with you to design tasks that yield the highest quality results. We'll help structure your requirements, set quality parameters, and determine optimal pricing.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-orange-700 text-3xl font-bold">2</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Workforce Deployment</h3>
              <p className="text-gray-700">
                We match your tasks with earners possessing the right skills and demographics. Our AI routing system ensures tasks are completed by the most qualified individuals in our network.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-700 text-3xl font-bold">3</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Quality Assurance</h3>
              <p className="text-gray-700">
                Every submission undergoes our 3-tier validation system, including automated checks, peer review, and statistical sampling. We guarantee 98%+ accuracy on all deliverables.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="bg-purple-100 w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-700 text-3xl font-bold">4</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Results Delivery</h3>
              <p className="text-gray-700">
                Receive cleaned, formatted data through our API or dashboard. Enterprise clients get dedicated account managers and custom reporting integrations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Flexible Pricing Models</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
              <h3 className="text-xl font-bold mb-4">Pay-per-Task</h3>
              <p className="text-4xl font-bold mb-6">$0.10 - $5.00<span className="text-lg text-gray-500"> / task</span></p>
              <ul className="space-y-3 text-gray-700 mb-8">
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Ideal for one-off projects</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>No long-term commitment</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Volume discounts available</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-orange-600">
              <h3 className="text-xl font-bold mb-4">Monthly Subscription</h3>
              <p className="text-4xl font-bold mb-6">$999+<span className="text-lg text-gray-500"> / month</span></p>
              <ul className="space-y-3 text-gray-700 mb-8">
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Unlimited tasks up to threshold</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Dedicated account manager</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-green-600">
              <h3 className="text-xl font-bold mb-4">Enterprise</h3>
              <p className="text-4xl font-bold mb-6">Custom</p>
              <ul className="space-y-3 text-gray-700 mb-8">
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Fully customized solutions</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>API integrations</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>SLA-backed performance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Scale Your Operations?</h2>
          <p className="text-xl mb-8">
            Our team will design a custom solution tailored to your business needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
             href="/contact"
            className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 px-8 rounded-lg text-lg"
            >
            Contact Sales
            </Link>
            <Link href="/demo-request" passHref legacyBehavior>
              <a className="bg-transparent hover:bg-blue-700 border-2 border-white text-white font-bold py-3 px-8 rounded-lg text-lg">
                Request Demo
              </a>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}