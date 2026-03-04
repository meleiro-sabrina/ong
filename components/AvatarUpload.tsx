'use client';

import { useState, useRef } from 'react';
import { Camera, X, User } from 'lucide-react';

interface AvatarUploadProps {
  value?: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function AvatarUpload({ value, onChange, size = 'md', label }: AvatarUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32,
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB');
      return;
    }

    setIsLoading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onChange(base64);
        setIsLoading(false);
      };
      reader.onerror = () => {
        alert('Erro ao ler a imagem');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      alert('Erro ao processar a imagem');
      setIsLoading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      
      <div 
        onClick={handleClick}
        className={`${sizeClasses[size]} relative rounded-xl overflow-hidden cursor-pointer group transition-all border-2 border-dashed ${
          value 
            ? 'border-ngo-secondary' 
            : 'border-slate-300 hover:border-slate-400'
        } ${isLoading ? 'opacity-50' : ''}`}
      >
        {value ? (
          <>
            <img 
              src={value} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="text-white" size={iconSizes[size]} />
            </div>
            {/* Remove button */}
            <button
              onClick={handleRemove}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm z-10"
              type="button"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center group-hover:bg-slate-100 transition-colors">
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ngo-primary" />
            ) : (
              <>
                <User size={iconSizes[size]} className="text-slate-400" />
                <span className="text-xs text-slate-500 mt-1">Foto</span>
              </>
            )}
          </div>
        )}
        
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      <span className="text-xs text-slate-400">Clique para {value ? 'trocar' : 'adicionar'}</span>
    </div>
  );
}
