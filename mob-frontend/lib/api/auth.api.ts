/**
 * Auth API Endpoints
 */

import { apiClient } from './client';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/api.types';

export const authApi = {
  /**
   * Login
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  /**
   * Register
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', userData);
    return data;
  },

  /**
   * Logout (client-side only)
   */
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },
};
