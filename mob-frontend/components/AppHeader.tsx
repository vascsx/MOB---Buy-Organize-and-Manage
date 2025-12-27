import { Bell, ChevronDown, Menu } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';

interface HeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: HeaderProps) {
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
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <span className="font-medium">Dezembro 2025</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
        </button>
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-[#3B82F6] text-white">U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
