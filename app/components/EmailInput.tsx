'use client';

import { useState, useEffect } from 'react';
import { Mail, Check, X } from 'lucide-react';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  required?: boolean;
  className?: string;
}

export default function EmailInput({
  value,
  onChange,
  placeholder = 'example@domain.com',
  label,
  required = false,
  className = '',
}: EmailInputProps) {
  const [isTouched, setIsTouched] = useState(false);

  // Валидация email
  const validateEmail = (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Форматирование email (приведение к нижнему регистру, удаление пробелов)
  const formatEmail = (input: string): string => {
    return input.toLowerCase().trim().replace(/\s/g, '');
  };

  // Обработка изменения
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatEmail(input);
    onChange(formatted);
  };

  // Обработка потери фокуса
  const handleBlur = () => {
    setIsTouched(true);
  };

  const isValid = validateEmail(value);
  const showValidation = isTouched && value.length > 0;
  const showError = showValidation && !isValid;
  const showSuccess = showValidation && isValid;

  return (
    <div className={`relative ${className}`}>
      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
        {label} {required && '*'}
      </label>

      <div className="relative">
        <input
          type="email"
          required={required}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-3 py-2.5 pr-10 bg-[#1e2533] border rounded-lg focus:outline-none focus:ring-2 text-white text-sm ${
            showError
              ? 'border-red-500/50 focus:ring-red-500/50'
              : showSuccess
              ? 'border-emerald-500/50 focus:ring-emerald-500/50'
              : 'border-gray-700/50 focus:ring-violet-500/50'
          }`}
          placeholder={placeholder}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showSuccess && (
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
          )}
          {showError && (
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <X size={12} className="text-white" />
            </div>
          )}
          {!showValidation && (
            <Mail size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Подсказка о формате */}
      {!isTouched && value.length === 0 && (
        <p className="text-xs text-gray-500 mt-1">
          Формат: example@domain.com
        </p>
      )}

      {/* Ошибка валидации */}
      {showError && (
        <p className="text-xs text-red-400 mt-1">
          ✗ Введите корректный email адрес
        </p>
      )}

      {/* Успешная валидация */}
      {showSuccess && (
        <p className="text-xs text-emerald-400 mt-1">
          ✓ Email введен корректно
        </p>
      )}
    </div>
  );
}
