/**
 * Investments API Endpoints
 */

import { apiClient } from './client';
import type {
  Investment,
  InvestmentsSummary,
  InvestmentProjection,
  CreateInvestmentRequest,
} from '../types/api.types';

export const investmentsApi = {
  /**
   * Criar novo investimento
   */
  createInvestment: async (
    familyId: number,
    data: CreateInvestmentRequest
  ): Promise<Investment> => {
    const response = await apiClient.post<Investment>(`/families/${familyId}/investments`, data);
    return response.data;
  },

  /**
   * Buscar investimentos da família
   */
  getFamilyInvestments: async (familyId: number): Promise<Investment[]> => {
    const response = await apiClient.get<Investment[]>(`/families/${familyId}/investments`);
    return response.data;
  },

  /**
   * Buscar resumo de investimentos
   * @param familyId - ID da família
   * @param month - Mês no formato YYYY-MM (ex: 2024-03). Opcional.
   */
  getInvestmentsSummary: async (familyId: number, month?: string): Promise<InvestmentsSummary> => {
    const params = month ? { month } : {};
    const response = await apiClient.get<InvestmentsSummary>(
      `/families/${familyId}/investments/summary`,
      { params }
    );
    return response.data;
  },

  /**
   * Buscar projeção de todos investimentos da família
   */
  getFamilyInvestmentsProjection: async (
    familyId: number,
    months: number = 60
  ): Promise<InvestmentProjection[]> => {
    const response = await apiClient.get<InvestmentProjection[]>(
      `/families/${familyId}/investments/projection`,
      { params: { months } }
    );
    return response.data;
  },

  /**
   * Buscar investimento específico
   */
  getInvestment: async (familyId: number, investmentId: number): Promise<Investment> => {
    const response = await apiClient.get<Investment>(
      `/families/${familyId}/investments/${investmentId}`
    );
    return response.data;
  },

  /**
   * Buscar projeção de investimento específico
   */
  getInvestmentProjection: async (
    familyId: number,
    investmentId: number,
    months: number = 60
  ): Promise<InvestmentProjection> => {
    const response = await apiClient.get<InvestmentProjection>(
      `/families/${familyId}/investments/${investmentId}/projection`,
      { params: { months } }
    );
    return response.data;
  },

  /**
   * Atualizar investimento
   */
  updateInvestment: async (
    familyId: number,
    investmentId: number,
    data: Partial<CreateInvestmentRequest>
  ): Promise<Investment> => {
    const response = await apiClient.put<Investment>(
      `/families/${familyId}/investments/${investmentId}`,
      data
    );
    return response.data;
  },

  /**
   * Deletar investimento
   */
  deleteInvestment: async (familyId: number, investmentId: number): Promise<void> => {
    await apiClient.delete(`/families/${familyId}/investments/${investmentId}`);
  },
};
