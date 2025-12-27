import apiClient, { unwrapResponse } from './client';
import { Income, IncomeSummary, IncomeBreakdown } from '../types/finance.types';
import { APIResponse } from '../types/api.types';

export const incomesAPI = {
  /**
   * Cria nova renda
   */
  create: async (familyId: number, data: {
    family_member_id: number;
    type: 'CLT' | 'PJ';
    gross_monthly: number;
    benefits_monthly?: number;
    has_dependents?: boolean;
    num_dependents?: number;
    simples_rate?: number;
  }): Promise<Income> => {
    const response = await apiClient.post<APIResponse<Income>>(
      `/families/${familyId}/incomes`,
      data
    );
    return unwrapResponse(response);
  },

  /**
   * Lista rendas da família
   */
  getAll: async (familyId: number): Promise<Income[]> => {
    const response = await apiClient.get<APIResponse<Income[]>>(`/families/${familyId}/incomes`);
    return unwrapResponse(response);
  },

  /**
   * Detalhes da renda
   */
  getById: async (familyId: number, incomeId: number): Promise<Income> => {
    const response = await apiClient.get<APIResponse<Income>>(
      `/families/${familyId}/incomes/${incomeId}`
    );
    return unwrapResponse(response);
  },

  /**
   * Resumo de rendas
   */
  getSummary: async (familyId: number): Promise<IncomeSummary> => {
    const response = await apiClient.get<APIResponse<IncomeSummary>>(
      `/families/${familyId}/incomes/summary`
    );
    return unwrapResponse(response);
  },

  /**
   * Detalhamento de impostos
   */
  getBreakdown: async (familyId: number, incomeId: number): Promise<IncomeBreakdown> => {
    const response = await apiClient.get<APIResponse<IncomeBreakdown>>(
      `/families/${familyId}/incomes/${incomeId}/breakdown`
    );
    return unwrapResponse(response);
  },

  /**
   * Atualiza renda
   */
  update: async (familyId: number, incomeId: number, data: Partial<Income>): Promise<Income> => {
    const response = await apiClient.put<APIResponse<Income>>(
      `/families/${familyId}/incomes/${incomeId}`,
      data
    );
    return unwrapResponse(response);
  },

  /**
   * Remove renda
   */
  delete: async (familyId: number, incomeId: number): Promise<void> => {
    await apiClient.delete(`/families/${familyId}/incomes/${incomeId}`);
  },
};
