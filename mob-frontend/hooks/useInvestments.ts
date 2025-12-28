/**
 * useInvestments Hook
 * Gerencia investimentos da família
 */

import { useState, useCallback } from 'react';
import { investmentsApi } from '../lib/api/investments.api';
import { getErrorMessage } from '../lib/api/client';
import { useToast } from './useToast';
import type {
  Investment,
  InvestmentsSummary,
  InvestmentProjection,
  CreateInvestmentRequest,
} from '../lib/types/api.types';

interface UseInvestmentsReturn {
  investments: Investment[];
  summary: InvestmentsSummary | null;
  projections: InvestmentProjection[];
  selectedInvestment: Investment | null;
  selectedProjection: InvestmentProjection | null;
  isLoading: boolean;
  error: string | null;
  fetchInvestments: (familyId: number) => Promise<void>;
  fetchSummary: (familyId: number, month?: string) => Promise<void>;
  fetchProjections: (familyId: number, months?: number) => Promise<void>;
  fetchInvestment: (familyId: number, investmentId: number) => Promise<void>;
  fetchInvestmentProjection: (familyId: number, investmentId: number, months?: number) => Promise<void>;
  createInvestment: (familyId: number, data: CreateInvestmentRequest) => Promise<Investment>;
  updateInvestment: (familyId: number, investmentId: number, data: Partial<CreateInvestmentRequest>) => Promise<void>;
  deleteInvestment: (familyId: number, investmentId: number) => Promise<void>;
  clearError: () => void;
}

export const useInvestments = (): UseInvestmentsReturn => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<InvestmentsSummary | null>(null);
  const [projections, setProjections] = useState<InvestmentProjection[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [selectedProjection, setSelectedProjection] = useState<InvestmentProjection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInvestments = useCallback(async (familyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await investmentsApi.getFamilyInvestments(familyId);
      setInvestments(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar investimentos', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async (familyId: number, month?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await investmentsApi.getInvestmentsSummary(familyId, month);
      setSummary(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar resumo', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProjections = useCallback(async (familyId: number, months: number = 60) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await investmentsApi.getFamilyInvestmentsProjection(familyId, months);
      setProjections(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar projeções', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchInvestment = useCallback(async (familyId: number, investmentId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await investmentsApi.getInvestment(familyId, investmentId);
      setSelectedInvestment(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar investimento', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchInvestmentProjection = useCallback(
    async (familyId: number, investmentId: number, months: number = 60) => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await investmentsApi.getInvestmentProjection(familyId, investmentId, months);
        setSelectedProjection(data);
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error('Erro ao carregar projeção do investimento', { description: message });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const createInvestment = useCallback(
    async (familyId: number, data: CreateInvestmentRequest): Promise<Investment> => {
      try {
        setIsLoading(true);
        setError(null);
        const newInvestment = await investmentsApi.createInvestment(familyId, data);
        setInvestments((prev) => [...prev, newInvestment]);
        return newInvestment;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error('Erro ao criar investimento', { description: message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateInvestment = useCallback(
    async (familyId: number, investmentId: number, data: Partial<CreateInvestmentRequest>) => {
      try {
        setIsLoading(true);
        setError(null);
        const updated = await investmentsApi.updateInvestment(familyId, investmentId, data);
        setInvestments((prev) => prev.map((inv) => (inv.id === investmentId ? updated : inv)));
        if (selectedInvestment?.id === investmentId) {
          setSelectedInvestment(updated);
        }
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error('Erro ao atualizar investimento', { description: message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedInvestment]
  );

  const deleteInvestment = useCallback(
    async (familyId: number, investmentId: number) => {
      try {
        setIsLoading(true);
        setError(null);
        await investmentsApi.deleteInvestment(familyId, investmentId);
        setInvestments((prev) => prev.filter((inv) => inv.id !== investmentId));
        if (selectedInvestment?.id === investmentId) {
          setSelectedInvestment(null);
          setSelectedProjection(null);
        }
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error('Erro ao excluir investimento', { description: message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedInvestment]
  );

  const clearError = () => setError(null);

  return {
    investments,
    summary,
    projections,
    selectedInvestment,
    selectedProjection,
    isLoading,
    error,
    fetchInvestments,
    fetchSummary,
    fetchProjections,
    fetchInvestment,
    fetchInvestmentProjection,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    clearError,
  };
};
