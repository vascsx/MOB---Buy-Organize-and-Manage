import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FamilyProvider } from './contexts/FamilyContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncomesPage } from './pages/IncomesPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { EmergencyFundPage } from './pages/EmergencyFundPage';
import './App.css';

// Componente de rota protegida
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Wrapper para páginas protegidas com layout
const ProtectedPageWithLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PrivateRoute>
      <AppLayout>{children}</AppLayout>
    </PrivateRoute>
  );
};

// Componente de rota pública (redireciona se já estiver autenticado)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <FamilyProvider>
        <BrowserRouter>
          <Routes>
            {/* Rotas públicas */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Rotas protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedPageWithLayout>
                  <DashboardPage />
                </ProtectedPageWithLayout>
              }
            />
            <Route
              path="/incomes"
              element={
                <ProtectedPageWithLayout>
                  <IncomesPage />
                </ProtectedPageWithLayout>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedPageWithLayout>
                  <ExpensesPage />
                </ProtectedPageWithLayout>
              }
            />
            <Route
              path="/investments"
              element={
                <ProtectedPageWithLayout>
                  <InvestmentsPage />
                </ProtectedPageWithLayout>
              }
            />
            <Route
              path="/emergency-fund"
              element={
                <ProtectedPageWithLayout>
                  <EmergencyFundPage />
                </ProtectedPageWithLayout>
              }
            />

            {/* Rota padrão */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </FamilyProvider>
    </AuthProvider>
  );
}

export default App;
