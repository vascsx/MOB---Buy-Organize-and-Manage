import apiClient, { unwrapResponse } from './client';
import { Expense, ExpenseCategory, ExpenseSummary } from '../types/finance.types';
import { APIResponse } from '../types/api.types';

export const expensesAPI = {
  /**
   * Cria nova despesa com splits
   */
  create: async (familyId: number, data: {
    category_id: number;
    description: string;
    amount: number;
    frequency: 'once' | 'monthly' | 'yearly';
    due_day?: number;
    splits: { family_member_id: number; percentage: number }[];
  }): Promise<Expense> => {
    const response = await apiClient.post<APIResponse<Expense>>(
      `/families/${familyId}/expenses`,
      data
    );
    return unwrapResponse(response);
  },

  /**
   * Lista despesas
   */
  getAll: async (familyId: number): Promise<Expense[]> => {
    const response = await apiClient.get<APIResponse<Expense[]>>(`/families/${familyId}/expenses`);
    return unwrapResponse(response);
  },

  /**
   * Detalhes da despesa
   */
  getById: async (familyId: number, expenseId: number): Promise<Expense> => {
    const response = await apiClient.get<APIResponse<Expense>>(
      `/families/${familyId}/expenses/${expenseId}`
    );
    return unwrapResponse(response);
  },

  /**
   * Despesas por categoria
   */
  getByCategory: async (familyId: number): Promise<any> => {
    const response = await apiClient.get(`/families/${familyId}/expenses/by-category`);
    return unwrapResponse(response);
  },

  /**
   * Resumo de despesas
   */
  getSummary: async (familyId: number): Promise<ExpenseSummary> => {
    const response = await apiClient.get<APIResponse<ExpenseSummary>>(
      `/families/${familyId}/expenses/summary`
    );
    return unwrapResponse(response);
  },

  /**
   * Lista categorias
   */
  getCategories: async (familyId: number): Promise<ExpenseCategory[]> => {
    const response = await apiClient.get<APIResponse<ExpenseCategory[]>>(
      `/families/${familyId}/expenses/categories`
    );
    return unwrapResponse(response);
  },

  /**
   * Atualiza despesa
   */
  update: async (familyId: number, expenseId: number, data: Partial<Expense>): Promise<Expense> => {
    const response = await apiClient.put<APIResponse<Expense>>(
      `/families/${familyId}/expenses/${expenseId}`,
      data
    );
    return unwrapResponse(response);
  },

  /**
   * Remove despesa
   */
  delete: async (familyId: number, expenseId: number): Promise<void> => {
    await apiClient.delete(`/families/${familyId}/expenses/${expenseId}`);
  },
};
