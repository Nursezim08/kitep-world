'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: string | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: null,
});

export const useGoogleMaps = () => useContext(GoogleMapsContext);

interface GoogleMapsProviderProps {
  children: React.ReactNode;
  apiKey: string;
}

export default function GoogleMapsProvider({ children, apiKey }: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Проверяем, не загружен ли уже Google Maps
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Проверяем наличие API ключа
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setLoadError('Google Maps API ключ не настроен. Проверьте файл .env');
      return;
    }

    // Создаем скрипт для загрузки Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ru&region=KG`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      setLoadError('Ошибка загрузки Google Maps API');
    };

    document.head.appendChild(script);

    return () => {
      // Очистка при размонтировании
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [apiKey]);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

// Типы для Google Maps API
declare global {
  interface Window {
    google: typeof google;
  }
}