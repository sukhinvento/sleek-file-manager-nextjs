import apiClient, { setAuthToken, clearAuthToken } from '@/lib/api-client';

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  roles: string[];
  scopes: string[];
  tenantId: string;
  // legacy shape support
  user?: {
    userId: string;
    username: string;
    roles: string[];
    scopes?: string[];
    tenantId?: string;
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
      setAuthToken(response.data.access_token);
      // Normalise user data from either response shape
      const raw = response.data.user ?? response.data as any;
      const userData = {
        userId: raw.userId || raw.sub || raw._id || '',
        username: raw.username || credentials.username,
        name: raw.name || raw.full_name || raw.display_name || raw.fullName || '',
        roles: raw.roles || response.data.roles || [],
        scopes: raw.scopes || response.data.scopes || [],
        tenantId: raw.tenantId || response.data.tenantId || 'default',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(userData));
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

// --- Profile APIs ---

export interface UserProfile {
  _id: string;
  username: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  roles: string[];
  scopes?: string[];
  status?: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
}

/**
 * Fetch the current user's profile
 * API: GET /auth/profile
 */
export const getProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>('/auth/profile');
  return response.data;
};

/**
 * Update the current user's profile
 * API: PATCH /auth/profile
 */
export const updateProfile = async (data: UpdateProfilePayload): Promise<UserProfile> => {
  const response = await apiClient.patch<UserProfile>('/auth/profile', data);
  // Sync localStorage with latest profile data
  if (typeof window !== 'undefined') {
    const existing = localStorage.getItem('user_data');
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        localStorage.setItem('user_data', JSON.stringify({
          ...parsed,
          name: response.data.name || parsed.name,
        }));
      } catch { /* ignore */ }
    }
  }
  return response.data;
};

/**
 * Change password
 * API: POST /auth/profile/change-password
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/auth/profile/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const authService = {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  hasRole,
  hasAnyRole,
  getProfile,
  updateProfile,
  changePassword,
};

export default authService;



