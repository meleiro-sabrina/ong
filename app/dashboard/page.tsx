'use client';

import Link from 'next/link';
import { LayoutDashboard, Users, BookOpen, UserSquare2, CalendarDays, Award, Package, HeartHandshake } from 'lucide-react';

export default function DashboardHomePage() {
  const cards = [
    { href: '/dashboard/alunos', title: 'Alunos', icon: <Users className="w-5 h-5" /> },
    { href: '/dashboard/turmas', title: 'Turmas', icon: <BookOpen className="w-5 h-5" /> },
    { href: '/dashboard/professores', title: 'Professores', icon: <UserSquare2 className="w-5 h-5" /> },
    { href: '/dashboard/calendario', title: 'Calendário', icon: <CalendarDays className="w-5 h-5" /> },
    { href: '/dashboard/documentos', title: 'Documentos', icon: <Award className="w-5 h-5" /> },
    { href: '/dashboard/estoque', title: 'Estoque', icon: <Package className="w-5 h-5" /> },
    { href: '/dashboard/doacoes', title: 'Doações', icon: <HeartHandshake className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <LayoutDashboard className="w-6 h-6 mr-2 text-ngo-primary" />
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">Escolha um módulo para começar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-ngo-primary mr-3">
                {c.icon}
              </div>
              <div className="font-semibold text-slate-900">{c.title}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
