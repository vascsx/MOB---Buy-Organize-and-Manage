/**
 * useDashboard Hook
 * Gerencia dados consolidados do dashboard
 */

import { useState, useCallback } from 'react';
import { dashboardApi } from '../lib/api/dashboard.api';
import { getErrorMessage } from '../lib/api/client';
import type { DashboardData } from '../lib/types/api.types';

interface UseDashboardReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboard: (familyId: number) => Promise<void>;
  refreshDashboard: (familyId: number) => Promise<void>;
  clearError: () => void;
}

export const useDashboard = (): UseDashboardReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (familyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const dashboardData = await dashboardApi.getDashboard(familyId);
      setData(dashboardData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshDashboard = useCallback(async (familyId: number) => {
    // Similar ao fetchDashboard mas pode ter lógica adicional
    // como invalidar cache, mostrar loading diferente, etc
    await fetchDashboard(familyId);
  }, [fetchDashboard]);

  const clearError = () => setError(null);

  return {
    data,
    isLoading,
    error,
    fetchDashboard,
    refreshDashboard,
    clearError,
  };
};
