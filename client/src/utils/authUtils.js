/**
 * Authentication Utilities
 * 
 * Secure functions for handling API tokens and authentication
 */

// Store API token securely in localStorage with expiration
export const setApiToken = (token, expiryHours = 24) => {
  if (!token) return false;
  
  try {
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + expiryHours);
    
    const tokenData = {
      token,
      expires: expiryTime.getTime(),
    };
    
    localStorage.setItem('api_secret_token', token);
    localStorage.setItem('api_token_expiry', expiryTime.getTime().toString());
    
    return true;
  } catch (error) {
    console.error('Error storing API token:', error);
    return false;
  }
};

// Get API token if it's still valid
export const getApiToken = () => {
  try {
    const token = localStorage.getItem('api_secret_token');
    const expiry = localStorage.getItem('api_token_expiry');
    
    if (!token || !expiry) return null;
    
    // Check if token has expired
    if (Date.now() > parseInt(expiry, 10)) {
      // Clean up expired token
      localStorage.removeItem('api_secret_token');
      localStorage.removeItem('api_token_expiry');
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Error retrieving API token:', error);
    return null;
  }
};

// Clear API token on logout
export const clearApiToken = () => {
  try {
    localStorage.removeItem('api_secret_token');
    localStorage.removeItem('api_token_expiry');
    return true;
  } catch (error) {
    console.error('Error clearing API token:', error);
    return false;
  }
};

// Check if user is authenticated (has valid token)
export const isAuthenticated = () => {
  return !!getApiToken();
};
