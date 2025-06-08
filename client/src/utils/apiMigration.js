/**
 * API Migration Utility
 * 
 * This file provides functions to help migrate existing code to use the secure API client.
 */
import api from './apiClient';

/**
 * Transform a URL from direct external API call to our proxy format
 * @param {string} originalUrl - The original external API URL
 * @returns {string} - The endpoint path for our proxy
 * 
 * Example:
 * convertUrlToProxyEndpoint('https://api.example.com/users/123') => '/users/123'
 */
export const convertUrlToProxyEndpoint = (originalUrl) => {
  try {
    const url = new URL(originalUrl);
    
    // Extract the path from the URL
    let path = url.pathname;
    
    // Remove leading slash if present as our API client will add it
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    
    // If there was a query string, we'll need to handle it separately
    // in the API call params, not in the endpoint URL
    return path;
  } catch (error) {
    // If the URL is invalid or already relative, return as is
    return originalUrl.replace(/^\//, '');
  }
};

/**
 * Extract query parameters from a URL
 * @param {string} originalUrl - The original URL with query parameters
 * @returns {Object} - An object with the query parameters
 */
export const extractQueryParams = (originalUrl) => {
  try {
    const url = new URL(originalUrl);
    const params = {};
    
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  } catch (error) {
    // If URL parsing fails, return empty object
    return {};
  }
};

/**
 * Convert a legacy fetch or axios call to use the secure API client
 * 
 * @example
 * // Instead of:
 * fetch('https://api.example.com/users?active=true', {
 *   headers: { 'Authorization': `Bearer ${token}` }
 * })
 * 
 * // Do:
 * migrateApiCall('https://api.example.com/users?active=true', { method: 'GET' })
 * 
 * @param {string} url - The original URL
 * @param {Object} options - Original fetch/axios options
 * @returns {Promise} - The API response
 */
export const migrateApiCall = (url, options = {}) => {
  const method = (options.method || 'GET').toLowerCase();
  const endpoint = convertUrlToProxyEndpoint(url);
  const params = extractQueryParams(url);
  
  // For GET requests, params go in the 2nd argument
  // For other methods, they'd be added to the data object if needed
  if (method === 'get') {
    return api.request(method, endpoint, params);
  }
  
  // For POST, PUT, etc. the data goes in the 2nd argument
  return api.request(method, endpoint, params);
};

export default {
  convertUrlToProxyEndpoint,
  extractQueryParams,
  migrateApiCall
}; 