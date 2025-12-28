import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { familiesApi } from '../lib/api/families.api';
import { getErrorMessage } from '../lib/api/client';
import { useToast } from '../hooks/useToast';
import type {
  FamilyAccount,
  FamilyMember,
  CreateFamilyRequest,
  CreateMemberInput,
} from '../lib/types/api.types';

interface FamilyContextValue {
  family: FamilyAccount | null;
  members: FamilyMember[];
  isLoading: boolean;
  error: string | null;
  fetchFamily: () => Promise<void>;
  refreshFamily: () => Promise<void>;
  createFamily: (data: CreateFamilyRequest) => Promise<FamilyAccount>;
  updateFamily: (data: Partial<FamilyAccount>) => Promise<void>;
  fetchMembers: () => Promise<void>;
  addMember: (data: CreateMemberInput) => Promise<void>;
  updateMember: (memberId: number, data: Partial<FamilyMember>) => Promise<void>;
  removeMember: (memberId: number) => Promise<void>;
  clearError: () => void;
}

const FamilyContext = createContext<FamilyContextValue | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [family, setFamily] = useState<FamilyAccount | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar família única da conta
  const fetchFamily = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await familiesApi.getMyFamilies();
      
      // Garantir que data seja um array
      const familiesArray = Array.isArray(data) ? data : [];

      // Pegar primeira (e única) família
      if (familiesArray.length > 0) {
        const singleFamily = await familiesApi.getFamily(familiesArray[0].id);
        setFamily(singleFamily);
        localStorage.setItem('family_id', String(familiesArray[0].id));
      } else {
        // Se não houver família, limpar
        setFamily(null);
        localStorage.removeItem('family_id');
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar família', { description: message });
      setFamily(null);
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
      setFamily(newFamily);
      localStorage.setItem('family_id', String(newFamily.id));
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
  const updateFamily = useCallback(async (data: Partial<FamilyAccount>) => {
    if (!family) return;
    try {
      setIsLoading(true);
      setError(null);
      const updated = await familiesApi.updateFamily(family.id, data);
      setFamily(updated);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao atualizar família', { description: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [family]);

  // Buscar membros
  const fetchMembers = useCallback(async () => {
    if (!family) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await familiesApi.getMembers(family.id);
      setMembers(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao carregar membros', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, [family]);

  // Adicionar membro
  const addMember = useCallback(async (data: CreateMemberInput) => {
    if (!family) return;
    try {
      setIsLoading(true);
      setError(null);
      const newMember = await familiesApi.addMember(family.id, data);
      setMembers((prev) => [...prev, newMember]);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao adicionar membro', { description: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [family]);

  // Atualizar membro
  const updateMember = useCallback(
    async (memberId: number, data: Partial<FamilyMember>) => {
      if (!family) return;
      try {
        setIsLoading(true);
        setError(null);
        const updated = await familiesApi.updateMember(family.id, memberId, data);
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
    [family]
  );

  // Remover membro
  const removeMember = useCallback(async (memberId: number) => {
    if (!family) return;
    try {
      setIsLoading(true);
      setError(null);
      await familiesApi.removeMember(family.id, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error('Erro ao remover membro', { description: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [family]);

  const clearError = () => setError(null);

  // Alias for fetchFamily to refresh current family
  const refreshFamily = fetchFamily;

  const value: FamilyContextValue = {
    family,
    members,
    isLoading,
    error,
    fetchFamily,
    refreshFamily,
    createFamily,
    updateFamily,
    fetchMembers,
    addMember,
    updateMember,
    removeMember,
    clearError,
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
};

export const useFamilyContext = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamilyContext must be used within a FamilyProvider');
  }
  return context;
};
