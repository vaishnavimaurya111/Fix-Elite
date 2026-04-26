import axios from 'axios';

// Create axios instance with base URL (proxied to backend in development)
const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('fixnow_user');
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        // Assuming backend returns token alongside user data
        // For our new backend, we need to store token separately or inside user object
        // Let's assume we store it in localStorage as 'fixnow_token'
        const token = localStorage.getItem('fixnow_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
