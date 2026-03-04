'use client';

import { Users, BookOpen, UserSquare2, CalendarCheck, HeartHandshake, FileText, LayoutDashboard, Award, Package, Heart, MessageSquare, CalendarDays, X, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from './PermissionsContext';

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { canView, loading } = usePermissions();

  if (loading) {
    return (
      <aside className="w-64 bg-ngo-sidebar text-white flex flex-col h-full shrink-0">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-ngo-sidebar text-white flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center">
          <HeartHandshake className="w-6 h-6 text-ngo-accent mr-3" />
          <span className="font-bold text-lg tracking-wide">ONG Gestão</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 hover:bg-white/10 rounded-md">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {canView('Dashboard') && (
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" href="/" active={pathname === '/'} onClick={onClose} />
        )}
        
        {(canView('Alunos') || canView('Turmas') || canView('Professores') || canView('Voluntários') || canView('Presença') || canView('Calendário')) && (
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pessoas & Aulas</div>
        )}
        {canView('Alunos') && (
          <NavItem icon={<Users size={20} />} label="Alunos" href="/alunos" active={pathname === '/alunos'} onClick={onClose} />
        )}
        {canView('Turmas') && (
          <NavItem icon={<BookOpen size={20} />} label="Turmas" href="/turmas" active={pathname?.startsWith('/turmas')} onClick={onClose} />
        )}
        {canView('Professores') && (
          <NavItem icon={<UserSquare2 size={20} />} label="Professores" href="/professores" active={pathname === '/professores'} onClick={onClose} />
        )}
        {canView('Voluntários') && (
          <NavItem icon={<Heart size={20} />} label="Voluntários" href="/voluntarios" active={pathname === '/voluntarios'} onClick={onClose} />
        )}
        {canView('Presença') && (
          <NavItem icon={<CalendarCheck size={20} />} label="Presença" href="/presenca" active={pathname === '/presenca'} onClick={onClose} />
        )}
        {canView('Calendário') && (
          <NavItem icon={<CalendarDays size={20} />} label="Calendário" href="/calendario" active={pathname === '/calendario'} onClick={onClose} />
        )}
        
        {(canView('Documentos') || canView('Mensagens') || canView('Doações') || canView('Estoque') || canView('Relatórios')) && (
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Operacional</div>
        )}
        {canView('Documentos') && (
          <NavItem icon={<Award size={20} />} label="Documentos" href="/documentos" active={pathname === '/documentos'} onClick={onClose} />
        )}
        {canView('Mensagens') && (
          <NavItem icon={<MessageSquare size={20} />} label="Mensagens" href="/mensagens" active={pathname === '/mensagens'} onClick={onClose} />
        )}
        {canView('Doações') && (
          <NavItem icon={<HeartHandshake size={20} />} label="Doações" href="/doacoes" active={pathname === '/doacoes'} onClick={onClose} />
        )}
        {canView('Estoque') && (
          <NavItem icon={<Package size={20} />} label="Estoque" href="/estoque" active={pathname === '/estoque'} onClick={onClose} />
        )}
        {canView('Relatórios') && (
          <NavItem icon={<FileText size={20} />} label="Relatórios" href="/relatorios" active={pathname === '/relatorios'} onClick={onClose} />
        )}
        
        {canView('Usuários') && (
          <>
            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Configurações</div>
            <NavItem icon={<ShieldCheck size={20} />} label="Usuários" href="/usuarios" active={pathname === '/usuarios'} onClick={onClose} />
          </>
        )}
      </nav>
      
      <div className="p-4 border-t border-white/10 text-xs text-slate-400 text-center">
        Versão 1.0.0 MVP
      </div>
    </aside>
  );
}

function NavItem({ icon, label, href, active = false, onClick }: { icon: React.ReactNode, label: string, href: string, active?: boolean, onClick?: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
        active 
          ? 'bg-ngo-primary text-white' 
          : 'text-slate-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-3 font-medium text-sm">{label}</span>
    </Link>
  );
}
