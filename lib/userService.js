import { auth, database, getUserRef } from './firebase';
import { ref, set, get, update } from 'firebase/database';

// Add this to your existing userService.js
/*
export const createUserProfile = async (user, additionalData = {}, updateOnly = false) => {
  if (!user?.uid) return;

  const userRef = ref(database, 'usersweb/' + user.uid);
  const snapshot = await get(userRef);

  if (!snapshot.exists() && !updateOnly) {
    const { email, displayName, photoURL } = user;
    const createdAt = new Date().toISOString();
    
    try {
      await set(userRef, {
        name: displayName || additionalData.name || (email ? email.split('@')[0] : 'User'),
        email: email || '',
        photoURL: photoURL || '',
        membership: 'Bronze',
        createdAt,
        balance: 0,
        qualityScore: 0,
        provider: additionalData.provider || 'email',
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user profile', error);
      throw error;
    }
  } else {
    // Update existing user data
    try {
      await update(userRef, {
        ...additionalData,
        ...(updateOnly ? {} : { lastLogin: new Date().toISOString() })
      });
    } catch (error) {
      console.error('Error updating user profile', error);
      throw error;
    }
  }

  return get(userRef);
};

*/

export const createUserProfile = async (user, additionalData = {}) => {
  if (!user?.uid) throw new Error('User UID is required');

  const userRef = ref(database, `usersweb/${user.uid}`);
  const snapshot = await get(userRef);

  const profileData = {
    username: user.displayName || additionalData.username || user.email?.split('@')[0] || 'user',
    email: user.email || additionalData.email || '',
    photoURL: user.photoURL || additionalData.photoURL || '',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    provider: additionalData.provider || 'google',
    membership: additionalData.membership || 'Bronze',
    balance: additionalData.balance || 0,
    qualityScore: additionalData.qualityScore || 0,
    role : additionalData.role || 'user',

    completed: additionalData.completed || 0,
    earnings : additionalData.earnings || 0,
    bio: additionalData.bio || '',
    phone: additionalData.phone || '',
    location: additionalData.location || '',
    paymentMethods: {
    mpesa: additionalData.mpesaNumber || '',
    paypal: additionalData.paypalEmail || ''

    },
    ...additionalData
  };

  // Remove undefined values to prevent validation errors
  Object.keys(profileData).forEach(key => 
    profileData[key] === undefined && delete profileData[key]
  );

  try {
    if (!snapshot.exists()) {
      await set(userRef, profileData);
    } else {
      await update(userRef, profileData);
    }
    return get(userRef);
  } catch (error) {
    console.error('Profile creation error:', {
      error,
      profileData,
      userExists: snapshot.exists()
    });
    throw error;
  }
};

/*
export const updateUserProfile = async (userId, data) => {
  const userRef = getUserRef(userId);
  try {
    await update(userRef, data);
  } catch (error) {
    console.error('Error updating user profile', error);
  }
};

*/
/*
export const updateUserProfile = async (userId, data) => {
  if (!userId) throw new Error('User ID is required');
  
  const userRef = ref(database, `usersweb/${userId}`);
  
  try {
    // Prepare updates object with proper nesting for payment methods
    const updates = {};
    
    // Handle regular profile fields
    const profileFields = ['bio', 'phone', 'location'];
    profileFields.forEach(field => {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    });
    
    // Handle payment methods separately
    if (data.mpesaNumber !== undefined) {
      updates['paymentMethods/mpesa'] = data.mpesaNumber;
    }
    
    // For cases where paymentData is passed as an object
    if (data.paymentMethods) {
      if (data.paymentMethods.mpesaNumber !== undefined) {
        updates['paymentMethods/mpesa'] = data.paymentMethods.mpesaNumber;
      }
      if (data.paymentMethods.paypalEmail !== undefined) {
        updates['paymentMethods/paypal'] = data.paymentMethods.paypalEmail;
      }
    }
    
    await update(userRef, updates);
    return get(userRef); // Return updated user data
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

*/

export async function updateUser(formData) {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const updates = {
    bio: formData.bio || '',
    phone: formData.phone || '',
    location: formData.location || '',
    paymentMethods: {
      mpesa: formData.mpesa || '',
      paypal: formData.paypal || ''
    },
    lastUpdated: new Date().toISOString()
  };

  const userRef = ref(database, `usersweb/${user.uid}`);
  await update(userRef, updates);
}

export async function updatePayment(formData) {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const updates = {
    'paymentMethods/mpesa': formData.mpesaNumber || '',
    'paymentMethods/paypal': formData.paypalEmail || '',
    'lastUpdated': new Date().toISOString()
  };

  const userRef = ref(database, `usersweb/${user.uid}`);
  await update(userRef, updates);
}


export const getUserProfile = async (userId) => {
  const userRef = getUserRef(userId);
  const snapshot = await get(userRef);
  return snapshot.exists() ? snapshot.val() : null;
};