/**
 * Money Utilities
 * Conversão e formatação de valores monetários
 */

/**
 * Converte centavos para reais
 */
export const centsToReal = (cents: number): number => {
  return cents / 100;
};

/**
 * Converte reais para centavos
 */
export const realToCents = (real: number): number => {
  return Math.round(real * 100);
};

/**
 * Formata centavos para moeda brasileira
 */
export const formatMoney = (cents: number, showSymbol: boolean = true): string => {
  const value = centsToReal(cents);
  const formatted = value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return showSymbol ? `R$ ${formatted}` : formatted;
};

/**
 * Formata centavos para moeda brasileira com sinal
 */
export const formatMoneyWithSign = (cents: number): string => {
  const sign = cents >= 0 ? '+' : '';
  return `${sign}${formatMoney(cents)}`;
};

/**
 * Formata percentual
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calcula percentual de um valor sobre o total
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Parse de string monetária para centavos
 */
export const parseMoneyToCents = (moneyString: string): number => {
  // Remove R$, espaços e pontos de milhar
  const cleaned = moneyString
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : realToCents(value);
};

/**
 * Máscara de input para dinheiro
 */
export const moneyMask = (value: string): string => {
  // Remove tudo exceto números
  let numericValue = value.replace(/\D/g, '');
  
  // Converte para número e depois formata
  const cents = parseInt(numericValue || '0');
  const formatted = formatMoney(cents, false);
  
  return `R$ ${formatted}`;
};
