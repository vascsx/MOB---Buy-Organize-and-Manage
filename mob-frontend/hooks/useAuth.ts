/**
 * useAuth Hook
 * Gerencia autenticação, login, logout e estado do usuário
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api/auth.api';
import { storage, getErrorMessage } from '../lib/api/client';
import type { User, LoginRequest, RegisterRequest } from '../lib/types/api.types';
import { useToast } from './useToast';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Carregar usuário do localStorage ao montar
  useEffect(() => {
    const token = storage.getToken();
    const userData = storage.getUser();

    if (token && userData) {
      setUser(userData);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.login(credentials);

      storage.setToken(response.token);
      storage.setUser(response.user);
      setUser(response.user);

      navigate('/dashboard');
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao fazer login', { description: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.register(userData);

      storage.setToken(response.token);
      storage.setUser(response.user);
      setUser(response.user);

      navigate('/dashboard');
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao registrar', { description: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    storage.clear();
    setUser(null);
    navigate('/login');
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
};
