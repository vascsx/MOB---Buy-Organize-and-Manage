import apiClient, { unwrapResponse } from './client';
import { EmergencyFund, EmergencyFundProgress } from '../types/finance.types';

export const emergencyFundAPI = {
  async create(familyId: number, data: Omit<EmergencyFund, 'id' | 'family_id' | 'created_at' | 'updated_at'>): Promise<EmergencyFund> {
    const response = await apiClient.post(`/families/${familyId}/emergency-fund`, data);
    return unwrapResponse<EmergencyFund>(response);
  },

  async get(familyId: number): Promise<EmergencyFund> {
    const response = await apiClient.get(`/families/${familyId}/emergency-fund`);
    return unwrapResponse<EmergencyFund>(response);
  },

  async getProgress(familyId: number): Promise<EmergencyFundProgress> {
    const response = await apiClient.get(`/families/${familyId}/emergency-fund/progress`);
    return unwrapResponse<EmergencyFundProgress>(response);
  },

  async update(familyId: number, data: Partial<EmergencyFund>): Promise<EmergencyFund> {
    const response = await apiClient.put(`/families/${familyId}/emergency-fund`, data);
    return unwrapResponse<EmergencyFund>(response);
  },

  async delete(familyId: number): Promise<void> {
    await apiClient.delete(`/families/${familyId}/emergency-fund`);
  }
};
