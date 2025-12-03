import apiService from '@/lib/api';
import { setAuthToken, setUserData, setStorageItem, removeAuthToken, removeUserData } from '@/utils/storage';
import { AUTH_CONFIG } from '@/constants';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      phone?: string;
    };
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post('/auth/login', credentials);

    if (response.data.status === 'success' && response.data.data) {
      // Store tokens and user data
      await setAuthToken(response.data.data.accessToken);
      await setStorageItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY, response.data.data.refreshToken);
      await setUserData(response.data.data.user);
    }

    return response.data;
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await apiService.post('/auth/register', data);

    if (response.data.status === 'success' && response.data.data) {
      // Store tokens and user data
      await setAuthToken(response.data.data.accessToken);
      await setStorageItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY, response.data.data.refreshToken);
      await setUserData(response.data.data.user);
    }

    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout', {});
    } catch (error) {
      // Continue with local logout even if API call fails
      console.warn('Logout API call failed, proceeding with local logout');
    } finally {
      // Clear local storage
      await removeAuthToken();
      await removeUserData();
      await setStorageItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY, null);
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ status: string; message: string }> {
    const response = await apiService.post('/auth/forgot-password', data);
    return response.data;
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ status: string; message: string }> {
    const response = await apiService.post('/auth/reset-password', data);
    return response.data;
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ status: string; message: string }> {
    const response = await apiService.post('/auth/change-password', data);
    return response.data;
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<{ status: string; message: string }> {
    const response = await apiService.post('/auth/verify-email', { token });
    return response.data;
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<{ status: string; message: string }> {
    const response = await apiService.post('/auth/resend-verification', {});
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<any> {
    const response = await apiService.get('/auth/me');
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<{ name: string; phone: string }>): Promise<any> {
    const response = await apiService.patch('/auth/profile', data);

    // Update local user data
    if (response.data.status === 'success' && response.data.data) {
      await setUserData(response.data.data);
    }

    return response.data;
  }
}

export const authService = new AuthService();
export default authService;
