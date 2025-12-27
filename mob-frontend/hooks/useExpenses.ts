/**
 * useExpenses Hook
 * Gerencia despesas da família
 */

import { useState, useCallback } from 'react';
import { expensesApi } from '../lib/api/expenses.api';
import { getErrorMessage } from '../lib/api/client';
import type {
  Expense,
  ExpenseCategory,
  ExpensesSummary,
  CategorySummary,
  CreateExpenseRequest,
  ExpenseFilters,
} from '../lib/types/api.types';

interface UseExpensesReturn {
  expenses: Expense[];
  categories: ExpenseCategory[];
  summary: ExpensesSummary | null;
  categoryBreakdown: CategorySummary[];
  selectedExpense: Expense | null;
  isLoading: boolean;
  error: string | null;
  fetchCategories: (familyId: number) => Promise<void>;
  fetchExpenses: (familyId: number, filters?: ExpenseFilters) => Promise<void>;
  fetchSummary: (familyId: number) => Promise<void>;
  fetchCategoryBreakdown: (familyId: number) => Promise<void>;
  fetchExpense: (familyId: number, expenseId: number) => Promise<void>;
  createExpense: (familyId: number, data: CreateExpenseRequest) => Promise<Expense>;
  updateExpense: (familyId: number, expenseId: number, data: Partial<CreateExpenseRequest>) => Promise<void>;
  deleteExpense: (familyId: number, expenseId: number) => Promise<void>;
  clearError: () => void;
}

export const useExpenses = (): UseExpensesReturn => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [summary, setSummary] = useState<ExpensesSummary | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategorySummary[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (familyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await expensesApi.getCategories(familyId);
      setCategories(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExpenses = useCallback(async (familyId: number, filters?: ExpenseFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await expensesApi.getFamilyExpenses(familyId, filters);
      setExpenses(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async (familyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await expensesApi.getExpensesSummary(familyId);
      setSummary(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategoryBreakdown = useCallback(async (familyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await expensesApi.getExpensesByCategory(familyId);
      setCategoryBreakdown(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExpense = useCallback(async (familyId: number, expenseId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await expensesApi.getExpense(familyId, expenseId);
      setSelectedExpense(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createExpense = useCallback(async (familyId: number, data: CreateExpenseRequest): Promise<Expense> => {
    try {
      setIsLoading(true);
      setError(null);
      const newExpense = await expensesApi.createExpense(familyId, data);
      setExpenses((prev) => [...prev, newExpense]);
      return newExpense;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateExpense = useCallback(
    async (familyId: number, expenseId: number, data: Partial<CreateExpenseRequest>) => {
      try {
        setIsLoading(true);
        setError(null);
        const updated = await expensesApi.updateExpense(familyId, expenseId, data);
        setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updated : e)));
        if (selectedExpense?.id === expenseId) {
          setSelectedExpense(updated);
        }
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedExpense]
  );

  const deleteExpense = useCallback(async (familyId: number, expenseId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await expensesApi.deleteExpense(familyId, expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      if (selectedExpense?.id === expenseId) {
        setSelectedExpense(null);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedExpense]);

  const clearError = () => setError(null);

  return {
    expenses,
    categories,
    summary,
    categoryBreakdown,
    selectedExpense,
    isLoading,
    error,
    fetchCategories,
    fetchExpenses,
    fetchSummary,
    fetchCategoryBreakdown,
    fetchExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    clearError,
  };
};
