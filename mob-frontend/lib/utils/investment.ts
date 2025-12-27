/**
 * Investment utility functions
 */

import type { InvestmentType } from '../types/api.types';

/**
 * Retorna o nome amigável do tipo de investimento
 */
export function getInvestmentTypeName(type: InvestmentType): string {
  const typeNames: Record<InvestmentType, string> = {
    renda_fixa: 'Renda Fixa',
    renda_variavel: 'Renda Variável',
    fundos: 'Fundos',
    crypto: 'Criptomoedas',
    imoveis: 'Imóveis',
  };
  
  return typeNames[type] || type;
}

/**
 * Retorna o ícone do tipo de investimento
 */
export function getInvestmentTypeIcon(type: InvestmentType): string {
  const typeIcons: Record<InvestmentType, string> = {
    renda_fixa: '🏛️',
    renda_variavel: '📈',
    fundos: '💼',
    crypto: '₿',
    imoveis: '🏠',
  };
  
  return typeIcons[type] || '📊';
}

/**
 * Retorna a cor do tipo de investimento
 */
export function getInvestmentTypeColor(type: InvestmentType): string {
  const typeColors: Record<InvestmentType, string> = {
    renda_fixa: '#10B981',
    renda_variavel: '#3B82F6',
    fundos: '#8B5CF6',
    crypto: '#F59E0B',
    imoveis: '#EF4444',
  };
  
  return typeColors[type] || '#6B7280';
}
