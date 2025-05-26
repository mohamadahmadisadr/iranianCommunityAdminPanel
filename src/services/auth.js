import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

// Allowed admin email domains or specific emails
const ALLOWED_ADMIN_EMAILS = [
  'devfa75@gmail.com',
  'mohamad@iraniancommunitycanda.ca',
  // Add more admin emails here
];

const ALLOWED_ADMIN_DOMAINS = [
  'iraniancommunitycanda.ca',
  'localhost'
  // Add more admin domains here
];

// Check if email is allowed for admin access
const isAdminEmail = (email) => {
  if (ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase())) {
    return true;
  }

  const domain = email.split('@')[1];
  return ALLOWED_ADMIN_DOMAINS.includes(domain);
};

// Create Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user email is allowed for admin access
    if (!isAdminEmail(user.email)) {
      await signOut(auth);
      throw new Error('Access denied. This email is not authorized for admin access.');
    }

    // Get or create user data in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    let userDoc = await getDoc(userDocRef);

    let userData;

    if (userDoc.exists()) {
      userData = userDoc.data();

      // Update last login and profile info
      await setDoc(userDocRef, {
        ...userData,
        lastLogin: new Date(),
        email: user.email,
        profileImage: user.photoURL,
        updatedAt: new Date(),
      }, { merge: true });

    } else {
      // Create new admin user
      userData = {
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || 'Admin',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || 'User',
        role: 'admin', // Default role for new admin users
        status: 'active',
        profileImage: user.photoURL,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
      };

      await setDoc(userDocRef, userData);
    }

    // Check if user has admin privileges
    if (!['admin', 'super_admin', 'moderator', 'content_manager'].includes(userData.role)) {
      await signOut(auth);
      throw new Error('Access denied. Admin privileges required.');
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      ...userData
    };

  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
    }
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Check if user has admin privileges
          if (['admin', 'super_admin', 'moderator', 'content_manager'].includes(userData.role)) {
            callback({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              ...userData
            });
          } else {
            await signOut(auth);
            callback(null);
          }
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};
