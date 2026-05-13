'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, MapPin, Clock, Phone, Mail } from 'lucide-react';

interface Branch {
  id: string;
  code: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  workDays: string[];
  openTime: string;
  closeTime: string;
}

interface BranchSelectProps {
  branches: Branch[];
  value: string;
  onChange: (branchId: string) => void;
}

export default function BranchSelect({ branches, value, onChange }: BranchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedBranch = branches.find((b) => b.id === value);

  const getDayName = (day: string) => {
    const days: Record<string, string> = {
      monday: 'Пн',
      tuesday: 'Вт',
      wednesday: 'Ср',
      thursday: 'Чт',
      friday: 'Пт',
      saturday: 'Сб',
      sunday: 'Вс',
    };
    return days[day] || day;
  };

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (branchId: string) => {
    onChange(branchId);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Кнопка выбора */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border-2 border-violet-500 rounded-xl text-left flex items-center justify-between hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/20"
      >
        <div className="flex-1 min-w-0">
          {selectedBranch ? (
            <div>
              <p className="font-semibold text-gray-900">
                Филиал {selectedBranch.code}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {selectedBranch.city}, {selectedBranch.district}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Выберите филиал для самовывоза</p>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`text-violet-600 flex-shrink-0 ml-2 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Выпадающий список */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-violet-500/50 rounded-xl shadow-2xl max-h-[400px] overflow-y-auto">
          {branches.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => handleSelect(branch.id)}
              className={`w-full p-4 text-left hover:bg-violet-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                value === branch.id ? 'bg-violet-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {/* Заголовок */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-900">
                      Филиал {branch.code}
                    </h3>
                    {value === branch.id && (
                      <Check size={18} className="text-violet-600 flex-shrink-0" />
                    )}
                  </div>

                  {/* Информация */}
                  <div className="space-y-1.5 text-sm">
                    {/* Адрес */}
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0 text-violet-600" />
                      <span>
                        {branch.city}, {branch.district}, {branch.address}
                      </span>
                    </div>

                    {/* Режим работы */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} className="flex-shrink-0 text-violet-600" />
                      <span>
                        {branch.workDays.map(getDayName).join(', ')} •{' '}
                        {branch.openTime} - {branch.closeTime}
                      </span>
                    </div>

                    {/* Телефон */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={16} className="flex-shrink-0 text-violet-600" />
                      <span>{branch.phone}</span>
                    </div>

                    {/* Email */}
                    {branch.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={16} className="flex-shrink-0 text-violet-600" />
                        <span>{branch.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
