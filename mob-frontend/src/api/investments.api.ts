import apiClient, { unwrapResponse } from './client';
import { Investment, InvestmentProjection } from '../types/finance.types';

export const investmentsAPI = {
  async create(familyId: number, data: Omit<Investment, 'id' | 'family_id' | 'created_at' | 'updated_at'>): Promise<Investment> {
    const response = await apiClient.post(`/families/${familyId}/investments`, data);
    return unwrapResponse<Investment>(response);
  },

  async getAll(familyId: number): Promise<Investment[]> {
    const response = await apiClient.get(`/families/${familyId}/investments`);
    return unwrapResponse<Investment[]>(response);
  },

  async getById(familyId: number, investmentId: number): Promise<Investment> {
    const response = await apiClient.get(`/families/${familyId}/investments/${investmentId}`);
    return unwrapResponse<Investment>(response);
  },

  async getProjection(familyId: number, months: number): Promise<InvestmentProjection> {
    const response = await apiClient.get(`/families/${familyId}/investments/projection?months=${months}`);
    return unwrapResponse<InvestmentProjection>(response);
  },

  async update(familyId: number, investmentId: number, data: Partial<Investment>): Promise<Investment> {
    const response = await apiClient.put(`/families/${familyId}/investments/${investmentId}`, data);
    return unwrapResponse<Investment>(response);
  },

  async delete(familyId: number, investmentId: number): Promise<void> {
    await apiClient.delete(`/families/${familyId}/investments/${investmentId}`);
  }
};
