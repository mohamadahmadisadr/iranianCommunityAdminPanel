import toast from 'react-hot-toast';

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
};

// Check if error is retryable
const isRetryableError = (error) => {
  if (!error) return false;
  
  const retryableErrors = [
    'unavailable',
    'deadline-exceeded',
    'internal',
    'resource-exhausted',
    'cancelled',
    'network-error',
    'timeout',
    'connection-error',
  ];
  
  const errorCode = error.code?.toLowerCase() || '';
  const errorMessage = error.message?.toLowerCase() || '';
  
  return retryableErrors.some(retryableError => 
    errorCode.includes(retryableError) || errorMessage.includes(retryableError)
  );
};

// Calculate delay with exponential backoff
const calculateDelay = (attempt) => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

// Sleep utility
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper for Firebase operations
export const withRetry = async (operation, options = {}) => {
  const config = { ...RETRY_CONFIG, ...options };
  let lastError;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await operation();
      
      // If we had previous failures but this succeeded, show success message
      if (attempt > 0) {
        toast.success('Connection restored successfully');
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Log the error for debugging
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      // If this is the last attempt or error is not retryable, throw
      if (attempt === config.maxRetries || !isRetryableError(error)) {
        break;
      }
      
      // Show retry message
      const remainingAttempts = config.maxRetries - attempt;
      toast.error(`Connection failed. Retrying... (${remainingAttempts} attempts left)`);
      
      // Wait before retrying
      const delay = calculateDelay(attempt);
      await sleep(delay);
    }
  }
  
  // All retries failed
  throw lastError;
};

// Specific retry wrapper for Firestore operations
export const firestoreWithRetry = async (operation, customMessage = null) => {
  try {
    return await withRetry(operation);
  } catch (error) {
    console.error('Firestore operation failed after retries:', error);
    
    // Show user-friendly error message
    const errorMessage = customMessage || getFirestoreErrorMessage(error);
    toast.error(errorMessage);
    
    throw error;
  }
};

// Get user-friendly error message
const getFirestoreErrorMessage = (error) => {
  const errorCode = error.code?.toLowerCase() || '';
  const errorMessage = error.message?.toLowerCase() || '';
  
  if (errorCode.includes('permission-denied')) {
    return 'You do not have permission to perform this action';
  }
  
  if (errorCode.includes('not-found')) {
    return 'The requested data was not found';
  }
  
  if (errorCode.includes('already-exists')) {
    return 'This data already exists';
  }
  
  if (errorCode.includes('invalid-argument')) {
    return 'Invalid data provided';
  }
  
  if (errorCode.includes('unauthenticated')) {
    return 'Please log in to continue';
  }
  
  if (errorCode.includes('unavailable') || errorMessage.includes('network')) {
    return 'Connection issue detected. Please check your internet connection and try again.';
  }
  
  if (errorCode.includes('deadline-exceeded') || errorCode.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  if (errorCode.includes('resource-exhausted')) {
    return 'Service temporarily overloaded. Please try again in a moment.';
  }
  
  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
};

// Connection status checker
export const checkFirebaseConnection = async () => {
  try {
    // Try to perform a simple Firestore operation
    const { db } = await import('../firebaseConfig');
    const { doc, getDoc } = await import('firebase/firestore');
    
    // Try to read a non-existent document (this will fail gracefully but test connection)
    await getDoc(doc(db, 'connection-test', 'test'));
    return true;
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return false;
  }
};

// Retry hook for React components
export const useRetry = () => {
  const retry = async (operation, options = {}) => {
    return await withRetry(operation, options);
  };
  
  const retryFirestore = async (operation, customMessage = null) => {
    return await firestoreWithRetry(operation, customMessage);
  };
  
  return { retry, retryFirestore };
};

// Network status utilities
export const isOnline = () => {
  return navigator.onLine;
};

export const addNetworkListeners = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// Firebase-specific error handling
export const handleFirebaseError = (error, context = '') => {
  console.error(`Firebase error in ${context}:`, error);
  
  const userMessage = getFirestoreErrorMessage(error);
  toast.error(userMessage);
  
  // Return structured error info
  return {
    code: error.code,
    message: error.message,
    userMessage,
    isRetryable: isRetryableError(error),
    context,
  };
};

export default {
  withRetry,
  firestoreWithRetry,
  checkFirebaseConnection,
  useRetry,
  isOnline,
  addNetworkListeners,
  handleFirebaseError,
};
