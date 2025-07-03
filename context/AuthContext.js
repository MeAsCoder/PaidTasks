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
import { ref, onValue } from 'firebase/database';
import { createUserProfile } from '@/lib/userService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Email/Password Authentication
  const signup = async (email, password, additionalData = {}) => {
    try {
      setLoading(true);
      setAuthError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Use createUserProfile service
      await createUserProfile(userCredential.user, {
        ...additionalData,
        provider: 'email'
      });

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
        await createUserProfile(userCredential.user, {
          lastLogin: new Date().toISOString()
        }, true); // Update existing only
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
    
    // Ensure minimum required fields are present
    await createUserProfile(userCredential.user, {
      provider: 'google',
      username: userCredential.user.displayName || 
               userCredential.user.email?.split('@')[0] || 
               `user${Math.random().toString(36).substring(2, 8)}`
    });

    return userCredential;
  } catch (error) {
    console.error('Google sign-in failed:', {
      error,
      code: error.code,
      message: error.message
    });
    setAuthError('Failed to create user profile. Please try again.');
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
      
      // Use createUserProfile service
      await createUserProfile(userCredential.user, {
        provider: 'facebook'
      });
      
      return userCredential;
    } catch (error) {
      setAuthError(error.message);
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

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch additional user data from Realtime Database
        const userRef = ref(database, 'usersweb/' + user.uid);
        onValue(userRef, (snapshot) => {
          setUserData(snapshot.val());
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
    updateUserProfile: async (data) => {
      if (!currentUser?.uid) return;
      try {
        setLoading(true);
        await createUserProfile({ uid: currentUser.uid }, data, true);
        // Refresh user data
        const userRef = ref(database, 'usersweb/' + currentUser.uid);
        onValue(userRef, (snapshot) => {
          setUserData(snapshot.val());
        });
      } catch (error) {
        setAuthError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
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