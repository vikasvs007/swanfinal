/**
 * Secure Authentication Utility
 * 
 * This utility handles user authentication with secure HttpOnly cookies
 * instead of localStorage to prevent token exposure in the browser.
 */
import api from './apiClient';

/**
 * Login user and set secure cookie on the server
 * @param {Object} credentials - User credentials
 * @returns {Promise} - The login response
 */
export const login = async (credentials) => {
  try {
    // Send credentials to server for authentication
    const response = await api.request('post', '/api/v1/auth/login', credentials);
    
    // Server will set HttpOnly cookies, so we just need to track login state
    // in memory (or using a client-side only flag with no sensitive data)
    sessionStorage.setItem('isLoggedIn', 'true');
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * Logout user and clear secure cookie on server
 * @returns {Promise} - The logout response
 */
export const logout = async () => {
  try {
    // Call server logout endpoint to clear the cookie
    const response = await api.request('post', '/api/v1/auth/logout');
    
    // Clear client-side login indicator
    sessionStorage.removeItem('isLoggedIn');
    
    return response.data;
  } catch (error) {
    console.error('Logout failed:', error);
    
    // Even if server logout fails, clear client-side state
    sessionStorage.removeItem('isLoggedIn');
    
    throw error;
  }
};

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  // Check client-side indicator
  const loginFlag = sessionStorage.getItem('isLoggedIn');
  
  // For more reliability, you can verify with the server
  return loginFlag === 'true';
};

/**
 * Get current user profile
 * @returns {Promise} - The user profile data
 */
export const getCurrentUser = async () => {
  try {
    // The server will use the HttpOnly cookie to authenticate this request
    const response = await api.request('get', '/api/v1/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Failed to get user profile:', error);
    throw error;
  }
};

export default {
  login,
  logout,
  isAuthenticated,
  getCurrentUser
}; 