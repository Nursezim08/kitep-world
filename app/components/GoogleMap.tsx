'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  onLocationSelect?: (location: { lat: number; lng: number; address?: string }) => void;
  marker?: { lat: number; lng: number };
  className?: string;
}

export default function GoogleMap({
  center = { lat: 42.8746, lng: 74.5698 }, // Бишкек по умолчанию
  zoom = 13,
  onLocationSelect,
  marker,
  className = '',
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Инициализация карты
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Создаем карту
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry.fill',
          stylers: [{ color: '#1e2533' }],
        },
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#ffffff' }],
        },
        {
          featureType: 'all',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#1e2533' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#2a3347' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#0f172a' }],
        },
      ],
    });

    mapInstanceRef.current = map;
    geocoderRef.current = new window.google.maps.Geocoder();

    // Обработчик клика по карте
    if (onLocationSelect) {
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          // Обновляем маркер
          updateMarker({ lat, lng });
          
          // Получаем адрес по координатам
          if (geocoderRef.current) {
            geocoderRef.current.geocode(
              { location: { lat, lng } },
              (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  onLocationSelect({
                    lat,
                    lng,
                    address: results[0].formatted_address,
                  });
                } else {
                  onLocationSelect({ lat, lng });
                }
              }
            );
          } else {
            onLocationSelect({ lat, lng });
          }
        }
      });
    }

    setIsLoaded(true);
  }, [center.lat, center.lng, zoom, onLocationSelect]);

  // Функция обновления маркера
  const updateMarker = (position: { lat: number; lng: number }) => {
    if (!mapInstanceRef.current) return;

    // Удаляем старый маркер
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Создаем новый маркер
    markerRef.current = new window.google.maps.Marker({
      position,
      map: mapInstanceRef.current,
      title: 'Выбранное местоположение',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#8b5cf6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });
  };

  // Обновление маркера при изменении пропса
  useEffect(() => {
    if (marker && mapInstanceRef.current) {
      updateMarker(marker);
      mapInstanceRef.current.setCenter(marker);
    }
  }, [marker]);

  // Центрирование карты
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
    }
  }, [center.lat, center.lng]);

  if (!window.google) {
    return (
      <div className={`bg-[#1e2533] border border-gray-700/50 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <MapPin className="mx-auto mb-2 text-gray-600" size={32} />
          <p className="text-gray-400 text-sm">Загрузка Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg overflow-hidden border border-gray-700/50"
      />
      {onLocationSelect && (
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          Нажмите на карту для выбора местоположения
        </div>
      )}
    </div>
  );
}