'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface Address {
  id: number;
  address: string;
  fullAddress: string;
  lat: number;
  lon: number;
  type: string;
  addressType: string;
  city: string;
  district: string;
  street: string;
  houseNumber: string;
  building: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, addressData?: Address) => void;
  placeholder?: string;
  label: string;
  required?: boolean;
  className?: string;
  city?: string;
  district?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Введите адрес (улица, номер дома)',
  label,
  required = false,
  className = '',
  city,
  district,
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Поиск адресов
  const searchAddresses = async (query: string) => {
    if (!query.trim() || query.trim().length < 3) {
      setAddresses([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('q', query);
      if (city) params.append('city', city);
      if (district) params.append('district', district);

      const response = await fetch(`/api/addresses/search?${params.toString()}`);
      const data = await response.json();

      if (response.ok && data.addresses) {
        setAddresses(data.addresses);
        setIsOpen(data.addresses.length > 0);
      } else {
        setAddresses([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Ошибка поиска адресов:', error);
      setAddresses([]);
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
    if (newValue.trim().length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        searchAddresses(newValue);
      }, 500);
    } else {
      setAddresses([]);
      setIsOpen(false);
    }
  };

  // Выбор адреса
  const handleAddressSelect = (address: Address) => {
    onChange(address.address, address);
    setIsOpen(false);
    setAddresses([]);
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
          onFocus={() => value && value.length >= 3 && searchAddresses(value)}
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

        {/* Выпадающий список адресов */}
        {isOpen && addresses.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-[#1e2533] border border-gray-700/50 rounded-lg shadow-xl z-[100] max-h-60 overflow-y-auto"
          >
            {addresses.map((address) => (
              <button
                key={address.id}
                type="button"
                onClick={() => handleAddressSelect(address)}
                className="w-full px-3 py-2.5 text-left hover:bg-[#2a3347] transition-colors border-b border-gray-700/30 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-violet-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">
                      {address.address}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-gray-400 text-xs truncate">
                        {address.city}
                        {address.district && `, ${address.district}`}
                      </p>
                      {(address.houseNumber || address.building) && (
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex-shrink-0">
                          {address.houseNumber && `№${address.houseNumber}`}
                          {address.building && ` корп.${address.building}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Подсказка о минимальной длине */}
        {value.length > 0 && value.length < 3 && (
          <p className="text-xs text-gray-500 mt-1">
            Введите минимум 3 символа для поиска
          </p>
        )}
      </div>
    </div>
  );
}
