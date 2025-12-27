import apiClient, { unwrapResponse } from './client';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';
import { APIResponse } from '../types/api.types';

export const authAPI = {
  /**
   * Login
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<APIResponse<AuthResponse>>('/login', data);
    return unwrapResponse(response);
  },

  /**
   * Register
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<APIResponse<AuthResponse>>('/register', data);
    return unwrapResponse(response);
  },
};
