/**
 * Dashboard API Endpoints
 */

import { apiClient } from './client';
import type { DashboardData } from '../types/api.types';

export const dashboardApi = {
  /**
   * Buscar dados consolidados do dashboard
   */
  getDashboard: async (familyId: number): Promise<DashboardData> => {
    const response = await apiClient.get<DashboardData>(`/families/${familyId}/dashboard`);
    return response.data;
  },
};
