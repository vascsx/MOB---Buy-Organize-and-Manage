/**
 * useIncomes Hook
 * Gerencia rendas da família
 */

import { useState, useCallback } from 'react';
import { incomesApi } from '../lib/api/incomes.api';
import { getErrorMessage } from '../lib/api/client';
import { useToast } from './useToast';
import type {
  Income,
  IncomeSummary,
  IncomeBreakdown,
  CreateIncomeRequest,
} from '../lib/types/api.types';

interface UseIncomesReturn {
  incomes: Income[];
  summary: IncomeSummary | null;
  selectedIncome: Income | null;
  breakdown: IncomeBreakdown | null;
  isLoading: boolean;
  error: string | null;
  fetchIncomes: (familyId: number) => Promise<void>;
  fetchSummary: (familyId: number, month?: string) => Promise<void>;
  fetchIncome: (familyId: number, incomeId: number) => Promise<void>;
  fetchBreakdown: (familyId: number, incomeId: number) => Promise<void>;
  createIncome: (familyId: number, data: CreateIncomeRequest) => Promise<Income>;
  updateIncome: (familyId: number, incomeId: number, data: Partial<CreateIncomeRequest>) => Promise<void>;
  deleteIncome: (familyId: number, incomeId: number) => Promise<void>;
  clearError: () => void;
}

export const useIncomes = (): UseIncomesReturn => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [summary, setSummary] = useState<IncomeSummary | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  const [breakdown, setBreakdown] = useState<IncomeBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchIncomes = useCallback(async (familyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await incomesApi.getFamilyIncomes(familyId);
      setIncomes(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar rendas', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async (familyId: number, month?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await incomesApi.getIncomeSummary(familyId, month);
      setSummary(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar resumo', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchIncome = useCallback(async (familyId: number, incomeId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await incomesApi.getIncome(familyId, incomeId);
      setSelectedIncome(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar renda', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBreakdown = useCallback(async (familyId: number, incomeId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await incomesApi.getIncomeBreakdown(familyId, incomeId);
      setBreakdown(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar detalhamento', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createIncome = useCallback(async (familyId: number, data: CreateIncomeRequest): Promise<Income> => {
    try {
      setIsLoading(true);
      setError(null);
      const newIncome = await incomesApi.createIncome(familyId, data);
      setIncomes((prev) => [...prev, newIncome]);
      return newIncome;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao criar renda', { description: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateIncome = useCallback(
    async (familyId: number, incomeId: number, data: Partial<CreateIncomeRequest>) => {
      try {
        setIsLoading(true);
        setError(null);
        const updated = await incomesApi.updateIncome(familyId, incomeId, data);
        setIncomes((prev) => prev.map((i) => (i.id === incomeId ? updated : i)));
        if (selectedIncome?.id === incomeId) {
          setSelectedIncome(updated);
        }
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error('Erro ao atualizar renda', { description: message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedIncome]
  );

  const deleteIncome = useCallback(async (familyId: number, incomeId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await incomesApi.deleteIncome(familyId, incomeId);
      setIncomes((prev) => prev.filter((i) => i.id !== incomeId));
      if (selectedIncome?.id === incomeId) {
        setSelectedIncome(null);
        setBreakdown(null);
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao excluir renda', { description: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedIncome]);

  const clearError = () => setError(null);

  return {
    incomes,
    summary,
    selectedIncome,
    breakdown,
    isLoading,
    error,
    fetchIncomes,
    fetchSummary,
    fetchIncome,
    fetchBreakdown,
    createIncome,
    updateIncome,
    deleteIncome,
    clearError,
  };
};
