import apiClient, { unwrapResponse } from './client';
import { DashboardSummary, FinancialHealthDetail } from '../types/finance.types';
import { APIResponse } from '../types/api.types';

export const dashboardAPI = {
  /**
   * Dashboard consolidado
   */
  getSummary: async (familyId: number): Promise<DashboardSummary> => {
    const response = await apiClient.get<APIResponse<DashboardSummary>>(
      `/families/${familyId}/dashboard`
    );
    return unwrapResponse(response);
  },

  /**
   * Score de saúde financeira
   */
  getFinancialHealth: async (familyId: number): Promise<FinancialHealthDetail> => {
    const response = await apiClient.get<APIResponse<FinancialHealthDetail>>(
      `/families/${familyId}/financial-health`
    );
    return unwrapResponse(response);
  },
};
