import apiClient, { unwrapResponse } from './client';
import { FamilyAccount, FamilyMember } from '../types/finance.types';
import { APIResponse } from '../types/api.types';

export const familiesAPI = {
  /**
   * Cria nova família
   */
  create: async (data: { name: string }): Promise<FamilyAccount> => {
    const response = await apiClient.post<APIResponse<FamilyAccount>>('/families', data);
    return unwrapResponse(response);
  },

  /**
   * Lista famílias do usuário
   */
  getAll: async (): Promise<FamilyAccount[]> => {
    const response = await apiClient.get<APIResponse<FamilyAccount[]>>('/families');
    return unwrapResponse(response);
  },

  /**
   * Detalhes da família
   */
  getById: async (familyId: number): Promise<FamilyAccount> => {
    const response = await apiClient.get<APIResponse<FamilyAccount>>(`/families/${familyId}`);
    return unwrapResponse(response);
  },

  /**
   * Atualiza família
   */
  update: async (familyId: number, data: { name: string }): Promise<FamilyAccount> => {
    const response = await apiClient.put<APIResponse<FamilyAccount>>(`/families/${familyId}`, data);
    return unwrapResponse(response);
  },

  /**
   * Remove família
   */
  delete: async (familyId: number): Promise<void> => {
    await apiClient.delete(`/families/${familyId}`);
  },

  /**
   * Lista membros da família
   */
  getMembers: async (familyId: number): Promise<FamilyMember[]> => {
    const response = await apiClient.get<APIResponse<FamilyMember[]>>(`/families/${familyId}/members`);
    return unwrapResponse(response);
  },

  /**
   * Adiciona membro
   */
  addMember: async (familyId: number, data: {
    name: string;
    role: string;
    birth_date?: string;
    user_id?: number;
  }): Promise<FamilyMember> => {
    const response = await apiClient.post<APIResponse<FamilyMember>>(
      `/families/${familyId}/members`,
      data
    );
    return unwrapResponse(response);
  },

  /**
   * Atualiza membro
   */
  updateMember: async (familyId: number, memberId: number, data: {
    name?: string;
    role?: string;
    birth_date?: string;
    is_active?: boolean;
  }): Promise<FamilyMember> => {
    const response = await apiClient.put<APIResponse<FamilyMember>>(
      `/families/${familyId}/members/${memberId}`,
      data
    );
    return unwrapResponse(response);
  },

  /**
   * Remove membro
   */
  removeMember: async (familyId: number, memberId: number): Promise<void> => {
    await apiClient.delete(`/families/${familyId}/members/${memberId}`);
  },
};
