'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Выберите дату',
  className = '',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Инициализация текущего месяца при открытии
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
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Понедельник = 0

    const days: (number | null)[] = [];

    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Добавляем дни текущего месяца
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
    const formattedDate = date.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    onChange(formattedDate);
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
      {/* Кнопка выбора даты */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-[#2a3347] border-2 border-violet-500 rounded-xl text-white text-sm text-left focus:outline-none focus:border-violet-400 transition-all hover:bg-[#2f3850] flex items-center justify-between"
      >
        <span className={value ? 'text-white' : 'text-gray-400'}>
          {value ? formatDate(value) : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-gray-400" />
      </button>

      {/* Календарь */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#2a3347] border-2 border-violet-500/50 rounded-xl shadow-2xl overflow-hidden">
          {/* Header с месяцем и годом */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700/50">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-[#353d52] rounded-lg transition-all text-gray-400 hover:text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-white font-semibold text-sm capitalize">
              {getMonthName(currentMonth)}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-[#353d52] rounded-lg transition-all text-gray-400 hover:text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Дни недели */}
          <div className="grid grid-cols-7 gap-1 p-2 border-b border-gray-700/50">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-400 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Календарная сетка */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {days.map((day, index) => (
              <div key={index} className="aspect-square">
                {day ? (
                  <button
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={`w-full h-full flex items-center justify-center text-sm rounded-lg transition-all ${
                      isSelectedDate(day)
                        ? 'bg-violet-600 text-white font-semibold'
                        : isToday(day)
                        ? 'bg-violet-500/20 text-violet-400 font-semibold'
                        : 'text-gray-300 hover:bg-[#353d52]'
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

          {/* Footer с кнопками */}
          <div className="flex items-center justify-between p-2 border-t border-gray-700/50">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              Удалить
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 text-xs text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
            >
              Сегодня
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
