import React from 'react';
import { Bell, ChevronDown, Menu, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuth } from '../hooks/useAuth';
import { useMonth } from '../contexts/MonthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface HeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { selectedMonth, setSelectedMonth } = useMonth();

  // Gerar últimos 12 meses
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthName = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    return {
      value: `${year}-${month}`,
      label: monthName.charAt(0).toUpperCase() + monthName.slice(1),
    };
  });

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:px-6 sticky top-0 z-10">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg mr-3"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Logo - mobile only */}
      <h1 className="lg:hidden text-xl font-bold text-[#3B82F6]">MOB Finance</h1>

      {/* Month selector */}
      <div className="flex-1 flex justify-center">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 transition-colors">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-[#3B82F6] text-white">
                  {getUserInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
