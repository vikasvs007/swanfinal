/**
 * Secure API Client Utility
 * 
 * This file provides a client for making API requests through our server-side proxy,
 * which prevents API tokens from being exposed in the browser network tab.
 */
import axios from 'axios';

// Create the API client instance with credentials mode to allow cookies
const apiClient = axios.create({
  baseURL: '/proxy/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // This is crucial for cookies to be sent with requests
  withCredentials: true
});

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle common errors
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      if (error.response.status === 401) {
        // Unauthorized - could trigger a logout or authentication flow
        console.error('Authentication error:', error.response.data.message);
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else if (error.response.status === 403) {
        // Forbidden - user doesn't have permission
        console.error('Permission denied:', error.response.data.message);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error - no response received from server');
    } else {
      // Error in setting up the request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API methods for data fetching
const api = {
  // Users
  getUsers: () => apiClient.get('/users'),
  getUserById: (id) => apiClient.get(`/users/${id}`),
  createUser: (userData) => apiClient.post('/users', userData),
  updateUser: (id, userData) => apiClient.put(`/users/${id}`, userData),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
  
  // Products
  getProducts: () => apiClient.get('/v1/data/items'),
  getProductById: (id) => apiClient.get(`/v1/data/items/${id}`),
  createProduct: (productData) => apiClient.post('/v1/data/items', productData),
  updateProduct: (id, productData) => apiClient.put(`/v1/data/items/${id}`, productData),
  deleteProduct: (id) => apiClient.delete(`/v1/data/items/${id}`),
  
  // Orders
  getOrders: () => apiClient.get('/orders/list'),
  getOrderById: (id) => apiClient.get(`/orders/details/${id}`),
  createOrder: (orderData) => apiClient.post('/orders/create', orderData),
  updateOrder: (id, orderData) => apiClient.put(`/orders/update/${id}`, orderData),
  deleteOrder: (id) => apiClient.delete(`/orders/remove/${id}`),
  
  // General request method for custom endpoints
  request: (method, endpoint, data = null, config = {}) => {
    method = method.toLowerCase();
    
    if (method === 'get') {
      return apiClient.get(endpoint, { ...config, params: data });
    } else if (method === 'post') {
      return apiClient.post(endpoint, data, config);
    } else if (method === 'put') {
      return apiClient.put(endpoint, data, config);
    } else if (method === 'delete') {
      return apiClient.delete(endpoint, { ...config, data });
    } else if (method === 'patch') {
      return apiClient.patch(endpoint, data, config);
    } else {
      throw new Error(`Unsupported method: ${method}`);
    }
  }
};

export default api; 