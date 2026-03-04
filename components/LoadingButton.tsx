import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function LoadingButton({
  children,
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-ngo-primary text-white hover:bg-blue-700 focus:ring-ngo-primary shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-ngo-secondary shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm',
    warning: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 shadow-sm'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      
      {!loading && icon && (
        <span className="mr-2">{icon}</span>
      )}
      
      <span>
        {loading ? (loadingText || 'Carregando...') : children}
      </span>
    </button>
  );
}

// Componente específico para botões de salvar
export function SaveButton({
  id,
  children = 'Salvar',
  loadingText = 'Salvando...',
  ...props
}: Omit<ButtonProps, 'loading'> & { id?: string }) {
  return (
    <LoadingButton
      variant="primary"
      icon={<span>💾</span>}
      loadingText={loadingText}
      {...props}
    >
      {children}
    </LoadingButton>
  );
}

// Componente específico para botões de excluir
export function DeleteButton({
  children = 'Excluir',
  loadingText = 'Excluindo...',
  ...props
}: Omit<ButtonProps, 'loading' | 'variant'>) {
  return (
    <LoadingButton
      variant="danger"
      icon={<span>🗑️</span>}
      loadingText={loadingText}
      {...props}
    >
      {children}
    </LoadingButton>
  );
}

// Componente específico para botões de confirmar
export function ConfirmButton({
  children = 'Confirmar',
  loadingText = 'Confirmando...',
  ...props
}: Omit<ButtonProps, 'loading' | 'variant'>) {
  return (
    <LoadingButton
      variant="danger"
      icon={<span>✓</span>}
      loadingText={loadingText}
      {...props}
    >
      {children}
    </LoadingButton>
  );
}

// Componente específico para botões de cancelar
export function CancelButton({
  children = 'Cancelar',
  ...props
}: Omit<ButtonProps, 'loading' | 'variant' | 'icon'>) {
  return (
    <LoadingButton
      variant="secondary"
      {...props}
    >
      {children}
    </LoadingButton>
  );
}
