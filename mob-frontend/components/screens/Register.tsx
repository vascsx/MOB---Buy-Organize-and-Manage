import { useState, useEffect } from 'react';
import { Eye, EyeOff, TrendingUp, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface RegisterProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

type PasswordStrength = 'weak' | 'medium' | 'strong';

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  // Calcular força da senha
  useEffect(() => {
    if (!password) {
      setPasswordStrength('weak');
      return;
    }

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 3) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [password]);

  // Verificar se senhas coincidem
  useEffect(() => {
    setPasswordsMatch(password.length > 0 && password === confirmPassword);
  }, [password, confirmPassword]);

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'strong':
        return '#10B981';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'Senha fraca';
      case 'medium':
        return 'Senha média';
      case 'strong':
        return 'Senha forte';
    }
  };

  const getStrengthWidth = () => {
    switch (passwordStrength) {
      case 'weak':
        return '33%';
      case 'medium':
        return '66%';
      case 'strong':
        return '100%';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordsMatch) return;
    
    setIsLoading(true);

    // Simulação de registro
    setTimeout(() => {
      onRegister();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#F3E8FF] to-[#F0F9FF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-2xl mb-4 shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MOB Finance</h1>
        </div>

        {/* Card de Registro */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Crie sua conta gratuita</h2>
            <p className="text-gray-600">Leva menos de 1 minuto</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-gray-700 mb-2 block">
                Nome completo
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva"
                className="h-12 text-base"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700 mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="h-12 text-base"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 mb-2 block">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="h-12 text-base pr-12"
                  disabled={isLoading}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Indicador de Força da Senha */}
              {password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: getStrengthColor() }}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: getStrengthWidth(),
                        backgroundColor: getStrengthColor(),
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 mb-2 block">
                Confirmar senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  className="h-12 text-base pr-12"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Feedback Positivo */}
              {passwordsMatch && confirmPassword && (
                <div className="mt-2 flex items-center gap-2 text-[#10B981] text-sm animate-in fade-in duration-300">
                  <Check className="w-4 h-4" />
                  <span>As senhas coincidem</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !passwordsMatch || !password}
              className="w-full h-12 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium text-base disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Criando sua conta...
                </span>
              ) : (
                'Criar conta gratuita'
              )}
            </Button>

            {/* Termos */}
            <p className="text-xs text-gray-500 text-center">
              Ao criar uma conta, você concorda com os{' '}
              <button type="button" className="text-[#3B82F6] hover:underline">
                Termos
              </button>{' '}
              e{' '}
              <button type="button" className="text-[#3B82F6] hover:underline">
                Política de Privacidade
              </button>
            </p>
          </form>

          {/* CTA Secundário */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já tem conta?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors"
              >
                Fazer login
              </button>
            </p>
          </div>

          {/* Prova Social */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-2xl mb-1 block">🚀</span>
                <p className="text-xs text-gray-600">Setup rápido</p>
              </div>
              <div>
                <span className="text-2xl mb-1 block">🔒</span>
                <p className="text-xs text-gray-600">100% seguro</p>
              </div>
              <div>
                <span className="text-2xl mb-1 block">💰</span>
                <p className="text-xs text-gray-600">Sem cartão</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
