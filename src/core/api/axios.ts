
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { authService } from '../services/authService';
import type { User } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const STORAGE_KEY = 'daba_user';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface InternalAxiosConfig extends InternalAxiosRequestConfig {
  __isRetry?: boolean;
  skipAuthRefresh?: boolean;
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosConfig) => {
    // Get user from localStorage
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        const token = user?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosConfig;

    // Handle errors
    if (error.response?.status === 401) {
      const skipAuthRefresh = originalRequest?.skipAuthRefresh === true;

      // Try to refresh token once
      if (!skipAuthRefresh && !originalRequest?.__isRetry) {
        originalRequest.__isRetry = true;
        try {
          const refreshed = await authService.refreshToken();
          if (refreshed && refreshed.accessToken) {
            originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
            return axiosInstance.request(originalRequest);
          }
        } catch {
          // Refresh failed -> fall through to force logout
        }
      }

      // Unauthorized - clear user and redirect to login
      localStorage.removeItem(STORAGE_KEY);
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      console.error('Forbidden: You do not have permission to access this resource');
    } else if (error.response?.status === 500) {
      console.error('Server error: Please try again later');
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
