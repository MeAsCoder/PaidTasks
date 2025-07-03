import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { updatePayment, updateUser } from '@/lib/userService';
import { auth, database } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function ProfilePage() {
  const { currentUser, userData, updateUserProfile } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [paymentEditMode, setPaymentEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username : '',
    bio: '',
    phone: '',
    location: '',
    mpesa: '',
    paypal: ''
  });

  const [paymentData, setPaymentData] = useState({
    mpesaNumber: '',
    paypalEmail: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');



  /*

  // Initialize form data when userData loads or changes
  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || '',
        bio: userData.bio || '',
        phone: userData.phone || '',
        location: userData.location || ''
      });
      setPaymentData({
        mpesaNumber: userData.paymentMethods?.mpesa || '',
        paypalEmail: userData.paymentMethods?.paypal || ''
      });
    }
  }, [userData]);


  */


  // Populate form from database
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = ref(database, `usersweb/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setFormData({
          username: data.username || 'User',
          bio: data.bio || '',
          phone: data.phone || '',
          location: data.location || '',
          balance : data.balance || 0,

          photoURL : data.photoURL || '',
          mpesa: data.paymentMethods?.mpesa || '',
          paypal: data.paymentMethods?.paypal || ''
        });
      }
    });

    return () => unsubscribe();
  }, []);

  if (!currentUser) {
    router.push('/auth/login');
    return null;
  }

   const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    }
  };




  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting payment data:', paymentData);
    try {
      await updatePayment(paymentData);
      alert('Payment details updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update payment details.');
    }
  };



  const stats = [
    { label: 'Tasks Completed', value: userData?.tasksCompleted || 0 },
    { label: 'Earnings', value: `$${(formData?.balance || 0).toFixed(2)}` },
    { label: 'Rating', value: userData?.rating ? `${userData.rating}/5` : 'Not rated' },
    { label: 'Member Since', value: new Date(userData?.createdAt).toLocaleDateString() }
  ];

  return (
    <Layout>
      <Head>
        <title>{formData?.name || 'User'} Profile | TaskEarn</title>
        <meta name="description" content="Your TaskEarn profile" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with dynamic name */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {formData.username || 'User'}&apos;s Profile
            </h1>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>
                <div className="px-6 py-4 -mt-16 relative">
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        className="h-32 w-32 rounded-full border-4 border-white object-cover"
                        src={formData?.photoURL || '/default-avatar.png'}
                        alt="Profile"
                      />
                      {editMode && (
                        <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.username}
                        onChange={handleChange}
                        className="text-xl font-bold text-center w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-gray-900">{formData?.username || 'Your Name'}</h2>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {userData?.membership || 'Basic'} Member
                    </p>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Account Information
                    </h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="ml-2 text-sm text-gray-600">{currentUser.email}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="ml-2 text-sm text-gray-600">
                          Joined {new Date(userData?.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                      <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                    {editMode ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditMode(false)}
                          className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={isLoading}
                          className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">About</label>
                      {editMode ? (
                        <textarea
                          name="bio"
                          rows="3"
                          value={formData.bio}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">
                          {formData?.bio || 'No bio added yet.'}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        {editMode ? (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {formData?.phone || 'Not provided'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        {editMode ? (
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {formData?.location || 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Membership Level</label>
                      <div className="mt-1 flex items-center">
                        <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                          {userData?.membership || 'Basic'}
                        </span>
                        <Link href="/membership" className="ml-2 text-sm text-blue-600 hover:text-blue-800">
                          Upgrade
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Payment Methods</h2>
                    {paymentEditMode ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setPaymentEditMode(false)}
                          className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handlePaymentSubmit}
                          disabled={isLoading}
                          className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isLoading ? 'Saving...' : 'Save Payment Methods'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPaymentEditMode(true)}
                        className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Edit Payment Methods
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">M-Pesa Number</label>
                    {paymentEditMode ? (
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          +254
                        </span>
                        <input
                          type="tel"
                          name="mpesaNumber"
                          value={paymentData.mpesaNumber}
                          onChange={handlePaymentChange}
                          placeholder="7XX XXX XXX"
                          className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                        />
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">

                        {formData.mpesa || 'Not Set'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">PayPal Email</label>
                    {paymentEditMode ? (
                      <input
                        type="email"
                        name="paypalEmail"
                        value={paymentData.paypalEmail}
                        onChange={handlePaymentChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {formData.paypal || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Account Settings</h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Email Address</h3>
                      <p className="text-sm text-gray-500">{currentUser.email}</p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Change
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Password</h3>
                      <p className="text-sm text-gray-500">••••••••</p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Change
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}