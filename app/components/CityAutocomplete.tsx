'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface City {
  id: number;
  name: string;
  region: string;
  lat: number;
  lon: number;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string, cityData?: City) => void;
  placeholder?: string;
  label: string;
  required?: boolean;
  className?: string;
}

export default function CityAutocomplete({
  value,
  onChange,
  placeholder = 'Введите название города',
  label,
  required = false,
  className = '',
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Поиск городов
  const searchCities = async (query: string) => {
    if (!query.trim()) {
      setCities([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/cities/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok && data.cities) {
        setCities(data.cities);
        setIsOpen(data.cities.length > 0);
      } else {
        setCities([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Ошибка поиска городов:', error);
      setCities([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Очищаем предыдущий таймаут
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Поиск с задержкой
    if (newValue.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchCities(newValue);
      }, 300);
    } else {
      setCities([]);
      setIsOpen(false);
    }
  };

  // Выбор города
  const handleCitySelect = (city: City) => {
    onChange(city.name, city);
    setIsOpen(false);
    setCities([]);
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
          onFocus={() => value && searchCities(value)}
          className="w-full px-3 py-2.5 pr-10 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm"
          placeholder={placeholder}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading ? (
            <Loader2 size={16} className="text-violet-400 animate-spin" />
          ) : (
            <MapPin size={16} className="text-gray-400" />
          )}
        </div>

        {/* Выпадающий список городов */}
        {isOpen && cities.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-[#1e2533] border border-gray-700/50 rounded-lg shadow-xl z-[100] max-h-60 overflow-y-auto"
          >
            {cities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => handleCitySelect(city)}
                className="w-full px-3 py-2.5 text-left hover:bg-[#2a3347] transition-colors border-b border-gray-700/30 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-violet-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {city.name}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {city.region}
                    </p>
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
