import React, { useState } from 'react';
import { Dashboard } from './components/screens/Dashboard';
import { IndividualProfile } from './components/screens/IndividualProfile';
import { Expenses } from './components/screens/Expenses';
import { Investments } from './components/screens/Investments';
import { EmergencyFund } from './components/screens/EmergencyFund';
import { Projections } from './components/screens/Projections';
import { Settings } from './components/screens/Settings';

export default function App() {
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto">
          {renderScreen()}
        </div>
      </main>
    </div>
  );
}
