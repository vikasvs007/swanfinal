/**
 * Storage Cleanup Utility
 * 
 * This utility helps to clean up any insecure token storage
 * that might have been used in previous versions of the app.
 */

/**
 * The keys that should be removed from storage
 */
const INSECURE_STORAGE_KEYS = [
  'apiToken',
  'authToken',
  'userToken',
  'token',
  'swanToken',
  'jwtToken',
  'refreshToken',
  'isAuthenticated'
];

/**
 * Clean up any insecure tokens from localStorage
 */
export const cleanLocalStorage = () => {
  let removed = 0;
  
  INSECURE_STORAGE_KEYS.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      removed++;
    }
  });
  
  return removed;
};

/**
 * Clean up any insecure tokens from sessionStorage
 */
export const cleanSessionStorage = () => {
  let removed = 0;
  
  INSECURE_STORAGE_KEYS.forEach(key => {
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key);
      removed++;
    }
  });
  
  return removed;
};

/**
 * Clean all storage
 */
export const cleanAllStorage = () => {
  const localRemoved = cleanLocalStorage();
  const sessionRemoved = cleanSessionStorage();
  
  return { localRemoved, sessionRemoved };
};

/**
 * Run on app startup to ensure no tokens are exposed
 */
export const initializeSecureStorage = () => {
  // Clean any existing tokens
  const { localRemoved, sessionRemoved } = cleanAllStorage();
  
  if (localRemoved > 0 || sessionRemoved > 0) {
    console.log(`Removed ${localRemoved} insecure tokens from localStorage and ${sessionRemoved} from sessionStorage.`);
  }
  
  // Set a secure flag for tracking auth state (with no sensitive data)
  if (document.cookie.includes('auth_token')) {
    sessionStorage.setItem('isLoggedIn', 'true');
  } else {
    sessionStorage.removeItem('isLoggedIn');
  }
};

export default {
  cleanLocalStorage,
  cleanSessionStorage,
  cleanAllStorage,
  initializeSecureStorage
}; 