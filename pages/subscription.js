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
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 3500,
    features: [
      'Unlimited survey access',
      'Unlimited tasks',
      'VIP support',
      'KSh 200 per survey',
      'Daily bonus tasks',
      'Exclusive features',
      'Account manager'
    ],
    icon: <FiAward className="text-blue-500" />,
    popular: false
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

  const validateMpesaMessage = (message) => {
    if (!paymentDetails) return false;
    
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
    
    // Check for required components in the message
    const hasTillName = message.toLowerCase().includes(paymentDetails.till_name.toLowerCase());
    const hasAmount = message.includes(amount.toString());
    const hasTodayDate = message.includes(dateStr);
    
    return hasTillName && hasAmount && hasTodayDate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    
    try {
      if (!validateMpesaMessage(mpesaMessage)) {
        throw new Error('Invalid M-Pesa message. Please paste the complete message containing the till name, amount, and today\'s date.');
      }
      
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Payment verified successfully!');
      onPaymentVerified();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <FiLock className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Account Activation Required
          </h3>
          <p className="text-gray-500 mb-4">
            To ensure quality submission of surveys and tasks, our platform requires 
            a <strong>refundable security fee</strong> of <span className="font-bold text-blue-600">KSh {amount}</span>.
            This amount will be credited back to you upon your first successful withdrawal.
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
          <div className="bg-gray-50 p-4 rounded-lg mb-3">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Till Name:</span>
              <span className="font-medium">{paymentDetails.till_name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Till Number:</span>
              <div className="flex items-center">
                <span className="font-medium mr-2">{paymentDetails.till_number}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(paymentDetails.till_number);
                    toast.success('Copied to clipboard!');
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FiCopy />
                </button>
              </div>
            </div>
          </div>

          {paymentDetails.till_image && (
            <div className="mb-4">
              <img 
                src={paymentDetails.till_image} 
                alt="Payment QR Code" 
                className="w-full h-auto rounded-lg border border-gray-200"
              />
            </div>
          )}

          <div className="text-sm text-gray-500 mb-4">
            <p>1. Go to M-Pesa on your phone</p>
            <p>2. Select <strong>Lipa Na M-Pesa</strong></p>
            <p>3. Enter Till Number: <strong>{paymentDetails.till_number}</strong></p>
            <p>4. Enter Amount: <strong>KSh {amount}</strong></p>
            <p>5. Enter your M-Pesa PIN and send</p>
            <p>6. Paste the complete M-Pesa confirmation message below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="mpesa-message" className="block text-sm font-medium text-gray-700 mb-1">
              Paste Complete M-Pesa Message
            </label>
            <textarea
              id="mpesa-message"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Paste the complete M-Pesa confirmation message here..."
              value={mpesaMessage}
              onChange={(e) => setMpesaMessage(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              The message must include the till name ({paymentDetails.till_name}), 
              amount (KSh {amount}), and today's date to be valid.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubscriptionPage = () => {
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      const db = getDatabase();
      const paymentRef = ref(db, 'config/payment');
      
      try {
        const snapshot = await get(paymentRef);
        if (snapshot.exists()) {
          setPaymentDetails(snapshot.val());
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
        toast.error('Failed to load payment details');
      }
    };

    fetchPaymentDetails();
  }, []);

  const handleActivate = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentVerified = async () => {
    try {
      const db = getDatabase();
      await update(ref(db, `users/${auth.currentUser.uid}`), {
        isActivated: true,
        plan: selectedPlan.id,
        activatedAt: new Date().toISOString()
      });
      toast.success('Account activated successfully!');
      router.push('/tasks');
    } catch (error) {
      toast.error('Error activating account. Please try again.');
      console.error("Error updating user data:", error);
    }
  };

  return (
    <Layout title="Subscription Plans">
      <ToastContainer position="bottom-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Select the plan that works best for you and start earning today
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 ${
                hoveredPlan === plan.id ? 'transform scale-105 shadow-lg' : ''
              } ${
                plan.popular ? 'border-2 border-blue-500' : ''
              }`}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="text-blue-500 text-2xl">
                  {plan.icon}
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900 mb-2">KSh {plan.price}</p>
                <p className="text-gray-500">One-time activation fee</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <FiCheck className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleActivate(plan)}
                className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
                  plan.popular 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-800 hover:bg-gray-900'
                }`}
              >
                Activate {plan.name}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500">
            All plans include a refundable security fee that will be credited back upon your first withdrawal.
          </p>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentDetails={paymentDetails || { till_name: 'Loading...', till_number: '...' }}
        amount={selectedPlan?.price || 0}
        onPaymentVerified={handlePaymentVerified}
      />
    </Layout>
  );
};

export default SubscriptionPage;