import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { isValidEmail, isValidPassword } from '../../utils/validators';

/* =========================
   Password Strength
========================= */
const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const strength = useMemo(() => {
    if (!password) return { level: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Fraca', color: 'bg-red-500' };
    if (score === 2) return { level: 2, label: 'Média', color: 'bg-yellow-500' };
    if (score === 3) return { level: 3, label: 'Boa', color: 'bg-blue-500' };
    return { level: 4, label: 'Forte', color: 'bg-green-500' };
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full ${
              level <= strength.level ? strength.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">Senha: {strength.label}</p>
    </div>
  );
};

/* =========================
   Register Page
========================= */
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const newErrors = { name: '', email: '', password: '', confirmPassword: '' };
    let valid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
      valid = false;
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
      valid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
      valid = false;
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    try {
      setIsLoading(true);
      await register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setApiError(err?.error || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
      setErrors({ ...errors, [field]: '' });
    };

  const handleBlur = (field: keyof typeof touched) => () =>
    setTouched({ ...touched, [field]: true });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Criar conta</h1>
        <p className="text-center text-gray-600 mb-6">
          100% gratuito • Sem cartão
        </p>

        {apiError && (
          <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome completo"
            value={formData.name}
            onChange={handleChange('name')}
            onBlur={handleBlur('name')}
            error={touched.name ? errors.name : ''}
            autoComplete="name"
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
            error={touched.email ? errors.email : ''}
            autoComplete="email"
            required
          />

          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              onBlur={handleBlur('password')}
              error={touched.password ? errors.password : ''}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
            <PasswordStrength password={formData.password} />
          </div>

          <div className="relative">
            <Input
              label="Confirmar senha"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              error={touched.confirmPassword ? errors.confirmPassword : ''}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-9 text-gray-500"
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-12">
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-blue-600 font-semibold">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};
