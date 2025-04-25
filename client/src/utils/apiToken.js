/**
 * API Token Management Utilities
 * 
 * This file contains functions for managing API tokens used for programmatic 
 * access to the API without requiring user login.
 */

/**
 * Set the API token in localStorage
 * @param {string} token - The API token to store
 */
export const setApiToken = (token) => {
  if (!token) {
    console.error('Cannot set empty API token');
    return false;
  }
  
  try {
    localStorage.setItem('apiToken', token);
    return true;
  } catch (error) {
    console.error('Failed to store API token:', error);
    return false;
  }
};

/**
 * Get the current API token from localStorage
 * @returns {string|null} The API token or null if not set
 */
export const getApiToken = () => {
  return localStorage.getItem('apiToken');
};

/**
 * Remove the API token from localStorage
 */
export const removeApiToken = () => {
  localStorage.removeItem('apiToken');
};

/**
 * Check if an API token is set
 * @returns {boolean} True if an API token exists
 */
export const hasApiToken = () => {
  return !!getApiToken();
};

/**
 * Initialize API token from environment variable (if available)
 * This should be called during application startup
 */
export const initializeApiToken = () => {
  // Check if there's an API token in the environment
  const envApiToken = process.env.REACT_APP_API_TOKEN;
  
  // If we have an environment token and no token is currently stored, use it
  if (envApiToken && !getApiToken()) {
    setApiToken(envApiToken);
    return true;
  }
  
  return false;
}; 