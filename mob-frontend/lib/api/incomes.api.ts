/**
 * Incomes API Endpoints
 */

import { apiClient } from './client';
import type {
  Income,
  IncomeSummary,
  IncomeBreakdown,
  CreateIncomeRequest,
} from '../types/api.types';

export const incomesApi = {
  /**
   * Criar nova renda
   */
  createIncome: async (familyId: number, data: CreateIncomeRequest): Promise<Income> => {
    const response = await apiClient.post<Income>(`/families/${familyId}/incomes`, data);
    return response.data;
  },

  /**
   * Buscar rendas da família
   */
  getFamilyIncomes: async (familyId: number): Promise<Income[]> => {
    const response = await apiClient.get<Income[]>(`/families/${familyId}/incomes`);
    return response.data;
  },

  /**
   * Buscar resumo de rendas
   * @param familyId - ID da família
   * @param month - Mês no formato YYYY-MM (ex: 2024-03). Opcional.
   */
  getIncomeSummary: async (familyId: number, month?: string): Promise<IncomeSummary> => {
    const params = month ? { month } : {};
    const response = await apiClient.get<IncomeSummary>(
      `/families/${familyId}/incomes/summary`,
      { params }
    );
    return response.data;
  },

  /**
   * Buscar renda específica
   */
  getIncome: async (familyId: number, incomeId: number): Promise<Income> => {
    const response = await apiClient.get<Income>(`/families/${familyId}/incomes/${incomeId}`);
    return response.data;
  },

  /**
   * Buscar breakdown detalhado da renda (com impostos calculados)
   */
  getIncomeBreakdown: async (familyId: number, incomeId: number): Promise<IncomeBreakdown> => {
    const response = await apiClient.get<IncomeBreakdown>(
      `/families/${familyId}/incomes/${incomeId}/breakdown`
    );
    return response.data;
  },

  /**
   * Atualizar renda
   */
  updateIncome: async (
    familyId: number,
    incomeId: number,
    data: Partial<CreateIncomeRequest>
  ): Promise<Income> => {
    const response = await apiClient.put<Income>(
      `/families/${familyId}/incomes/${incomeId}`,
      data
    );
    return response.data;
  },

  /**
   * Deletar renda
   */
  deleteIncome: async (familyId: number, incomeId: number): Promise<void> => {
    await apiClient.delete(`/families/${familyId}/incomes/${incomeId}`);
  },
};
