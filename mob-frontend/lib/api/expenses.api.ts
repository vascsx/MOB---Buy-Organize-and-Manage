/**
 * Expenses API Endpoints
 */

import { apiClient } from './client';
import type {
  Expense,
  ExpenseCategory,
  ExpensesSummary,
  CategorySummary,
  CreateExpenseRequest,
  ExpenseFilters,
} from '../types/api.types';

export const expensesApi = {
  /**
   * Buscar categorias de despesas
   */
  getCategories: async (familyId: number): Promise<ExpenseCategory[]> => {
    const response = await apiClient.get<ExpenseCategory[]>(`/families/${familyId}/categories`);
    return response.data;
  },

  /**
   * Criar nova despesa
   */
  createExpense: async (familyId: number, data: CreateExpenseRequest): Promise<Expense> => {
    const response = await apiClient.post<Expense>(`/families/${familyId}/expenses`, data);
    return response.data;
  },

  /**
   * Buscar despesas da família
   */
  getFamilyExpenses: async (familyId: number, filters?: ExpenseFilters): Promise<Expense[]> => {
    const response = await apiClient.get<Expense[]>(`/families/${familyId}/expenses`, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Buscar resumo de despesas
   * @param familyId - ID da família
   * @param month - Mês no formato YYYY-MM (ex: 2024-03). Opcional.
   */
  getExpensesSummary: async (familyId: number, month?: string): Promise<ExpensesSummary> => {
    const params = month ? { month } : {};
    const response = await apiClient.get<ExpensesSummary>(
      `/families/${familyId}/expenses/summary`,
      { params }
    );
    return response.data;
  },

  /**
   * Buscar despesas por categoria
   */
  getExpensesByCategory: async (familyId: number): Promise<CategorySummary[]> => {
    const response = await apiClient.get<{ categories: CategorySummary[]; total_amount: number }>(
      `/families/${familyId}/expenses/by-category`
    );
    const { categories, total_amount } = response.data;
    // Calcular percentagem para cada categoria
    return categories.map(cat => ({
      ...cat,
      percentage: total_amount > 0 ? (cat.total / total_amount) * 100 : 0,
    }));
  },

  /**
   * Buscar despesa específica
   */
  getExpense: async (familyId: number, expenseId: number): Promise<Expense> => {
    const response = await apiClient.get<Expense>(`/families/${familyId}/expenses/${expenseId}`);
    return response.data;
  },

  /**
   * Atualizar despesa
   */
  updateExpense: async (
    familyId: number,
    expenseId: number,
    data: Partial<CreateExpenseRequest>
  ): Promise<Expense> => {
    const response = await apiClient.put<Expense>(
      `/families/${familyId}/expenses/${expenseId}`,
      data
    );
    return response.data;
  },

  /**
   * Deletar despesa
   */
  deleteExpense: async (familyId: number, expenseId: number): Promise<void> => {
    await apiClient.delete(`/families/${familyId}/expenses/${expenseId}`);
  },
};
