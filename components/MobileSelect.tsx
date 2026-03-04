'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface MobileSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; title?: string }>;
  placeholder: string;
  className?: string;
  disabled?: boolean;
}

export function MobileSelect({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  className = '', 
  disabled = false 
}: MobileSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-left flex items-center justify-between focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-[60] md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="fixed inset-x-4 bottom-4 top-20 bg-white rounded-xl shadow-xl border border-slate-200 z-[60] flex flex-col md:absolute md:inset-x-auto md:inset-y-auto md:top-full md:mt-1 md:max-h-64 md:w-full md:z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900">Selecionar Turma</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-slate-200">
              <input
                type="text"
                placeholder="Buscar turma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary"
                autoFocus
              />
            </div>

            {/* Options List */}
            <div className="flex-1 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  Nenhuma turma encontrada
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-4 py-3 text-left text-sm border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      option.value === value ? 'bg-blue-50 text-ngo-primary font-medium' : 'text-slate-900'
                    }`}
                    title={option.title || option.label}
                  >
                    <div className="truncate">{option.label}</div>
                    {option.title && (
                      <div className="text-xs text-slate-500 truncate">{option.title}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
