/**
 * useFamilies Hook
 * Gerencia famílias e membros
 */

import { useState, useEffect, useCallback } from 'react';
import { familiesApi } from '../lib/api/families.api';
import { getErrorMessage } from '../lib/api/client';
import { useToast } from './useToast';
import type {
  FamilyAccount,
  FamilyMember,
  CreateFamilyRequest,
  CreateMemberInput,
} from '../lib/types/api.types';

interface UseFamiliesReturn {
  families: FamilyAccount[];
  currentFamily: FamilyAccount | null;
  members: FamilyMember[];
  isLoading: boolean;
  error: string | null;
  fetchMyFamilies: () => Promise<void>;
  selectFamily: (familyId: number) => Promise<void>;
  createFamily: (data: CreateFamilyRequest) => Promise<FamilyAccount>;
  updateFamily: (familyId: number, data: Partial<FamilyAccount>) => Promise<void>;
  deleteFamily: (familyId: number) => Promise<void>;
  fetchMembers: (familyId: number) => Promise<void>;
  addMember: (familyId: number, data: CreateMemberInput) => Promise<void>;
  updateMember: (familyId: number, memberId: number, data: Partial<FamilyMember>) => Promise<void>;
  removeMember: (familyId: number, memberId: number) => Promise<void>;
  clearError: () => void;
}

export const useFamilies = (): UseFamiliesReturn => {
  const [families, setFamilies] = useState<FamilyAccount[]>([]);
  const [currentFamily, setCurrentFamily] = useState<FamilyAccount | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar minhas famílias
  const fetchMyFamilies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await familiesApi.getMyFamilies();
      
      // Garantir que data seja um array
      const familiesArray = Array.isArray(data) ? data : [];
      setFamilies(familiesArray);

      // Auto-selecionar primeira família se existir
      if (familiesArray.length > 0 && !currentFamily) {
        const firstFamily = await familiesApi.getFamily(familiesArray[0].id);
        setCurrentFamily(firstFamily);
        localStorage.setItem('current_family_id', String(familiesArray[0].id));
      } else if (familiesArray.length === 0) {
        // Se não houver famílias, limpar família atual
        setCurrentFamily(null);
        localStorage.removeItem('current_family_id');
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar famílias', { description: message });
      // Em caso de erro, garantir que families seja um array vazio
      setFamilies([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentFamily]);

  // Selecionar família
  const selectFamily = useCallback(async (familyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const family = await familiesApi.getFamily(familyId);
      setCurrentFamily(family);
      localStorage.setItem('current_family_id', String(familyId));
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao selecionar família', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar família
  const createFamily = useCallback(async (data: CreateFamilyRequest): Promise<FamilyAccount> => {
    try {
      setIsLoading(true);
      setError(null);
      const newFamily = await familiesApi.createFamily(data);
      setFamilies((prev) => [...prev, newFamily]);
      setCurrentFamily(newFamily);
      localStorage.setItem('current_family_id', String(newFamily.id));
      return newFamily;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao criar família', { description: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualizar família
  const updateFamily = useCallback(async (familyId: number, data: Partial<FamilyAccount>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updated = await familiesApi.updateFamily(familyId, data);
      setFamilies((prev) => prev.map((f) => (f.id === familyId ? updated : f)));
      if (currentFamily?.id === familyId) {
        setCurrentFamily(updated);
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao atualizar família', { description: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentFamily]);

  // Deletar família
  const deleteFamily = useCallback(async (familyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await familiesApi.deleteFamily(familyId);
      setFamilies((prev) => prev.filter((f) => f.id !== familyId));
      if (currentFamily?.id === familyId) {
        setCurrentFamily(null);
        localStorage.removeItem('current_family_id');
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao excluir família', { description: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentFamily]);

  // Buscar membros
  const fetchMembers = useCallback(async (familyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await familiesApi.getMembers(familyId);
      setMembers(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar membros', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Adicionar membro
  const addMember = useCallback(async (familyId: number, data: CreateMemberInput) => {
    try {
      setIsLoading(true);
      setError(null);
      const newMember = await familiesApi.addMember(familyId, data);
      setMembers((prev) => [...prev, newMember]);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao adicionar membro', { description: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualizar membro
  const updateMember = useCallback(
    async (familyId: number, memberId: number, data: Partial<FamilyMember>) => {
      try {
        setIsLoading(true);
        setError(null);
        const updated = await familiesApi.updateMember(familyId, memberId, data);
        setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error('Erro ao atualizar membro', { description: message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Remover membro
  const removeMember = useCallback(async (familyId: number, memberId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await familiesApi.removeMember(familyId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao remover membro', { description: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  // Carregar família atual do localStorage ao montar
  useEffect(() => {
    const savedFamilyId = localStorage.getItem('current_family_id');
    if (savedFamilyId && !currentFamily) {
      selectFamily(Number(savedFamilyId));
    }
  }, [currentFamily, selectFamily]);

  return {
    families,
    currentFamily,
    members,
    isLoading,
    error,
    fetchMyFamilies,
    selectFamily,
    createFamily,
    updateFamily,
    deleteFamily,
    fetchMembers,
    addMember,
    updateMember,
    removeMember,
    clearError,
  };
};
