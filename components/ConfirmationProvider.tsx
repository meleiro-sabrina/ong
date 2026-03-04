'use client';

import React, { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { AlertTriangle, Trash2, X, Check, Loader2 } from 'lucide-react';
import { LoadingButton } from './LoadingButton';

type ConfirmationType = 'delete' | 'warning' | 'info' | 'danger';

type ConfirmationOptions = {
  type?: ConfirmationType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
};

type ConfirmationItem = ConfirmationOptions & {
  id: string;
  loading?: boolean;
};

const ConfirmationContext = createContext<{
  confirm: (options: ConfirmationOptions) => void;
} | null>(null);

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [confirmations, setConfirmations] = useState<ConfirmationItem[]>([]);

  const confirm = useCallback((options: ConfirmationOptions) => {
    const id = makeId();
    const item: ConfirmationItem = {
      id,
      type: options.type || 'warning',
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    };

    setConfirmations(prev => [...prev, item]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setConfirmations(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleConfirm = useCallback(async (id: string) => {
    const confirmation = confirmations.find(item => item.id === id);
    if (confirmation) {
      // Set loading state
      setConfirmations(prev => 
        prev.map(item => 
          item.id === id ? { ...item, loading: true } : item
        )
      );

      try {
        await confirmation.onConfirm();
        dismiss(id);
      } catch (error) {
        console.error('Confirmation action failed:', error);
        // Remove loading state on error
        setConfirmations(prev => 
          prev.map(item => 
            item.id === id ? { ...item, loading: false } : item
          )
        );
      }
    }
  }, [confirmations, dismiss]);

  const handleCancel = useCallback((id: string) => {
    const confirmation = confirmations.find(item => item.id === id);
    if (confirmation?.onCancel) {
      confirmation.onCancel();
    }
    dismiss(id);
  }, [confirmations, dismiss]);

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      
      {/* Confirmation Modals */}
      <div className="fixed inset-0 z-[75] pointer-events-none">
        {confirmations.map(confirmation => {
          let icon;
          let bgClass;
          let borderClass;
          let iconColor;
          let confirmBgClass;
          let confirmHoverClass;

          switch (confirmation.type) {
            case 'delete':
              icon = Trash2;
              bgClass = 'bg-gradient-to-br from-red-50 to-rose-50';
              borderClass = 'border-red-200';
              iconColor = 'text-red-600';
              confirmBgClass = 'bg-red-600 hover:bg-red-700';
              confirmHoverClass = 'hover:bg-red-700';
              break;
            case 'danger':
              icon = AlertTriangle;
              bgClass = 'bg-gradient-to-br from-red-50 to-orange-50';
              borderClass = 'border-red-200';
              iconColor = 'text-red-600';
              confirmBgClass = 'bg-red-600 hover:bg-red-700';
              confirmHoverClass = 'hover:bg-red-700';
              break;
            case 'warning':
              icon = AlertTriangle;
              bgClass = 'bg-gradient-to-br from-amber-50 to-yellow-50';
              borderClass = 'border-amber-200';
              iconColor = 'text-amber-600';
              confirmBgClass = 'bg-amber-600 hover:bg-amber-700';
              confirmHoverClass = 'hover:bg-amber-700';
              break;
            case 'info':
            default:
              icon = AlertTriangle;
              bgClass = 'bg-gradient-to-br from-blue-50 to-indigo-50';
              borderClass = 'border-blue-200';
              iconColor = 'text-blue-600';
              confirmBgClass = 'bg-blue-600 hover:bg-blue-700';
              confirmHoverClass = 'hover:bg-blue-700';
              break;
          }

          const Icon = icon;

          return (
            <div
              key={confirmation.id}
              className="fixed inset-0 flex items-center justify-center p-4 pointer-events-auto"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  handleCancel(confirmation.id);
                }
              }}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />
              
              {/* Modal */}
              <div className={`relative ${bgClass} ${borderClass} border-2 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 slide-in-from-bottom-2`}>
                {/* Header */}
                <div className="flex items-start gap-4 p-6">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${bgClass} border-2 ${borderClass} flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {confirmation.title}
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {confirmation.message}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleCancel(confirmation.id)}
                    className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-6 pb-6">
                  <button
                    onClick={() => handleCancel(confirmation.id)}
                    disabled={confirmation.loading}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {confirmation.cancelText}
                  </button>
                  <LoadingButton
                    onClick={() => handleConfirm(confirmation.id)}
                    loading={confirmation.loading}
                    loadingText="Processando..."
                    variant="danger"
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {confirmation.confirmText}
                  </LoadingButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ConfirmationContext.Provider>
  );
}

export function useConfirmation() {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within ConfirmationProvider');
  }
  return context;
}

// Hook específico para confirmações de exclusão
export function useDeleteConfirmation() {
  const { confirm } = useConfirmation();

  const confirmDelete = useCallback((
    itemName: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      title?: string;
      message?: string;
      confirmText?: string;
    }
  ) => {
    confirm({
      type: 'delete',
      title: options?.title || `Excluir ${itemName}`,
      message: options?.message || `Tem certeza que deseja excluir este(a) ${itemName.toLowerCase()}? Esta ação não pode ser desfeita.`,
      confirmText: options?.confirmText || 'Sim, excluir',
      onConfirm,
    });
  }, [confirm]);

  return { confirmDelete };
}

// Hook para confirmações perigosas
export function useDangerConfirmation() {
  const { confirm } = useConfirmation();

  const confirmDanger = useCallback((
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    confirm({
      type: 'danger',
      title,
      message,
      confirmText: options?.confirmText || 'Confirmar ação',
      cancelText: options?.cancelText || 'Cancelar',
      onConfirm,
    });
  }, [confirm]);

  return { confirmDanger };
}

// Hook para confirmações de aviso
export function useWarningConfirmation() {
  const { confirm } = useConfirmation();

  const confirmWarning = useCallback((
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    confirm({
      type: 'warning',
      title,
      message,
      confirmText: options?.confirmText || 'Continuar',
      cancelText: options?.cancelText || 'Cancelar',
      onConfirm,
    });
  }, [confirm]);

  return { confirmWarning };
}
