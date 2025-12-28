/**
 * Dashboard API Endpoints
 */

import { apiClient } from './client';
import type { DashboardData } from '../types/api.types';

export const dashboardApi = {
  /**
   * Buscar dados consolidados do dashboard
   * @param familyId - ID da família
   * @param month - Mês no formato YYYY-MM (ex: 2024-03). Opcional.
   */
  getDashboard: async (familyId: number, month?: string): Promise<DashboardData> => {
    const params = month ? { month } : {};
    const response = await apiClient.get<DashboardData>(`/families/${familyId}/dashboard`, { params });
    return response.data;
  },
};
