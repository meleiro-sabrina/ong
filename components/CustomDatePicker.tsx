'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomDatePicker({ 
  value, 
  onChange, 
  placeholder = "Selecione uma data", 
  className = '', 
  disabled = false 
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (date: string) => {
    onChange(date);
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return placeholder;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Generate simple calendar days for current month
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  const currentMonth = today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-left flex items-center justify-between focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={value ? 'text-slate-900' : 'text-slate-400'}>
          {formatDate(value)}
        </span>
        <CalendarIcon className="w-4 h-4 text-slate-400" />
      </button>

      {/* Calendar Modal */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-[55]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Calendar */}
          <div className="fixed inset-x-4 bottom-4 top-20 bg-white rounded-xl shadow-xl border border-slate-200 z-[55] flex flex-col max-w-sm mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900">{currentMonth}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-slate-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div key={index} className="aspect-square">
                    {day && (
                      <button
                        type="button"
                        onClick={() => {
                          const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          handleDateSelect(dateStr);
                        }}
                        className={`w-full h-full flex items-center justify-center text-sm rounded-lg hover:bg-slate-100 transition-colors ${
                          value === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {day}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
