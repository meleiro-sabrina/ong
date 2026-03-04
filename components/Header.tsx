'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, UserCircle, Menu, LogOut, Loader2, User } from 'lucide-react';
import Link from 'next/link';

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLogoutLoading(false);
    }
  };
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 md:px-4 shrink-0 shadow-sm z-10">
      <div className="flex items-center">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 mr-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="hidden sm:flex items-center text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Search className="w-4 h-4 mr-2" />
          <input 
            type="text" 
            placeholder="Buscar no sistema..." 
            className="bg-transparent border-none focus:outline-none text-sm w-48 lg:w-64 text-slate-700"
          />
        </div>
      </div>
      <div className="flex items-center space-x-3 md:space-x-4 text-slate-500">
        <button className="hover:text-ngo-primary transition-colors relative p-1">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-ngo-danger rounded-full border border-white"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
        
        {/* User Menu */}
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : user ? (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center hover:text-ngo-primary transition-colors"
            >
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <UserCircle className="w-8 h-8 sm:mr-2 text-slate-400" />
              )}
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-semibold text-slate-700 leading-tight">{user.name}</span>
                <span className="text-xs text-slate-500 leading-tight">{user.role}</span>
              </div>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                <Link 
                  href="/dashboard/perfil"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-4 h-4 mr-2" />
                  Meu Perfil
                </Link>
                <button 
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {logoutLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="text-sm text-ngo-primary hover:text-blue-900">
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
