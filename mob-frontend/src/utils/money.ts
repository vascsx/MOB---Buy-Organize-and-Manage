/**
 * Converte centavos para reais (float)
 */
export const centsToReal = (cents: number): number => {
  return cents / 100;
};

/**
 * Converte reais (float) para centavos (int)
 */
export const realToCents = (reais: number): number => {
  return Math.round(reais * 100);
};

/**
 * Formata valor monetário para exibição
 * @param cents - Valor em centavos
 * @param options - Opções de formatação
 * @returns String formatada (ex: "R$ 1.500,00")
 */
export const formatMoney = (
  cents: number,
  options: {
    showCurrency?: boolean;
    showSign?: boolean;
  } = {}
): string => {
  const { showCurrency = true, showSign = false } = options;
  
  const reais = centsToReal(cents);
  const sign = showSign && reais > 0 ? '+' : '';
  const currency = showCurrency ? 'R$ ' : '';
  
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(reais));
  
  return `${sign}${currency}${reais < 0 ? '-' : ''}${formatted}`;
};

/**
 * Formata valor compacto para exibição (ex: "R$ 1,5k")
 */
export const formatMoneyCompact = (cents: number): string => {
  const reais = centsToReal(cents);
  
  if (reais >= 1000000) {
    return `R$ ${(reais / 1000000).toFixed(1)}M`;
  }
  if (reais >= 1000) {
    return `R$ ${(reais / 1000).toFixed(1)}k`;
  }
  return formatMoney(cents);
};

/**
 * Parseia string de dinheiro para centavos
 * @param value - String no formato "R$ 1.500,00" ou "1500.00"
 */
export const parseMoneyString = (value: string): number => {
  // Remove tudo exceto números, vírgula e ponto
  const cleaned = value.replace(/[^\d,.-]/g, '');
  
  // Substitui vírgula por ponto (formato BR → US)
  const normalized = cleaned.replace(',', '.');
  
  const reais = parseFloat(normalized) || 0;
  return realToCents(reais);
};

/**
 * Calcula porcentagem de um valor
 */
export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return (part / total) * 100;
};

/**
 * Formata porcentagem
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};
