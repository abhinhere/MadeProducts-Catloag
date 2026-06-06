'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import { Menu, LogOut, User, ChevronDown, Package2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface TopbarProps {
  user: { name: string; email: string; role: string };
  onMenuClick: () => void;
  companyName?: string;
}

export function Topbar({ user, onMenuClick, companyName = 'Made Products' }: TopbarProps) {
  const [showMenu, setShowMenu] = useState(false);

  async function handleLogout() {
    await logout();
    toast.success('Signed out successfully');
  }

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 lg:hidden">
        <Package2 className="w-5 h-5 text-amber-700" />
        <span className="font-display text-sm font-medium text-amber-900">{companyName}</span>
      </div>

      <div className="flex-1" />

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-amber-800">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-gray-800">{user.name}</p>
            <p className="text-[10px] text-gray-400">{user.role}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
