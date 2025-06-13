/**
 * Secure API Client Utility
 * 
 * This file provides a client for making API requests through our server-side proxy,
 * which prevents API tokens from being exposed in the browser network tab.
 */
import axios from 'axios';

// Create the API client instance with credentials mode to allow cookies
const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_BASE_URL 
    : '/proxy/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // This is crucial for cookies to be sent with requests
  withCredentials: true
});

// Add request interceptor for consistent header handling
apiClient.interceptors.request.use(
  (config) => {
    // Get API token from environment or localStorage
    const apiToken = process.env.REACT_APP_API_SECRET_TOKEN || localStorage.getItem('apiToken');
    
    // Always add API token in production
    if (process.env.NODE_ENV === 'production' && apiToken) {
      config.headers['Authorization'] = `ApiKey ${apiToken}`;
    }

    // Ensure proper content type for POST/PUT requests
    if (['post', 'put'].includes(config.method?.toLowerCase())) {
      // For FormData, let the browser set the content type
      if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }
      
      // Validate request data before sending
      if (config.data && typeof config.data === 'object') {
        // Remove undefined values
        Object.keys(config.data).forEach(key => {
          if (config.data[key] === undefined) {
            delete config.data[key];
          }
        });
        
        // Convert empty strings to null for required fields
        Object.keys(config.data).forEach(key => {
          if (config.data[key] === '') {
            config.data[key] = null;
          }
        });
      }
    }
    
    // Log request details in production for debugging
    if (process.env.NODE_ENV === 'production') {
      console.log('[API Request]', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        baseURL: config.baseURL,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle common errors
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      if (error.response.status === 400) {
        // Handle validation errors
        const errorData = error.response.data;
        let errorMessage = 'Validation failed';
        
        if (errorData.errors) {
          // Handle array of validation errors
          errorMessage = errorData.errors.map(err => err.message || err).join(', ');
        } else if (errorData.message) {
          // Handle single validation error message
          errorMessage = errorData.message;
        }
        
        console.error('[API Error] Validation Error:', {
          message: errorMessage,
          data: errorData,
          request: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
          }
        });
        
        // Throw a more user-friendly error
        throw new Error(errorMessage);
      } else if (error.response.status === 401) {
        console.error('[API Error] Authentication error:', error.response.data.message);
        localStorage.removeItem('apiToken');
      } else if (error.response.status === 403) {
        console.error('[API Error] Permission denied:', error.response.data.message);
      } else if (error.response.status === 0) {
        console.error('[API Error] CORS or network error - no response received');
      }
      
      // Log detailed error in production
      if (process.env.NODE_ENV === 'production') {
        console.error('[API Error Details]', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
          config: {
            url: error.config.url,
            method: error.config.method,
            headers: error.config.headers,
            data: error.config.data
          }
        });
      }
    } else if (error.request) {
      console.error('[API Error] Network error - no response received from server');
    } else {
      console.error('[API Error] Request error:', error.message);
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
  
  // Blog endpoints
  getBlogs: () => apiClient.get('/v1/data/blogs/posts'),
  getBlogById: (id) => apiClient.get(`/v1/data/blogs/posts/${id}`),
  getBlogBySlug: (slug) => apiClient.get(`/v1/data/blogs/posts/slug/${slug}`),
  getBlogCategories: () => apiClient.get('/v1/data/blogs/categories'),
  getBlogTags: () => apiClient.get('/v1/data/blogs/tags'),
  uploadBlogImage: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return apiClient.post('/v1/data/blogs/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  createBlog: (blogData) => apiClient.post('/v1/data/blogs/posts/create', blogData),
  updateBlog: (id, blogData) => apiClient.put(`/v1/data/blogs/posts/update/${id}`, blogData),
  deleteBlog: (id) => apiClient.delete(`/v1/data/blogs/posts/remove/${id}`),
  
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

/**
 * Verify API configuration and log any issues
 * This should be called during app initialization
 */
export const verifyApiConfig = () => {
  const config = {
    baseURL: process.env.REACT_APP_BASE_URL,
    apiToken: process.env.REACT_APP_API_SECRET_TOKEN,
    environment: process.env.NODE_ENV
  };

  // Log configuration status
  console.log('[API Config] Current configuration:', {
    ...config,
    apiToken: config.apiToken ? 'Present' : 'Missing',
    baseURL: config.baseURL || 'Not set'
  });

  // Check for required configuration
  const issues = [];
  
  if (!config.baseURL) {
    issues.push('REACT_APP_BASE_URL is not set');
  }
  
  if (config.environment === 'production' && !config.apiToken) {
    issues.push('REACT_APP_API_SECRET_TOKEN is not set in production');
  }

  if (issues.length > 0) {
    console.error('[API Config] Configuration issues found:', issues);
    return false;
  }

  return true;
};

export default api; 