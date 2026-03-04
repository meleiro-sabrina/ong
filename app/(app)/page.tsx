'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, Users, BookOpen, UserSquare2, CalendarDays, Award, Package, HeartHandshake, AlertTriangle, ShieldAlert, Info, TrendingUp, CalendarCheck } from 'lucide-react';

export default function DashboardHomePage() {
  const shortcuts = [
    { href: '/alunos', title: 'Alunos', icon: <Users className="w-5 h-5" /> },
    { href: '/turmas', title: 'Turmas', icon: <BookOpen className="w-5 h-5" /> },
    { href: '/professores', title: 'Professores', icon: <UserSquare2 className="w-5 h-5" /> },
    { href: '/calendario', title: 'Calendário', icon: <CalendarDays className="w-5 h-5" /> },
    { href: '/documentos', title: 'Documentos', icon: <Award className="w-5 h-5" /> },
    { href: '/estoque', title: 'Estoque', icon: <Package className="w-5 h-5" /> },
    { href: '/doacoes', title: 'Doações', icon: <HeartHandshake className="w-5 h-5" /> },
  ];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/dashboard', { cache: 'no-store' });
        if (!res.ok) throw new Error('Falha ao carregar dados do dashboard');
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(typeof e?.message === 'string' ? e.message : 'Erro inesperado');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = data?.stats;
  const occupancy = Array.isArray(data?.occupancy) ? data.occupancy : [];
  const alerts = Array.isArray(data?.alerts) ? data.alerts : [];

  const currency = useMemo(
    () => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    []
  );

  const pct = (value: number) => `${Math.round(value * 100)}%`;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <LayoutDashboard className="w-6 h-6 mr-2 text-ngo-primary" />
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">Visão geral do dia e alertas operacionais.</p>
        </div>
      </div>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-600">Carregando...</div>
      )}

      {!loading && error && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Recebimentos pendentes (total)</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{currency.format(Number(stats?.donationsPendingTotal ?? 0))}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Recebido (mês)</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{currency.format(Number(stats?.donationsMonthCompleted ?? 0))}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-700">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Recebido (30 dias)</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{currency.format(Number(stats?.donationsLast30Completed ?? 0))}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Alunos (total / ativos)</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {Number(stats?.studentsTotal ?? 0)}
                    <span className="text-slate-500 font-medium text-sm"> / {Number(stats?.studentsActive ?? 0)}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Média de presença (mês)</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{stats?.attendanceAvg == null ? '-' : pct(Number(stats.attendanceAvg))}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-ngo-primary">
                  <CalendarCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Aulas registradas (mês)</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{Number(stats?.attendanceMonthCount ?? 0)}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
                  <CalendarDays className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Turmas ativas</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{Number(stats?.classesActive ?? 0)}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-slate-900">Alertas</div>
                <div className="text-xs text-slate-500">Regra: atraso de {Number(stats?.attendanceDelayCutoffDays ?? 3)}+ dias</div>
              </div>

              {alerts.length === 0 ? (
                <div className="text-sm text-slate-600">Nenhum alerta no momento.</div>
              ) : (
                <div className="space-y-3">
                  {alerts.slice(0, 12).map((a: any, idx: number) => {
                    const type = String(a?.type || 'info');
                    const meta =
                      type === 'danger'
                        ? { icon: <ShieldAlert className="w-4 h-4" />, box: 'border-red-200 bg-red-50 text-red-800' }
                        : type === 'warning'
                          ? { icon: <AlertTriangle className="w-4 h-4" />, box: 'border-amber-200 bg-amber-50 text-amber-800' }
                          : { icon: <Info className="w-4 h-4" />, box: 'border-slate-200 bg-slate-50 text-slate-700' };

                    return (
                      <Link
                        key={`${a?.title ?? 'alert'}-${idx}`}
                        href={String(a?.href || '/')}
                        className={`block border rounded-lg px-4 py-3 hover:opacity-90 transition-opacity ${meta.box}`}
                      >
                        <div className="flex items-start">
                          <div className="mt-0.5 mr-2">{meta.icon}</div>
                          <div>
                            <div className="text-sm font-semibold">{String(a?.title || 'Alerta')}</div>
                            <div className="text-xs mt-0.5 opacity-90">{String(a?.description || '')}</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="font-semibold text-slate-900 mb-4">Turmas mais cheias</div>
              {occupancy.length === 0 ? (
                <div className="text-sm text-slate-600">Sem dados.</div>
              ) : (
                <div className="space-y-3">
                  {occupancy.map((c: any) => {
                    const current = Number(c.currentStudents ?? 0);
                    const max = Number(c.maxStudents ?? 0);
                    const ratio = max > 0 ? current / max : 0;
                    return (
                      <Link key={c.id} href={`/turmas/${c.id}`} className="block border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors">
                        <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.professor}</div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <span>{current}/{max}</span>
                            <span>{pct(ratio)}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div className="h-2 bg-ngo-primary" style={{ width: `${Math.min(100, Math.round(ratio * 100))}%` }} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shortcuts.map((c) => (
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
