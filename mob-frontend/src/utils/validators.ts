/**
 * Valida email
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida senha (mínimo 6 caracteres)
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Valida se splits somam 100%
 */
export const validateSplits = (splits: { percentage: number }[]): boolean => {
  const total = splits.reduce((sum, split) => sum + split.percentage, 0);
  // Tolerância de 0.01% para erros de arredondamento
  return total >= 99.99 && total <= 100.01;
};

/**
 * Valida valor positivo
 */
export const isPositiveNumber = (value: number): boolean => {
  return value > 0;
};

/**
 * Valida porcentagem (0-100)
 */
export const isValidPercentage = (value: number): boolean => {
  return value >= 0 && value <= 100;
};
