/**
 * useEmergencyFund Hook
 * Gerencia reserva de emergência
 */

import { useState, useCallback } from 'react';
import { emergencyFundApi } from '../lib/api/emergency-fund.api';
import { getErrorMessage } from '../lib/api/client';
import type {
  EmergencyFund,
  EmergencyFundProgress,
  EmergencyFundSuggestion,
  CreateEmergencyFundRequest,
  InvestmentProjection,
} from '../lib/types/api.types';

interface UseEmergencyFundReturn {
  fund: EmergencyFund | null;
  progress: EmergencyFundProgress | null;
  suggestion: EmergencyFundSuggestion | null;
  projection: InvestmentProjection | null;
  isLoading: boolean;
  error: string | null;
  fetchFund: (familyId: number) => Promise<void>;
  fetchProgress: (familyId: number) => Promise<void>;
  fetchSuggestion: (familyId: number) => Promise<void>;
  fetchProjection: (familyId: number, months?: number) => Promise<void>;
  createOrUpdate: (familyId: number, data: CreateEmergencyFundRequest) => Promise<EmergencyFund>;
  clearError: () => void;
}

export const useEmergencyFund = (): UseEmergencyFundReturn => {
  const [fund, setFund] = useState<EmergencyFund | null>(null);
  const [progress, setProgress] = useState<EmergencyFundProgress | null>(null);
  const [suggestion, setSuggestion] = useState<EmergencyFundSuggestion | null>(null);
  const [projection, setProjection] = useState<InvestmentProjection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFund = useCallback(async (familyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await emergencyFundApi.getEmergencyFund(familyId);
      setFund(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProgress = useCallback(async (familyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await emergencyFundApi.getProgress(familyId);
      setProgress(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSuggestion = useCallback(async (familyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await emergencyFundApi.getSuggestion(familyId);
      setSuggestion(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProjection = useCallback(async (familyId: number, months: number = 60) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await emergencyFundApi.getProjection(familyId, months);
      setProjection(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createOrUpdate = useCallback(
    async (familyId: number, data: CreateEmergencyFundRequest): Promise<EmergencyFund> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await emergencyFundApi.createOrUpdate(familyId, data);
        setFund(result);
        return result;
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = () => setError(null);

  return {
    fund,
    progress,
    suggestion,
    projection,
    isLoading,
    error,
    fetchFund,
    fetchProgress,
    fetchSuggestion,
    fetchProjection,
    createOrUpdate,
    clearError,
  };
};
