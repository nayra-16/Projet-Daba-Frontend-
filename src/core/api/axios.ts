
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('daba_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle errors
    if (error.response?.status === 401) {
      // Unauthorized - clear user and redirect to login
      localStorage.removeItem('daba_user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.error('Forbidden: You do not have permission to access this resource');
    } else if (error.response?.status === 500) {
      console.error('Server error: Please try again later');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
