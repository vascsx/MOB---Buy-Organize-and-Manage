import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { Login } from './components/screens/Login';
import { Register } from './components/screens/Register';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => window.location.href = '/'} onSwitchToRegister={() => window.location.href = '/register'} />} />
        <Route path="/register" element={<Register onRegister={() => window.location.href = '/login'} onSwitchToLogin={() => window.location.href = '/login'} />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
