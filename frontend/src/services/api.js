import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Axios instance with base URL and JWT interceptors
 */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bookworm_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bookworm_token');
      localStorage.removeItem('bookworm_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
