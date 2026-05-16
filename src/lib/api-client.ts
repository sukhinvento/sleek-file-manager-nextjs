import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Helper function to set auth token
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

// Helper function to clear auth token
export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      clearAuthToken();
      
      // Only redirect if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
      return Promise.reject(error);
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      toast.error('Unable to connect to server. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle other errors
    if (error.response?.data) {
      const errorData = error.response.data as any;
      if (errorData?.message) {
        toast.error(errorData.message);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

