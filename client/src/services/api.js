import axios from 'axios';
import e from 'express';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.REACT_APP_API_SECRET_TOKEN}`
  }
});

// Add request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if it exists
    const token = process.env.REACT_APP_API_SECRET_TOKEN;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error
      localStorage.removeItem('auth_token');
      // You can redirect to login page here if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const productAPI = {
  getAll: () => api.get('/product-catalog'),
  getById: (id) => api.get(`/product-catalog/${id}`),
  create: (data) => api.post('/product-catalog', data),
  update: (id, data) => api.put(`/product-catalog/${id}`, data),
  delete: (id) => api.delete(`/product-catalog/${id}`)
};

export const userAPI = {
  getAll: () => api.get('/user-management'),
  getById: (id) => api.get(`/user-management/${id}`),
  create: (data) => api.post('/user-management', data),
  update: (id, data) => api.put(`/user-management/${id}`, data),
  delete: (id) => api.delete(`/user-management/${id}`)
};

export const orderAPI = {
  getAll: () => api.get('/order-management'),
  getById: (id) => api.get(`/order-management/${id}`),
  create: (data) => api.post('/order-management', data),
  update: (id, data) => api.put(`/order-management/${id}`, data)
};

export const blogAPI = {
  getAll: () => api.get('/blog-content'),
  getById: (id) => api.get(`/blog-content/${id}`),
  create: (data) => api.post('/blog-content', data),
  update: (id, data) => api.put(`/blog-content/${id}`, data),
  delete: (id) => api.delete(`/blog-content/${id}`)
};

export const cardAPI = {
  getAll: () => api.get('/card-system'),
  getById: (id) => api.get(`/card-system/${id}`),
  create: (data) => api.post('/card-system', data),
  update: (id, data) => api.put(`/card-system/${id}`, data),
  delete: (id) => api.delete(`/card-system/${id}`)
};

export const visitorAPI = {
  getAll: () => api.get('/visitor-tracking'),
  getById: (id) => api.get(`/visitor-tracking/${id}`),
  create: (data) => api.post('/visitor-tracking', data),
  update: (id, data) => api.put(`/visitor-tracking/${id}`, data),
  delete: (id) => api.delete(`/visitor-tracking/${id}`)
};

export const notificationAPI = {
  getAll: () => api.get('/notification-center'),
  getById: (id) => api.get(`/notification-center/${id}`),
  create: (data) => api.post('/notification-center', data),
  update: (id, data) => api.put(`/notification-center/${id}`, data),
  delete: (id) => api.delete(`/notification-center/${id}`)
};
export const activeUserAPI = {
  getAll: () => api.get('/active-users'),
  getById: (id) => api.get(`/active-users/${id}`),
  create: (data) => api.post('/active-users', data),
  update: (id, data) => api.put(`/active-users/${id}`, data),
  delete: (id) => api.delete(`/active-users/${id}`)
};
export const userAnalyticsAPI = {
  getAll: () => api.get('/user-analytics'),
  getById: (id) => api.get(`/user-analytics/${id}`),
  create: (data) => api.post('/user-analytics', data),
  update: (id, data) => api.put(`/user-analytics/${id}`, data),
  delete: (id) => api.delete(`/user-analytics/${id}`)
};

export const cardSystemAPI = {
  getAll: () => api.get('/card-system'),
  getById: (id) => api.get(`/card-system/${id}`),
  create: (data) => api.post('/card-system', data),
  update: (id, data) => api.put(`/card-system/${id}`, data),
  delete: (id) => api.delete(`/card-system/${id}`)
};

export const enquiryHandlingAPI = {
  getAll: () => api.get('/enquiry-handling'),
  getById: (id) => api.get(`/enquiry-handling/${id}`),
  create: (data) => api.post('/enquiry-handling', data),
  update: (id, data) => api.put(`/enquiry-handling/${id}`, data),
  delete: (id) => api.delete(`/enquiry-handling/${id}`)
};
export const blogContentAPI = {
  getAll: () => api.get('/blog-content'),
  getById: (id) => api.get(`/blog-content/${id}`),
  create: (data) => api.post('/blog-content', data),
  update: (id, data) => api.put(`/blog-content/${id}`, data),
  delete: (id) => api.delete(`/blog-content/${id}`)
};
export const orderManagementAPI = {
  getAll: () => api.get('/order-management'),
  getById: (id) => api.get(`/order-management/${id}`),
  create: (data) => api.post('/order-management', data),
  update: (id, data) => api.put(`/order-management/${id}`, data),
  delete: (id) => api.delete(`/order-management/${id}`)
};

export const productCatalogAPI = {
  getAll: () => api.get('/product-catalog'),
  getById: (id) => api.get(`/product-catalog/${id}`),
  create: (data) => api.post('/product-catalog', data),
  update: (id, data) => api.put(`/product-catalog/${id}`, data),
  delete: (id) => api.delete(`/product-catalog/${id}`)
};
export const userManagementAPI = {
  getAll: () => api.get('/user-management'),
  getById: (id) => api.get(`/user-management/${id}`),
  create: (data) => api.post('/user-management', data),
  update: (id, data) => api.put(`/user-management/${id}`, data),
  delete: (id) => api.delete(`/user-management/${id}`)
};



// Auth helper functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('auth_token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

export default api; 