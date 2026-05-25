'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function LightDatePicker({
  value,
  onChange,
  placeholder = 'Выберите дату',
  className = '',
}: LightDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setCurrentMonth(date);
      }
    }
  }, [isOpen, value]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    onChange(date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    onChange(today.toISOString().split('T')[0]);
    setCurrentMonth(today);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const isSelectedDate = (day: number) => {
    if (!value) return false;
    const selectedDate = new Date(value);
    if (isNaN(selectedDate.getTime())) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 bg-gray-50 border rounded-xl text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all hover:bg-gray-100 flex items-center justify-between ${
          value ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
        }`}
      >
        <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400'}>
          {value ? formatDate(value) : placeholder}
        </span>
        <Calendar className={`w-4 h-4 flex-shrink-0 ${value ? 'text-blue-500' : 'text-gray-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-64 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-50/50 border-b border-gray-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-blue-100 rounded-lg transition-all text-blue-500 hover:text-blue-700"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-gray-800 font-bold text-sm capitalize tracking-wide">
              {getMonthName(currentMonth)}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-blue-100 rounded-lg transition-all text-blue-500 hover:text-blue-700"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-[10px] font-bold text-blue-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5 px-3 pb-3">
            {days.map((day, index) => (
              <div key={index} className="aspect-square">
                {day ? (
                  <button
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={`w-full h-full flex items-center justify-center text-xs rounded-lg transition-all font-medium ${
                      isSelectedDate(day)
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : isToday(day)
                        ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {day}
                  </button>
                ) : (
                  <div />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-all font-medium"
            >
              Удалить
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-semibold"
            >
              Сегодня
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
