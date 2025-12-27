import React from 'react';
import { LayoutDashboard, TrendingUp, TrendingDown, PiggyBank, Settings } from 'lucide-react';

interface MobileNavProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export function MobileNav({ activeItem, onItemClick }: MobileNavProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rendas', label: 'Rendas', icon: TrendingUp },
    { id: 'despesas', label: 'Despesas', icon: TrendingDown },
    { id: 'reserva', label: 'Reserva', icon: PiggyBank },
    { id: 'configuracoes', label: 'Config', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 h-14">
      <div className="flex items-center justify-around h-full px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 ${
                isActive
                  ? 'text-[#3B82F6]'
                  : 'text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
