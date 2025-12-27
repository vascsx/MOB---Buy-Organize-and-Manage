/**
 * Date Utilities
 * Formatação e manipulação de datas
 */

/**
 * Formata data para padrão brasileiro
 */
export const formatDate = (date: string | Date, format: 'short' | 'long' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return d.toLocaleDateString('pt-BR');
  }
  
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Formata data e hora
 */
export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR');
};

/**
 * Retorna nome do mês em português
 */
export const getMonthName = (monthIndex: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthIndex];
};

/**
 * Retorna nome do mês abreviado
 */
export const getMonthNameShort = (monthIndex: number): string => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months[monthIndex];
};

/**
 * Adiciona meses a uma data
 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Calcula diferença em meses entre duas datas
 */
export const monthsDiff = (date1: Date, date2: Date): number => {
  const months = (date2.getFullYear() - date1.getFullYear()) * 12;
  return months + date2.getMonth() - date1.getMonth();
};

/**
 * Retorna data estimada em formato legível
 */
export const getEstimatedDate = (months: number): string => {
  const future = addMonths(new Date(), months);
  return formatDate(future, 'long');
};

/**
 * Valida se data é válida
 */
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};
