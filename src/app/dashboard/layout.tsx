'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface UserData {
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        if (!data.active) {
          router.push('/auth/login');
          return;
        }
        setUser(data);
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    }
    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-amber-200 border-t-amber-700 rounded-full animate-spin" />
          <p className="text-sm text-amber-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        role={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
