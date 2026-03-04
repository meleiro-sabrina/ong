'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PermissionsProvider } from './PermissionsContext';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <PermissionsProvider>
      <div className="flex min-h-screen w-full bg-ngo-bg">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 relative min-w-0">
          <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 p-3 md:p-4 lg:p-5">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </PermissionsProvider>
  );
}
