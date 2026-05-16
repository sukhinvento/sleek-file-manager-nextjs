import apiClient, { setAuthToken, clearAuthToken } from '@/lib/api-client';

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    userId: string;
    username: string;
    roles: string[];
  };
}

interface User {
  userId: string;
  username: string;
  roles: string[];
}

/**
 * Login user and store auth token
 * API: POST /auth/login
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.data.access_token) {
      // Store token
      setAuthToken(response.data.access_token);
      
      // Store user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user and clear auth token
 * API: POST /auth/logout
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuthToken();
  }
};

/**
 * Get current user data from localStorage
 */
export const getCurrentUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
  }
  return null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }
  return false;
};

/**
 * Check if user has specific role
 */
export const hasRole = (role: string): boolean => {
  const user = getCurrentUser();
  return user?.roles?.includes(role) || false;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (roles: string[]): boolean => {
  const user = getCurrentUser();
  return roles.some(role => user?.roles?.includes(role)) || false;
};

export const authService = {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  hasRole,
  hasAnyRole,
};

export default authService;



