import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if it exists
    const token = localStorage.getItem('auth_token');
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
  login: (credentials) => api.post('/user-management/login', credentials),
  register: (userData) => api.post('/user-management/register', userData),
  getProfile: () => api.get('/user-management/profile'),
  updateProfile: (data) => api.put('/user-management/profile', data)
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