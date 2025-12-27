import React from 'react';
import './main.css';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import App from './App';
import { Login } from './components/screens/Login';
import { Register } from './components/screens/Register';

function LoginWrapper() {
  const navigate = useNavigate();
  return (
    <Login 
      onLogin={() => {}} // O hook useAuth já navega automaticamente
      onSwitchToRegister={() => navigate('/register')} 
    />
  );
}

function RegisterWrapper() {
  const navigate = useNavigate();
  return (
    <Register 
      onRegister={() => {}} // O hook useAuth já navega automaticamente
      onSwitchToLogin={() => navigate('/login')} 
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/register" element={<RegisterWrapper />} />
        <Route path="/dashboard" element={<App />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
