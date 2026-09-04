import axios from 'axios';
import { toast } from 'sonner';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Attach token to outgoing requests
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Automatically intercept 401 errors and force logout
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // THE FIX: Check if the error is 401 AND make sure it's NOT a delete order request!
    const isDeleteOrderRequest = error.config.method === 'delete' && error.config.url.includes('/orders/');

    if (error.response && error.response.status === 401 && !isDeleteOrderRequest) {
      // Clear the invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Prevent spamming toasts
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login'; // Redirect to login page
      }
    }

    // If it WAS a delete order request that failed, we just return the error
    // without redirecting, so the AdminDashboard can show a toast instead!
    return Promise.reject(error);
  }
);

export default axiosClient;