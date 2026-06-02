import axios from 'axios';
import { toast } from '@/hooks/use-toast';

const API_BASE_URL = (import.meta.env as any)?.VITE_API_URL || 'http://localhost:3000';

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
        toast({ title: 'Session expired. Please login again.', variant: 'destructive' });
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      toast({ title: 'You do not have permission to perform this action.', variant: 'destructive' });
      return Promise.reject(error);
    }

    // Network errors (no response) — let the caller show the appropriate message
    if (!error.response) {
      return Promise.reject(error);
    }

    // Handle other errors with a message from the backend
    if (error.response?.data) {
      const errorData = error.response.data as any;
      if (errorData?.message) {
        toast({ title: errorData.message, variant: 'destructive' });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

export const getTenantId = (): string => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try { return JSON.parse(userData).tenantId || 'default'; } catch { /* */ }
    }
  }
  return 'default';
};

// Helper to map paginated backend response to array + meta
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export const extractPaginated = <T>(response: any): PaginatedResponse<T> => ({
  data: response.data,
  total: parseInt(response.headers?.['x-total-count'] || '0', 10),
  page: parseInt(response.headers?.['x-page'] || '1', 10),
  perPage: parseInt(response.headers?.['x-per-page'] || '10', 10),
});

