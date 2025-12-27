/**
 * Emergency Fund API Endpoints
 */

import { apiClient } from './client';
import type {
  EmergencyFund,
  EmergencyFundProgress,
  EmergencyFundSuggestion,
  CreateEmergencyFundRequest,
  InvestmentProjection,
} from '../types/api.types';

export const emergencyFundApi = {
  /**
   * Criar ou atualizar reserva de emergência
   */
  createOrUpdate: async (
    familyId: number,
    data: CreateEmergencyFundRequest
  ): Promise<EmergencyFund> => {
    const response = await apiClient.post<EmergencyFund>(
      `/families/${familyId}/emergency-fund`,
      data
    );
    return response.data;
  },

  /**
   * Buscar reserva de emergência
   */
  getEmergencyFund: async (familyId: number): Promise<EmergencyFund> => {
    const response = await apiClient.get<EmergencyFund>(`/families/${familyId}/emergency-fund`);
    return response.data;
  },

  /**
   * Buscar progresso da reserva
   */
  getProgress: async (familyId: number): Promise<EmergencyFundProgress> => {
    const response = await apiClient.get<EmergencyFundProgress>(
      `/families/${familyId}/emergency-fund/progress`
    );
    return response.data;
  },

  /**
   * Buscar sugestão de aporte mensal
   */
  getSuggestion: async (familyId: number): Promise<EmergencyFundSuggestion> => {
    const response = await apiClient.get<EmergencyFundSuggestion>(
      `/families/${familyId}/emergency-fund/suggest`
    );
    return response.data;
  },

  /**
   * Buscar projeção da reserva
   */
  getProjection: async (familyId: number, months: number = 60): Promise<InvestmentProjection> => {
    const response = await apiClient.get<InvestmentProjection>(
      `/families/${familyId}/emergency-fund/projection`,
      { params: { months } }
    );
    return response.data;
  },

  /**
   * Atualizar valor atual da reserva
   */
  updateCurrentAmount: async (familyId: number, amountCents: number): Promise<void> => {
    await apiClient.put(`/families/${familyId}/emergency-fund/current-amount`, {
      current_amount_cents: amountCents,
    });
  },
};
