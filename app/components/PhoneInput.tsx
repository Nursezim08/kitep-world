'use client';

import { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  required?: boolean;
  className?: string;
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = '+996 XXX XXX XXX',
  label,
  required = false,
  className = '',
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // Форматирование номера телефона
  const formatPhoneNumber = (input: string): string => {
    // Удаляем все нецифровые символы кроме +
    let cleaned = input.replace(/[^\d+]/g, '');

    // Если начинается с 0, заменяем на +996
    if (cleaned.startsWith('0')) {
      cleaned = '+996' + cleaned.substring(1);
    }

    // Если не начинается с +996, добавляем
    if (!cleaned.startsWith('+996')) {
      if (cleaned.startsWith('+')) {
        cleaned = '+996' + cleaned.substring(1);
      } else if (cleaned.startsWith('996')) {
        cleaned = '+' + cleaned;
      } else {
        cleaned = '+996' + cleaned;
      }
    }

    // Ограничиваем длину: +996 (3) + 9 цифр = 13 символов
    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13);
    }

    // Форматируем: +996 XXX XXX XXX
    let formatted = cleaned;
    if (cleaned.length > 4) {
      // +996 XXX
      formatted = cleaned.substring(0, 4) + ' ' + cleaned.substring(4);
    }
    if (cleaned.length > 7) {
      // +996 XXX XXX
      formatted = cleaned.substring(0, 4) + ' ' + cleaned.substring(4, 7) + ' ' + cleaned.substring(7);
    }
    if (cleaned.length > 10) {
      // +996 XXX XXX XXX
      formatted = cleaned.substring(0, 4) + ' ' + cleaned.substring(4, 7) + ' ' + cleaned.substring(7, 10) + ' ' + cleaned.substring(10);
    }

    return formatted;
  };

  // Получение чистого номера (только цифры с +996)
  const getCleanNumber = (formatted: string): string => {
    return formatted.replace(/\s/g, '');
  };

  // Обработка изменения значения
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    const clean = getCleanNumber(formatted);

    setDisplayValue(formatted);
    onChange(clean);
  };

  // Обработка фокуса - если поле пустое, добавляем +996
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!value || value === '') {
      const formatted = '+996 ';
      setDisplayValue(formatted);
      onChange('+996');
      // Устанавливаем курсор в конец
      setTimeout(() => {
        e.target.setSelectionRange(formatted.length, formatted.length);
      }, 0);
    }
  };

  // Обработка нажатия клавиш
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPosition = input.selectionStart || 0;

    // Запрещаем удаление +996
    if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPosition <= 4) {
      e.preventDefault();
    }
  };

  // Синхронизация с внешним значением
  useEffect(() => {
    if (value) {
      const formatted = formatPhoneNumber(value);
      setDisplayValue(formatted);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  // Валидация номера
  const isValid = value.length === 13; // +996 + 9 цифр
  const showValidation = value.length > 4 && !isValid;

  return (
    <div className={`relative ${className}`}>
      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
        {label} {required && '*'}
      </label>

      <div className="relative">
        <input
          type="tel"
          required={required}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className={`w-full px-3 py-2.5 pr-10 bg-[#1e2533] border rounded-lg focus:outline-none focus:ring-2 text-white text-sm ${
            showValidation
              ? 'border-red-500/50 focus:ring-red-500/50'
              : 'border-gray-700/50 focus:ring-violet-500/50'
          }`}
          placeholder={placeholder}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Phone size={16} className={showValidation ? 'text-red-400' : 'text-gray-400'} />
        </div>
      </div>

      {/* Подсказка о формате */}
      {value.length === 0 && (
        <p className="text-xs text-gray-500 mt-1">
          Формат: +996 XXX XXX XXX
        </p>
      )}

      {/* Ошибка валидации */}
      {showValidation && (
        <p className="text-xs text-red-400 mt-1">
          Номер должен содержать 9 цифр после +996
        </p>
      )}

      {/* Успешная валидация */}
      {isValid && (
        <p className="text-xs text-emerald-400 mt-1">
          ✓ Номер введен корректно
        </p>
      )}
    </div>
  );
}