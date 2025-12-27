import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, clearStorage } from '../utils/storage';
import { APIError } from '../types/api.types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Cria instância do axios
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor de requisição (adiciona token JWT)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta (trata erros globalmente)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<APIError>) => {
    // Token expirado ou inválido → logout
    if (error.response?.status === 401) {
      clearStorage();
      window.location.href = '/login';
    }

    // Retorna erro formatado
    const apiError: APIError = error.response?.data || {
      success: false,
      error: error.message || 'Erro desconhecido',
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;

// Helper para extrair dados da resposta
export const unwrapResponse = <T>(response: any): T => {
  return response.data?.data || response.data;
};
