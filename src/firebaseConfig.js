/**
 * Firebase Configuration and Initialization
 *
 * This file sets up Firebase services for the Iranian Community Admin Panel:
 * - Firestore Database for data storage
 * - Firebase Authentication for user management
 * - Firebase Storage for file uploads
 * - Firebase Analytics for usage tracking (production only)
 *
 * Environment variables are used for configuration to support multiple environments
 * (development, staging, production) with different Firebase projects.
 *
 * @author Mohammad Ahmad Isadr
 * @version 1.0.0
 */

// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";

/**
 * Firebase Configuration Object
 *
 * Configuration is loaded from environment variables to support:
 * - Multiple environments (dev, staging, prod)
 * - Secure credential management
 * - Easy deployment across different Firebase projects
 *
 * Required environment variables:
 * - VITE_API_KEY: Firebase API key
 * - VITE_AUTH_DOMAIN: Firebase auth domain
 * - VITE_PROJECT_ID: Firebase project ID
 * - VITE_STORAGE_BUCKET: Firebase storage bucket
 * - VITE_MESSAGING_SENDER_ID: Firebase messaging sender ID
 * - VITE_APP_ID: Firebase app ID
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

// Initialize Firebase app with configuration
const app = initializeApp(firebaseConfig);

/**
 * Firebase Service Instances
 *
 * These are the main Firebase services used throughout the application:
 * - db: Firestore database for storing application data
 * - auth: Firebase Authentication for user management
 * - storage: Firebase Storage for file uploads and media
 */

// Firestore Database - NoSQL document database for real-time data
export const db = getFirestore(app);

// Firebase Authentication - User authentication and session management
export const auth = getAuth(app);

// Firebase Storage - File upload and storage service
export const storage = getStorage(app);

/**
 * Authentication Persistence Configuration
 *
 * Sets authentication persistence to local storage, ensuring users
 * remain logged in across browser sessions and page refreshes.
 * This improves user experience by reducing login frequency.
 */
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error);
});

/**
 * Firebase Analytics (Production Only)
 *
 * Analytics is only initialized in production to avoid
 * development data pollution and improve development performance.
 * Tracks user interactions and application usage patterns.
 */
let analytics;
if (import.meta.env.PROD) {
  analytics = getAnalytics(app);
}

// Export analytics instance (may be undefined in development)
export { analytics };

// Export the main Firebase app instance
export default app;