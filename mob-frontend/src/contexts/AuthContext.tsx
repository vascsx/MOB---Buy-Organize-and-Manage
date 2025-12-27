import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';
import { authAPI } from '../api/auth.api';
import { saveToken, saveUser, getToken, getUser, clearStorage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega token/user do localStorage ao iniciar
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response: AuthResponse = await authAPI.login(credentials);
    
    // Salva no state e localStorage
    setToken(response.token);
    setUser(response.user);
    saveToken(response.token);
    saveUser(response.user);
  };

  const register = async (data: RegisterRequest) => {
    const response: AuthResponse = await authAPI.register(data);
    
    // Auto-login após registro
    setToken(response.token);
    setUser(response.user);
    saveToken(response.token);
    saveUser(response.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearStorage();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
