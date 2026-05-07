'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface District {
  id: number;
  name: string;
  region: string;
}

interface DistrictAutocompleteProps {
  value: string;
  onChange: (value: string, districtData?: District) => void;
  placeholder?: string;
  label: string;
  required?: boolean;
  className?: string;
  city?: string; // Город для фильтрации районов
}

export default function DistrictAutocomplete({
  value,
  onChange,
  placeholder = 'Введите название района',
  label,
  required = false,
  className = '',
  city,
}: DistrictAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Поиск районов
  const searchDistricts = async (query: string, shouldOpen: boolean = true) => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (query.trim()) params.append('q', query);

      const response = await fetch(`/api/districts/search?${params.toString()}`);
      const data = await response.json();

      if (response.ok && data.districts) {
        setDistricts(data.districts);
        // Открываем список только если shouldOpen = true
        if (shouldOpen) {
          setIsOpen(data.districts.length > 0);
        }
      } else {
        setDistricts([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Ошибка поиска районов:', error);
      setDistricts([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка районов при изменении города (без автоматического открытия)
  useEffect(() => {
    if (city) {
      // Загружаем районы, но не открываем список автоматически (shouldOpen = false)
      searchDistricts('', false);
    } else {
      setDistricts([]);
      setIsOpen(false);
    }
  }, [city]);

  // Обработка ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Очищаем предыдущий таймаут
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Поиск с задержкой
    if (city) {
      searchTimeoutRef.current = setTimeout(() => {
        searchDistricts(newValue);
      }, 300);
    }
  };

  // Выбор района
  const handleDistrictSelect = (district: District) => {
    onChange(district.name, district);
    setIsOpen(false);
  };

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
        {label} {required && '*'}
      </label>

      <div className="relative" ref={inputRef}>
        <input
          type="text"
          required={required}
          value={value}
          onChange={handleInputChange}
          onFocus={() => city && searchDistricts(value)}
          disabled={!city}
          className="w-full px-3 py-2.5 pr-10 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={city ? placeholder : 'Сначала выберите город'}
          title={!city ? 'Сначала выберите город' : ''}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading ? (
            <Loader2 size={16} className="text-violet-400 animate-spin" />
          ) : (
            <MapPin size={16} className={!city ? 'text-gray-600' : 'text-gray-400'} />
          )}
        </div>

        {/* Выпадающий список районов */}
        {isOpen && districts.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-[#1e2533] border border-gray-700/50 rounded-lg shadow-xl z-[100] max-h-60 overflow-y-auto"
          >
            {districts.map((district) => (
              <button
                key={district.id}
                type="button"
                onClick={() => handleDistrictSelect(district)}
                className="w-full px-3 py-2.5 text-left hover:bg-[#2a3347] transition-colors border-b border-gray-700/30 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-violet-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{district.name}</p>
                    <p className="text-gray-400 text-xs truncate">{district.region}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
