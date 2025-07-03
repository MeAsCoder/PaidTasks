import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA7fQHMp17Ss_HW4xXbIfl6XtA5ZNm8xS4",
  authDomain: "ajiaconnect.firebaseapp.com",
  databaseURL: "https://ajiaconnect-default-rtdb.firebaseio.com",
  projectId: "ajiaconnect",
  storageBucket: "ajiaconnect.appspot.com",
  messagingSenderId: "959200262896",
  appId: "1:959200262896:web:f723b1f1c92bc77df0e035",
  measurementId: "G-T3E3CZ2LKR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication Services
const auth = getAuth(app);

// Configure authentication providers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({ display: 'popup' });

const githubProvider = new GithubAuthProvider();

// Configure Apple provider if needed
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Database Services
const database = getDatabase(app);

// Analytics (client-side only)
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Helper functions
const getUserRef = (userId) => ref(database, `usersweb/${userId}`);

// Authentication methods
const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    return userCredential;
  } catch (error) {
    throw error;
  }
};

const signInWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

const signInWithProvider = async (provider) => {
  return await signInWithPopup(auth, provider);
};

const sendPasswordReset = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};

const signOutUser = async () => {
  return await signOut(auth);
};

// Export all services and methods
export {
  auth,
  database,
  analytics,
  googleProvider,
  facebookProvider,
  githubProvider,
  appleProvider,
  getUserRef,
  signUpWithEmail,
  signInWithEmail,
  signInWithProvider,
  sendPasswordReset,
  signOutUser,
  onAuthStateChanged,
  ref,
  set,
  onValue
};