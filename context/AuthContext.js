import { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  database,
  googleProvider,
  facebookProvider,
  appleProvider
} from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { ref, onValue, update } from 'firebase/database';
import { createUserProfile } from '@/lib/userService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize default user data structure
  const getDefaultUserData = (user) => ({
    email: user.email,
    isActivated: false,
    plan: null,
    activatedAt: null,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    balance: 0,
    tasksCompleted: 0
  });

  // Email/Password Authentication
  const signup = async (email, password, additionalData = {}) => {
    try {
      setLoading(true);
      setAuthError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile with subscription defaults
      const userProfile = {
        ...getDefaultUserData(userCredential.user),
        ...additionalData,
        provider: 'email'
      };
      
      await createUserProfile(userCredential.user, userProfile);

      // Send verification email
      await sendEmailVerification(userCredential.user);
      return userCredential;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login timestamp
      if (userCredential?.user?.uid) {
        await updateUserData(userCredential.user.uid, {
          lastLogin: new Date().toISOString()
        });
      }
      
      return userCredential;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Social Authentication
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      const userCredential = await signInWithPopup(auth, googleProvider);
      
      // Create profile with subscription defaults
      const userProfile = {
        ...getDefaultUserData(userCredential.user),
        provider: 'google',
        username: userCredential.user.displayName || 
                 userCredential.user.email?.split('@')[0] || 
                 `user${Math.random().toString(36).substring(2, 8)}`
      };

      await createUserProfile(userCredential.user, userProfile);
      return userCredential;
    } catch (error) {
      console.error('Google sign-in failed:', error);
      setAuthError('Failed to authenticate with Google. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      const userCredential = await signInWithPopup(auth, facebookProvider);
      
      // Create profile with subscription defaults
      const userProfile = {
        ...getDefaultUserData(userCredential.user),
        provider: 'facebook',
        username: userCredential.user.displayName || 
                 userCredential.user.email?.split('@')[0] || 
                 `user${Math.random().toString(36).substring(2, 8)}`
      };

      await createUserProfile(userCredential.user, userProfile);
      return userCredential;
    } catch (error) {
      console.error('Facebook sign-in failed:', error);
      setAuthError('Failed to authenticate with Facebook. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Account Management
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setAuthError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to update user data in Realtime DB
  const updateUserData = async (userId, data) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, data);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  // Activate user subscription
  const activateSubscription = async (planId) => {
    if (!currentUser?.uid) {
      throw new Error('No authenticated user');
    }

    try {
      setLoading(true);
      await updateUserData(currentUser.uid, {
        isActivated: true,
        plan: planId,
        activatedAt: new Date().toISOString()
      });
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch additional user data from Realtime Database
        const userRef = ref(database, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUserData(data);
          } else {
            // Initialize user data if not exists
            updateUserData(user.uid, getDefaultUserData(user));
          }
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    authError,
    signup,
    login,
    logout,
    signInWithGoogle,
    signInWithFacebook,
    resetPassword,
    activateSubscription,
    updateUserProfile: async (data) => {
      if (!currentUser?.uid) return;
      try {
        setLoading(true);
        await updateUserData(currentUser.uid, data);
        // Refresh user data
        const userRef = ref(database, `users/${currentUser.uid}`);
        onValue(userRef, (snapshot) => {
          setUserData(snapshot.val());
        });
      } catch (error) {
        setAuthError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    checkActivationStatus: () => {
      return userData?.isActivated || false;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}