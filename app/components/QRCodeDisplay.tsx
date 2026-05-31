'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRCodeDisplay({ value, size = 220, className = '' }: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!value) {
      setDataUrl('');
      return;
    }
    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: { dark: '#1f2937', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('QR generation error:', err);
        if (!cancelled) setError('Не удалось сгенерировать QR-код');
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {error ? (
        <div className="text-red-600 text-xs text-center">{error}</div>
      ) : dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          alt="QR код заказа"
          width={size}
          height={size}
          className="rounded-lg"
        />
      ) : (
        <div
          className="bg-gray-100 rounded-lg animate-pulse"
          style={{ width: size, height: size }}
        />
      )}
    </div>
  );
}
