'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useGoogleMaps } from './GoogleMapsProvider';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string, placeData?: any) => void;
  placeholder: string;
  label: string;
  required?: boolean;
  types?: string[];
  componentRestrictions?: { country: string } | undefined;
  className?: string;
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder,
  label,
  required = false,
  types = ['geocode'],
  componentRestrictions,
  className = '',
}: GooglePlacesAutocompleteProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [isOpen, setIsOpen] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Инициализация Google Places API
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined' && window.google && window.google.maps) {
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        
        // Создаем скрытый div для PlacesService
        const mapDiv = document.createElement('div');
        const map = new window.google.maps.Map(mapDiv);
        placesService.current = new window.google.maps.places.PlacesService(map);
        
        console.log('Google Places API инициализирован успешно');
      } catch (error) {
        console.error('Ошибка инициализации Google Places API:', error);
      }
    }
  }, [isLoaded]);

  // Поиск предложений
  const searchPlaces = (query: string) => {
    if (!query.trim()) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    if (!autocompleteService.current) {
      console.warn('AutocompleteService не инициализирован');
      return;
    }

    setIsLoading(true);
    
    const request: google.maps.places.AutocompletionRequest = {
      input: query,
      types,
      ...(componentRestrictions && { componentRestrictions }),
    };

    console.log('Запрос к Google Places API:', request);

    autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
      setIsLoading(false);
      console.log('Ответ от Google Places API:', { status, predictions });
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        setPredictions(predictions);
        setIsOpen(true);
      } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        console.log('Результаты не найдены');
        setPredictions([]);
        setIsOpen(false);
      } else {
        console.error('Ошибка поиска:', status);
        setPredictions([]);
        setIsOpen(false);
      }
    });
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
        searchPlaces(newValue);
      }, 300);
    } else {
      setPredictions([]);
      setIsOpen(false);
    }
  };

  // Выбор места
  const handlePlaceSelect = (prediction: any) => {
    if (!placesService.current) return;

    const request = {
      placeId: prediction.place_id,
      fields: ['name', 'formatted_address', 'geometry', 'address_components'],
    };

    placesService.current.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        onChange(place.formatted_address || prediction.description, {
          placeId: prediction.place_id,
          geometry: place.geometry,
          addressComponents: place.address_components,
          name: place.name,
        });
        setIsOpen(false);
        setPredictions([]);
      }
    });
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
      
      {loadError && (
        <div className="mb-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-xs font-semibold mb-1">⚠️ Google Maps API не настроен</p>
          <p className="text-red-300 text-xs">
            Пожалуйста, настройте NEXT_PUBLIC_GOOGLE_MAPS_API_KEY в файле .env
          </p>
          <p className="text-red-300 text-xs mt-1">
            Инструкция: см. файл GOOGLE_MAPS_SETUP.md
          </p>
        </div>
      )}
      
      <div className="relative" ref={inputRef}>
        <input
          type="text"
          required={required}
          value={value}
          onChange={handleInputChange}
          onFocus={() => value && isLoaded && searchPlaces(value)}
          disabled={!isLoaded || !!loadError}
          className="w-full px-3 py-2.5 pr-10 bg-[#1e2533] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={loadError ? 'API не настроен' : isLoaded ? placeholder : 'Загрузка...'}
          title={loadError ? 'Настройте Google Maps API ключ в .env файле' : ''}
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          {!isLoaded && !loadError && (
            <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          <MapPin size={16} className={loadError ? 'text-red-400' : 'text-gray-400'} />
        </div>

        {/* Выпадающий список предложений */}
        {isOpen && predictions.length > 0 && (
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-[#1e2533] border border-gray-700/50 rounded-lg shadow-xl z-[100] max-h-60 overflow-y-auto"
          >
            {predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                type="button"
                onClick={() => handlePlaceSelect(prediction)}
                className="w-full px-3 py-2.5 text-left hover:bg-[#2a3347] transition-colors border-b border-gray-700/30 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-violet-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">
                      {prediction.structured_formatting?.main_text || prediction.description}
                    </p>
                    {prediction.structured_formatting?.secondary_text && (
                      <p className="text-gray-400 text-xs">
                        {prediction.structured_formatting.secondary_text}
                      </p>
                    )}
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