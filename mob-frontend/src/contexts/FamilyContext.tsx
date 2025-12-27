import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { FamilyAccount } from '../types/finance.types';
import { familiesAPI } from '../api/families.api';
import { useAuth } from './AuthContext';

interface FamilyContextType {
  selectedFamily: FamilyAccount | null;
  families: FamilyAccount[];
  isLoading: boolean;
  selectFamily: (family: FamilyAccount) => void;
  loadFamilies: () => Promise<void>;
  createFamily: (name: string) => Promise<FamilyAccount>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);
  const [families, setFamilies] = useState<FamilyAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  // Carrega famílias apenas quando autenticado
  useEffect(() => {
    // Aguarda verificação de autenticação
    if (authLoading) return;
    
    // Se não está autenticado, reseta tudo
    if (!isAuthenticated) {
      setFamilies([]);
      setSelectedFamilyId(null);
      hasLoadedRef.current = false;
      return;
    }

    // Se já carregou, não carrega novamente
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const data = await familiesAPI.getAll();
        setFamilies(data);
        
        // Tenta recuperar ID do localStorage ou usa a primeira família
        const savedId = localStorage.getItem('selectedFamilyId');
        if (savedId && data.find(f => f.id === Number(savedId))) {
          setSelectedFamilyId(Number(savedId));
        } else if (data.length > 0) {
          setSelectedFamilyId(data[0].id);
          localStorage.setItem('selectedFamilyId', data[0].id.toString());
        }
      } catch (error) {
        console.error('Erro ao carregar famílias:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [isAuthenticated, authLoading]);

  const loadFamilies = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await familiesAPI.getAll();
      setFamilies(data);
    } catch (error) {
      console.error('Erro ao carregar famílias:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectFamily = useCallback((family: FamilyAccount) => {
    setSelectedFamilyId(family.id);
    localStorage.setItem('selectedFamilyId', family.id.toString());
  }, []);

  const createFamily = useCallback(async (name: string): Promise<FamilyAccount> => {
    const newFamily = await familiesAPI.create({ name });
    setFamilies((prev) => [...prev, newFamily]);
    setSelectedFamilyId(newFamily.id);
    localStorage.setItem('selectedFamilyId', newFamily.id.toString());
    return newFamily;
  }, []);

  // Calcula selectedFamily de forma memoizada baseada no ID
  const selectedFamily = useMemo(() => {
    if (selectedFamilyId === null) return null;
    return families.find(f => f.id === selectedFamilyId) || null;
  }, [selectedFamilyId, families]);

  const contextValue = useMemo(() => ({
    selectedFamily,
    families,
    isLoading,
    selectFamily,
    loadFamilies,
    createFamily,
  }), [selectedFamily, families, isLoading, selectFamily, loadFamilies, createFamily]);

  return (
    <FamilyContext.Provider value={contextValue}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = (): FamilyContextType => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within FamilyProvider');
  }
  return context;
};
