import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../contexts/FamilyContext';
import { Button } from '../ui/Button';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/incomes', label: 'Receitas', icon: '💰' },
  { path: '/expenses', label: 'Despesas', icon: '💸' },
  { path: '/investments', label: 'Investimentos', icon: '📈' },
  { path: '/emergency-fund', label: 'Reserva', icon: '🆘' }
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { selectedFamily, families, selectFamily } = useFamily();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg hidden md:flex md:flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">MOB Finance</h1>
          <p className="text-sm text-gray-600 mt-1">Organize sua família</p>
        </div>

        {/* Family Selector */}
        {families.length > 0 && (
          <div className="p-4 border-b">
            <label className="text-xs text-gray-600 font-medium mb-2 block">FAMÍLIA ATUAL</label>
            <select
              value={selectedFamily?.id || ''}
              onChange={(e) => {
                const family = families.find(f => f.id === Number(e.target.value));
                if (family) selectFamily(family);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {families.map(family => (
                <option key={family.id} value={family.id}>
                  {family.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </div>
              <div className="text-xs text-gray-600 truncate">
                {user?.email}
              </div>
            </div>
          </div>
          <Button variant="secondary" fullWidth onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <nav className="flex justify-around">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 py-2 px-3 ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
};
