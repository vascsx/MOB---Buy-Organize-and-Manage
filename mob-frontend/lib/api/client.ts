/**
 * API Client Configuration
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError, AxiosResponse } from 'axios';

// Base URL do backend
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:8080/api';

// Criar instância do Axios
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== REQUEST INTERCEPTOR =====
// Adiciona token JWT em todas as requisições
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== RESPONSE INTERCEPTOR =====
// Trata erros globalmente e extrai o campo 'data' das respostas
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Se a resposta tem o formato {success: true, data: ...}, extrair o campo data
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error: AxiosError) => {
    // Token expirado ou inválido
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }

    // Forbidden
    if (error.response?.status === 403) {
      console.error('Acesso negado:', error.response.data);
    }

    // Server error
    if (error.response?.status && error.response.status >= 500) {
      console.error('Erro no servidor:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// ===== HELPER FUNCTIONS =====

/**
 * Extrai mensagem de erro da resposta da API
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    return (
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      'Erro desconhecido'
    );
  }
  return 'Erro desconhecido';
};

/**
 * Storage helpers para token e dados do usuário
 */
export const storage = {
  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
  },
  
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },
  
  removeToken: () => {
    localStorage.removeItem('auth_token');
  },
  
  setUser: (user: any) => {
    localStorage.setItem('user_data', JSON.stringify(user));
  },
  
  getUser: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },
  
  removeUser: () => {
    localStorage.removeItem('user_data');
  },
  
  clear: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },
};

export default apiClient;
