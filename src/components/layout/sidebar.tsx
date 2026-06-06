'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Package, Tag, Users, Settings,
  Package2, ChevronRight, X, TrendingUp
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/categories', label: 'Categories', icon: Tag, adminOnly: true },
  { href: '/dashboard/employees', label: 'Employees', icon: Users, adminOnly: true },
  { href: '/dashboard/price-history', label: 'Price History', icon: TrendingUp, adminOnly: true },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, adminOnly: true },
];

interface SidebarProps {
  role: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === 'ADMIN';

  const items = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-white border-r border-amber-100 z-50 flex flex-col',
        'transform transition-transform duration-300 ease-in-out',
        'lg:translate-x-0 lg:static lg:z-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-700 to-amber-900 rounded-xl flex items-center justify-center shadow-md">
              <Package2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display text-sm font-medium text-amber-900 leading-tight">Made Products</p>
              <p className="text-xs text-amber-600/70">Catalog System</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3">
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            isAdmin
              ? 'bg-amber-100 text-amber-800'
              : 'bg-green-100 text-green-700'
          )}>
            {isAdmin ? '⚡ Admin' : '👤 Employee'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {items.map(({ href, label, icon: Icon }) => {
            const active = href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  active
                    ? 'bg-amber-50 text-amber-800 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={cn('w-4.5 h-4.5 flex-shrink-0', active ? 'text-amber-700' : 'text-gray-400 group-hover:text-gray-600')} />
                <span>{label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-amber-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-amber-50">
          <p className="text-xs text-gray-400 text-center">Made Products © 2026</p>
        </div>
      </aside>
    </>
  );
}
