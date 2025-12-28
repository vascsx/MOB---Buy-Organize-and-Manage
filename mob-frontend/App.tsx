import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/screens/Dashboard';
import { IndividualProfile } from './components/screens/IndividualProfile';
import { Expenses } from './components/screens/Expenses';
import { Investments } from './components/screens/Investments';
import { EmergencyFund } from './components/screens/EmergencyFund';
import { Projections } from './components/screens/Projections';
import { Settings } from './components/screens/Settings';
import { FamilyOnboarding } from './components/screens/FamilyOnboarding';
import { AppHeader } from './components/AppHeader';
import { AppSidebar } from './components/AppSidebar';
import { MobileNav } from './components/MobileNav';
import { useFamilyContext } from './contexts/FamilyContext';
import { MonthProvider } from './contexts/MonthContext';
import { Skeleton } from './components/ui/skeleton';

export default function App() {
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { family, fetchFamily, createFamily, isLoading } = useFamilyContext();
  const [hasCheckedFamily, setHasCheckedFamily] = useState(false);

  // Carregar família ao montar o componente
  useEffect(() => {
    const loadFamily = async () => {
      await fetchFamily();
      setHasCheckedFamily(true);
    };
    loadFamily();
  }, []);

  const handleCreateFamily = async (name: string) => {
    await createFamily({ name });
  };

  // Mostrar loading enquanto carrega
  if (!hasCheckedFamily) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-20 w-20 rounded-2xl mx-auto" />
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  // Se não houver família, mostrar onboarding
  if (!family) {
    return <FamilyOnboarding onCreateFamily={handleCreateFamily} isLoading={isLoading} />;
  }

  const renderScreen = () => {
    switch (activeMenuItem) {
      case 'dashboard':
        return <Dashboard />;
      case 'rendas':
        return <IndividualProfile onBack={() => setActiveMenuItem('dashboard')} />;
      case 'despesas':
        return <Expenses />;
      case 'investimentos':
        return <Investments />;
      case 'reserva':
        return <EmergencyFund />;
      case 'projecoes':
        return <Projections />;
      case 'configuracoes':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MonthProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <AppSidebar 
          activeItem={activeMenuItem} 
          onItemClick={setActiveMenuItem} 
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <AppHeader onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

          {/* Content */}
          <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
            <div className="max-w-7xl mx-auto">
              {renderScreen()}
            </div>
          </main>

          {/* Mobile Navigation */}
          <MobileNav 
            activeItem={activeMenuItem} 
            onItemClick={setActiveMenuItem} 
          />
        </div>
      </div>
    </MonthProvider>
  );
}
