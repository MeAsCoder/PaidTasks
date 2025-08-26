import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';
import Layout from '../components/Layout';
import { FiCheck, FiCopy, FiLock, FiZap, FiAward, FiStar } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Plan data configuration
const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 500,
    features: [
      'Access to basic surveys',
      '3 tasks per day',
      'Standard support',
      'KSh 50 per survey'
    ],
    icon: <FiCheck className="text-blue-500" />,
    popular: false
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 1000,
    features: [
      'Access to premium surveys',
      '5 tasks per day',
      'Priority support',
      'KSh 100 per survey',
      'Weekly bonus tasks'
    ],
    icon: <FiZap className="text-blue-500" />,
    popular: false
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 2000,
    features: [
      'Access to all surveys',
      '10 tasks per day',
      '24/7 priority support',
      'KSh 150 per survey',
      'Weekly bonus tasks',
      'Early access to new features'
    ],
    icon: <FiStar className="text-blue-500" />,
    popular: true
  }
];

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  paymentDetails, 
  amount,
  onPaymentVerified 
}) => {
  const [mpesaMessage, setMpesaMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateMpesaMessage = (message) => {
    if (!paymentDetails) return false;
    
    const hasAmount = message.includes(amount.toString());
    const hasTillReference = message.toLowerCase().includes(paymentDetails.till_name.toLowerCase());
    
    return hasAmount && hasTillReference;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    
    try {
      if (!validateMpesaMessage(mpesaMessage)) {
        throw new Error('Please paste the complete M-Pesa message containing the amount and till name');
      }
      
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Payment verified successfully!');
      
      // Call the verification handler which will update the database
      await onPaymentVerified();
      
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 mb-4">
              <FiLock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Account Activation
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Complete your payment to unlock premium surveys and start earning
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="p-6 pt-4">
            {/* Security Fee Notice */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center mb-2">
                <FiAward className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">Refundable Security Fee</span>
              </div>
              <p className="text-blue-800 text-sm">
                <span className="font-bold">KSh {amount}</span> will be credited back upon your first successful withdrawal
              </p>
            </div>

            {/* Payment Details */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Details
              </h4>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Till Name:</span>
                  <span className="font-medium text-gray-900">{paymentDetails?.till_name || 'Loading...'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Till Number:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-gray-900 bg-white px-2 py-1 rounded border">
                      {paymentDetails?.till_number || 'Loading...'}
                    </span>
                    <button 
                      onClick={() => {
                        if (paymentDetails?.till_number) {
                          navigator.clipboard.writeText(paymentDetails.till_number);
                          toast.success('Copied to clipboard!');
                        }
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Copy till number"
                      disabled={!paymentDetails?.till_number}
                    >
                      <FiCopy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Amount:</span>
                  <span className="font-bold text-lg text-green-600">KSh {amount}</span>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
              <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Payment Steps
              </h5>
              <ol className="space-y-2">
                {[
                  'Open M-Pesa on your phone',
                  'Select "Lipa Na M-Pesa"',
                  `Enter Till Number: ${paymentDetails?.till_number || 'Loading...'}`,
                  `Enter Amount: KSh ${amount}`,
                  'Enter your M-Pesa PIN and send',
                  'Copy the confirmation message below'
                ].map((step, index) => (
                  <li key={index} className="flex items-start text-sm text-green-700">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Message Input */}
            <div className="mb-6">
              <label htmlFor="mpesa-message" className="block text-sm font-semibold text-gray-700 mb-2">
                M-Pesa Confirmation Message
              </label>
              <textarea
                id="mpesa-message"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Paste your complete M-Pesa confirmation message here..."
                value={mpesaMessage}
                onChange={(e) => setMpesaMessage(e.target.value)}
                required
              />
              <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                <span className="font-medium">Example:</span> &quot;Confirmed. You have sent KSh {amount} to {paymentDetails?.till_name || 'TILL_NAME'}. Your M-Pesa balance is...&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 pt-4">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isVerifying}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isVerifying || !mpesaMessage.trim() || !paymentDetails?.till_number}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center transition-all"
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2 h-4 w-4" />
                  Verify Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Subscription Page Component
const SubscriptionPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null); // Start with null
  const [configLoading, setConfigLoading] = useState(false);

  // Load payment config from Firebase
  const loadPaymentConfig = async () => {
    try {
      setConfigLoading(true);
      const db = getDatabase();
      const configRef = ref(db, 'config');
      const snapshot = await get(configRef);
      
      if (snapshot.exists()) {
        const config = snapshot.val();
        console.log('Loaded config:', config); // Debug log
        
        setPaymentDetails({
          till_name: config.till_name || "SURVEY PLATFORM",
          till_number: config.till_number || "123456"
        });
        
        toast.success('Payment details loaded successfully!');
      } else {
        // Fallback values if config doesn't exist
        console.warn('No config found in Firebase, using fallback values');
        setPaymentDetails({
          till_name: "SURVEY PLATFORM",
          till_number: "123456"
        });
        toast.warning('Using default payment details. Please contact support if this persists.');
      }
    } catch (error) {
      console.error('Error loading payment config:', error);
      // Use fallback values on error
      setPaymentDetails({
        till_name: "SURVEY PLATFORM", 
        till_number: "123456"
      });
      toast.error('Failed to load payment details. Using default values.');
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        // Load payment config when user is authenticated
        await loadPaymentConfig();
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan);
    
    // Ensure payment details are loaded before showing modal
    if (!paymentDetails && !configLoading) {
      toast.info('Loading payment details...');
      await loadPaymentConfig();
    }
    
    // Only show modal if we have payment details
    if (paymentDetails || !configLoading) {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentVerified = async () => {
    try {
      if (!user || !selectedPlan) return;

      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      
      // Update user subscription with isActivated flag
      await update(userRef, {
        subscription: {
          plan: selectedPlan.id,
          activatedAt: Date.now(),
          status: 'active',
          isActivated: true // Add the boolean flag
        }
      });

      toast.success(`${selectedPlan.name} plan activated successfully!`);
      
      // Redirect to dashboard or surveys page
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to activate subscription. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan to start earning from surveys. All plans include a refundable security fee.
          </p>
        </div>

        {/* Loading Config Notice */}
        {configLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-blue-800 font-medium">Loading payment details...</span>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="mb-4">{plan.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      KSh {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">one-time</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheck className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={configLoading}
                  className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:bg-blue-400'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900 disabled:bg-gray-50'
                  }`}
                >
                  {configLoading ? 'Loading...' : 'Get Started'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Security Fee Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 text-center">
          <FiAward className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            100% Refundable Security Fee
          </h3>
          <p className="text-blue-800">
            Your activation fee will be fully refunded when you make your first withdrawal. 
            This helps us maintain a quality platform for serious earners.
          </p>
        </div>

        {/* Payment Details Preview (Optional - shows loaded config) */}
        {paymentDetails && !configLoading && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 mb-2 text-center">Payment Information Loaded</h4>
            <div className="flex justify-center space-x-6 text-sm text-gray-600">
              <span>Till: <span className="font-medium">{paymentDetails.till_name}</span></span>
              <span>Number: <span className="font-mono font-medium">{paymentDetails.till_number}</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentDetails={paymentDetails}
        amount={selectedPlan?.price}
        onPaymentVerified={handlePaymentVerified}
      />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Layout>
  );
};

export default SubscriptionPage;