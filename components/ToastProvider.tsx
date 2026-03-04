'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Save, Edit, Plus, Users, Calendar } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  durationMs: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

type ToastInput = {
  type: ToastType;
  title: string;
  description?: string;
  durationMs?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

type ToastApi = {
  show: (t: ToastInput) => void;
  success: (title: string, description?: string, durationMs?: number) => void;
  error: (title: string, description?: string, durationMs?: number) => void;
  info: (title: string, description?: string, durationMs?: number) => void;
  warning: (title: string, description?: string, durationMs?: number) => void;
  // Specific methods for common actions
  saved: (entity: string) => void;
  created: (entity: string) => void;
  updated: (entity: string) => void;
  deleted: (entity: string) => void;
  attendance: (action: 'saved' | 'updated', count?: number) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    const t = timers.current[id];
    if (t) window.clearTimeout(t);
    delete timers.current[id];
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (input: ToastInput) => {
      const id = makeId();
      const item: ToastItem = {
        id,
        type: input.type,
        title: input.title,
        description: input.description,
        durationMs: typeof input.durationMs === 'number' ? input.durationMs : 4000,
        action: input.action,
      };

      setToasts((prev) => [item, ...prev].slice(0, 4));
      timers.current[id] = window.setTimeout(() => dismiss(id), item.durationMs);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (title, description, durationMs) => show({ type: 'success', title, description, durationMs }),
      error: (title, description, durationMs) => show({ type: 'error', title, description, durationMs }),
      info: (title, description, durationMs) => show({ type: 'info', title, description, durationMs }),
      warning: (title, description, durationMs) => show({ type: 'warning', title, description, durationMs }),
      
      // Specific methods for common actions
      saved: (entity: string) => show({ 
        type: 'success', 
        title: `${entity} salvo(a) com sucesso!`,
        description: 'As alterações foram aplicadas.' 
      }),
      created: (entity: string) => show({ 
        type: 'success', 
        title: `${entity} criado(a) com sucesso!`,
        description: 'O novo registro foi adicionado ao sistema.' 
      }),
      updated: (entity: string) => show({ 
        type: 'success', 
        title: `${entity} atualizado(a) com sucesso!`,
        description: 'As informações foram modificadas.' 
      }),
      deleted: (entity: string) => show({ 
        type: 'warning', 
        title: `${entity} excluído(a) com sucesso!`,
        description: 'O registro foi removido permanentemente.' 
      }),
      attendance: (action: 'saved' | 'updated', count?: number) => {
        const title = action === 'saved' 
          ? 'Presença salva com sucesso!' 
          : 'Presença atualizada com sucesso!';
        const description = count 
          ? `Registro de ${count} aluno(s) processado(s).`
          : 'O registro de presença foi processado.';
        show({ type: 'success', title, description });
      },
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[70] flex w-[380px] max-w-[calc(100vw-2rem)] flex-col gap-3 pointer-events-none">
        {toasts.map((t) => {
          let Icon;
          let borderClass;
          let bgClass;
          let iconColor;
          let titleColor;
          let descriptionColor;

          switch (t.type) {
            case 'success':
              Icon = CheckCircle2;
              borderClass = 'border-green-200';
              bgClass = 'bg-gradient-to-r from-green-50 to-emerald-50';
              iconColor = 'text-green-600';
              titleColor = 'text-green-900';
              descriptionColor = 'text-green-700';
              break;
            case 'error':
              Icon = AlertCircle;
              borderClass = 'border-red-200';
              bgClass = 'bg-gradient-to-r from-red-50 to-rose-50';
              iconColor = 'text-red-600';
              titleColor = 'text-red-900';
              descriptionColor = 'text-red-700';
              break;
            case 'warning':
              Icon = AlertCircle;
              borderClass = 'border-amber-200';
              bgClass = 'bg-gradient-to-r from-amber-50 to-yellow-50';
              iconColor = 'text-amber-600';
              titleColor = 'text-amber-900';
              descriptionColor = 'text-amber-700';
              break;
            case 'info':
            default:
              Icon = Info;
              borderClass = 'border-blue-200';
              bgClass = 'bg-gradient-to-r from-blue-50 to-indigo-50';
              iconColor = 'text-blue-600';
              titleColor = 'text-blue-900';
              descriptionColor = 'text-blue-700';
              break;
          }

          return (
            <div
              key={t.id}
              className={`${bgClass} ${borderClass} shadow-lg border-2 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 rounded-xl p-4 pointer-events-auto transform transition-all duration-300 hover:scale-[1.02]`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${titleColor}`}>{t.title}</div>
                  {t.description && (
                    <div className={`mt-1 text-sm ${descriptionColor} line-clamp-2`}>{t.description}</div>
                  )}
                  {t.action && (
                    <button
                      onClick={t.action.onClick}
                      className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {t.action.label}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="flex-shrink-0 rounded-md p-1 text-slate-400 hover:bg-white/60 hover:text-slate-600 transition-all duration-200"
                  aria-label="Fechar notificação"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
