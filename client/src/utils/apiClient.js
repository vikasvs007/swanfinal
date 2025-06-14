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
  getUsers: () => apiClient.get('/user-management'),
  getUserById: (id) => apiClient.get(`/user-management/${id}`),
  createUser: (userData) => apiClient.post('/user-management', userData),
  updateUser: (id, userData) => apiClient.put(`/user-management/${id}`, userData),
  deleteUser: (id) => apiClient.delete(`/user-management/${id}`),
  
  // Products
  getProducts: () => apiClient.get('/product-catalog'),
  getProductById: (id) => apiClient.get(`/product-catalog/${id}`),
  createProduct: (productData) => apiClient.post('/product-catalog', productData),
  updateProduct: (id, productData) => apiClient.put(`/product-catalog/${id}`, productData),
  deleteProduct: (id) => apiClient.delete(`/product-catalog/${id}`),
  
  // Orders
  getOrders: () => apiClient.get('/order-management'),
  getOrderById: (id) => apiClient.get(`/order-management/${id}`),
  createOrder: (orderData) => apiClient.post('/order-management', orderData),
  updateOrder: (id, orderData) => apiClient.put(`/order-management/${id}`, orderData),
  deleteOrder: (id) => apiClient.delete(`/order-management/${id}`),

  // Enquiries
  getEnquiries: () => apiClient.get('/enquiry-handling'),
  getEnquiryById: (id) => apiClient.get(`/enquiry-handling/${id}`),
  createEnquiry: (enquiryData) => apiClient.post('/enquiry-handling', enquiryData),
  updateEnquiry: (id, enquiryData) => apiClient.put(`/enquiry-handling/${id}`, enquiryData),
  deleteEnquiry: (id) => apiClient.delete(`/enquiry-handling/${id}`),

  // Visitors
  getVisitors: () => apiClient.get('/visitor-tracking'),
  getVisitorById: (id) => apiClient.get(`/visitor-tracking/${id}`),
  createVisitor: (visitorData) => apiClient.post('/visitor-tracking', visitorData),
  updateVisitor: (id, visitorData) => apiClient.put(`/visitor-tracking/${id}`, visitorData),
  deleteVisitor: (id) => apiClient.delete(`/visitor-tracking/${id}`),

  // Notifications    
  getNotifications: () => apiClient.get('/notification-center'),
  getNotificationById: (id) => apiClient.get(`/notification-center/${id}`),
  createNotification: (notificationData) => apiClient.post('/notification-center', notificationData),
  updateNotification: (id, notificationData) => apiClient.put(`/notification-center/${id}`, notificationData),
  deleteNotification: (id) => apiClient.delete(`/notification-center/${id}`),

  // Active Users
  getActiveUsers: () => apiClient.get('/active-users'),   
  getActiveUserById: (id) => apiClient.get(`/active-users/${id}`),
  createActiveUser: (activeUserData) => apiClient.post('/active-users', activeUserData),
  updateActiveUser: (id, activeUserData) => apiClient.put(`/active-users/${id}`, activeUserData),
  deleteActiveUser: (id) => apiClient.delete(`/active-users/${id}`),

  // User Analytics
  getUserAnalytics: () => apiClient.get('/user-analytics'),
  getUserAnalyticsById: (id) => apiClient.get(`/user-analytics/${id}`),
  createUserAnalytics: (userAnalyticsData) => apiClient.post('/user-analytics', userAnalyticsData),
  updateUserAnalytics: (id, userAnalyticsData) => apiClient.put(`/user-analytics/${id}`, userAnalyticsData),
  deleteUserAnalytics: (id) => apiClient.delete(`/user-analytics/${id}`),
  
  // Blog Content
  getBlogContent: () => apiClient.get('/blog-content'),
  getBlogContentById: (id) => apiClient.get(`/blog-content/${id}`),
  createBlogContent: (blogContentData) => apiClient.post('/blog-content', blogContentData),
  updateBlogContent: (id, blogContentData) => apiClient.put(`/blog-content/${id}`, blogContentData),
  deleteBlogContent: (id) => apiClient.delete(`/blog-content/${id}`),
  
  // Card System
  getCards: () => apiClient.get('/card-system'),
  getCardById: (id) => apiClient.get(`/card-system/${id}`),
  createCard: (cardData) => apiClient.post('/card-system', cardData),
  updateCard: (id, cardData) => apiClient.put(`/card-system/${id}`, cardData),
  deleteCard: (id) => apiClient.delete(`/card-system/${id}`),

  // Blog Categories
  getBlogCategories: () => apiClient.get('/blog-categories'),
  getBlogCategoryById: (id) => apiClient.get(`/blog-categories/${id}`),
  createBlogCategory: (blogCategoryData) => apiClient.post('/blog-categories', blogCategoryData),
  updateBlogCategory: (id, blogCategoryData) => apiClient.put(`/blog-categories/${id}`, blogCategoryData),
  deleteBlogCategory: (id) => apiClient.delete(`/blog-categories/${id}`),

  // Blog Tags
  getBlogTags: () => apiClient.get('/blog-tags'),
  getBlogTagById: (id) => apiClient.get(`/blog-tags/${id}`),
  createBlogTag: (blogTagData) => apiClient.post('/blog-tags', blogTagData),
  updateBlogTag: (id, blogTagData) => apiClient.put(`/blog-tags/${id}`, blogTagData),
  deleteBlogTag: (id) => apiClient.delete(`/blog-tags/${id}`),
  
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