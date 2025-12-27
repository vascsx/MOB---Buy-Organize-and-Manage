import { format, parseISO, formatDistance, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata data para exibição
 */
export const formatDate = (date: string | Date, pattern: string = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern, { locale: ptBR });
};

/**
 * Formata data relativa ("há 2 dias")
 */
export const formatDateRelative = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true, locale: ptBR });
};

/**
 * Calcula diferença em meses
 */
export const monthsDifference = (start: Date, end: Date): number => {
  return differenceInMonths(end, start);
};

/**
 * Retorna nome do mês atual
 */
export const getCurrentMonthName = (): string => {
  return format(new Date(), 'MMMM yyyy', { locale: ptBR });
};

/**
 * Retorna data de hoje formatada
 */
export const getToday = (): string => {
  return formatDate(new Date());
};
