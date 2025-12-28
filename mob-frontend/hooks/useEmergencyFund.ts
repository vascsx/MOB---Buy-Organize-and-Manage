/**
 * useEmergencyFund Hook
 * Gerencia reserva de emergência
 */

import { useState, useCallback } from 'react';
import { emergencyFundApi } from '../lib/api/emergency-fund.api';
import { getErrorMessage } from '../lib/api/client';
import { useToast } from './useToast';
import type {
  EmergencyFund,
  EmergencyFundProgress,
  EmergencyFundSuggestion,
  CreateEmergencyFundRequest,
  EmergencyFundProjection,
  EmergencyFundProjectionDetail,
} from '../lib/types/api.types';

interface UseEmergencyFundReturn {
  fund: EmergencyFund | null;
  progress: EmergencyFundProgress | null;
  suggestion: EmergencyFundSuggestion | null;
  projection: EmergencyFundProjection | null;
  isLoading: boolean;
  error: string | null;
  fetchFund: (familyId: number) => Promise<void>;
  fetchProgress: (familyId: number) => Promise<void>;
  fetchSuggestion: (familyId: number) => Promise<void>;
  fetchProjection: (familyId: number, months?: number) => Promise<void>;
  createOrUpdate: (familyId: number, data: CreateEmergencyFundRequest) => Promise<EmergencyFund>;
  updateCurrentAmount: (familyId: number, amount: number) => Promise<void>;
  clearError: () => void;
}

export const useEmergencyFund = (): UseEmergencyFundReturn => {
  const [fund, setFund] = useState<EmergencyFund | null>(null);
  const [progress, setProgress] = useState<EmergencyFundProgress | null>(null);
  const [suggestion, setSuggestion] = useState<EmergencyFundSuggestion | null>(null);
  const [projection, setProjection] = useState<EmergencyFundProjection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFund = useCallback(async (familyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await emergencyFundApi.getEmergencyFund(familyId);
      setFund(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar fundo de emergência', { description: message });
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
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar progresso', { description: message });
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
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar sugestão', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProjection = useCallback(async (familyId: number, months: number = 6) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await emergencyFundApi.getProjection(familyId, months);
      setProjection(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar projeção', { description: message });
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
        const message = getErrorMessage(err);
        setError(message);
        toast.error('Erro ao salvar fundo de emergência', { description: message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateCurrentAmount = useCallback(
    async (familyId: number, amount: number): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        await emergencyFundApi.updateCurrentAmount(familyId, amount);
        // Atualizar progresso após a mudança
        await fetchProgress(familyId);
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error('Erro ao atualizar valor', { description: message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProgress]
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
    updateCurrentAmount,
    clearError,
  };
};
