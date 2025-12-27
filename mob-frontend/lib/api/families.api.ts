/**
 * Families API Endpoints
 */

import { apiClient } from './client';
import type {
  FamilyAccount,
  FamilyMember,
  CreateFamilyRequest,
  CreateMemberInput,
} from '../types/api.types';

export const familiesApi = {
  /**
   * Criar nova família
   */
  createFamily: async (data: CreateFamilyRequest): Promise<FamilyAccount> => {
    const response = await apiClient.post<FamilyAccount>('/families', data);
    return response.data;
  },

  /**
   * Buscar minhas famílias
   */
  getMyFamilies: async (): Promise<FamilyAccount[]> => {
    const response = await apiClient.get<FamilyAccount[]>('/families');
    return response.data;
  },

  /**
   * Buscar família específica
   */
  getFamily: async (familyId: number): Promise<FamilyAccount> => {
    const response = await apiClient.get<FamilyAccount>(`/families/${familyId}`);
    return response.data;
  },

  /**
   * Atualizar família
   */
  updateFamily: async (familyId: number, data: Partial<FamilyAccount>): Promise<FamilyAccount> => {
    const response = await apiClient.put<FamilyAccount>(`/families/${familyId}`, data);
    return response.data;
  },

  /**
   * Deletar família
   */
  deleteFamily: async (familyId: number): Promise<void> => {
    await apiClient.delete(`/families/${familyId}`);
  },

  /**
   * Buscar membros da família
   */
  getMembers: async (familyId: number): Promise<FamilyMember[]> => {
    const response = await apiClient.get<FamilyMember[]>(`/families/${familyId}/members`);
    return response.data;
  },

  /**
   * Adicionar membro
   */
  addMember: async (familyId: number, data: CreateMemberInput): Promise<FamilyMember> => {
    const response = await apiClient.post<FamilyMember>(`/families/${familyId}/members`, data);
    return response.data;
  },

  /**
   * Atualizar membro
   */
  updateMember: async (
    familyId: number,
    memberId: number,
    data: Partial<FamilyMember>
  ): Promise<FamilyMember> => {
    const response = await apiClient.put<FamilyMember>(
      `/families/${familyId}/members/${memberId}`,
      data
    );
    return response.data;
  },

  /**
   * Remover membro
   */
  removeMember: async (familyId: number, memberId: number): Promise<void> => {
    await apiClient.delete(`/families/${familyId}/members/${memberId}`);
  },
};
