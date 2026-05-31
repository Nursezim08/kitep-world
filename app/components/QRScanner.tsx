'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
  active?: boolean;
}

interface Html5QrcodeInstance {
  start: (
    cameraConfig: { facingMode: string } | string,
    config: unknown,
    onSuccess: (decodedText: string) => void,
    onError: (errorMessage: string) => void
  ) => Promise<void>;
  stop: () => Promise<void>;
  clear: () => Promise<void>;
  getState?: () => number;
}

// Stable, unique element id per component instance.
let nextScannerId = 0;
const generateId = () => `qr-scanner-el-${++nextScannerId}`;

export default function QRScanner({ onScan, onError, active = true }: QRScannerProps) {
  const [elementId] = useState<string>(() => generateId());

  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);

  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    onScanRef.current = onScan;
    onErrorRef.current = onError;
  }, [onScan, onError]);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let html5Qr: Html5QrcodeInstance | null = null;

    const start = async () => {
      try {
        setStarting(true);
        setError(null);

        // Verify the placeholder div is mounted.
        if (typeof document === 'undefined' || !document.getElementById(elementId)) {
          // Wait one tick for the DOM node to mount.
          await new Promise((r) => requestAnimationFrame(() => r(null)));
        }

        if (cancelled) return;

        const mod = await import('html5-qrcode');
        const Html5Qrcode = mod.Html5Qrcode;

        if (cancelled) return;

        if (!document.getElementById(elementId)) {
          throw new Error('Контейнер сканера не найден');
        }

        html5Qr = new Html5Qrcode(elementId, { verbose: false }) as unknown as Html5QrcodeInstance;
        scannerRef.current = html5Qr;

        const config = {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        };

        await html5Qr.start(
          { facingMode: 'environment' },
          config,
          (decodedText: string) => {
            if (onScanRef.current) onScanRef.current(decodedText);
          },
          () => {
            // Frame errors are noisy and expected; ignore.
          }
        );

        if (cancelled) {
          try { await html5Qr.stop(); } catch { /* noop */ }
          try { await html5Qr.clear(); } catch { /* noop */ }
          return;
        }

        setRunning(true);
      } catch (e: unknown) {
        const message =
          e instanceof Error
            ? e.message
            : 'Не удалось получить доступ к камере. Разрешите доступ в настройках браузера.';
        console.error('[QRScanner] start error:', e);
        setError(message);
        if (onErrorRef.current) onErrorRef.current(message);
      } finally {
        setStarting(false);
      }
    };

    start();

    return () => {
      cancelled = true;
      const instance = scannerRef.current;
      scannerRef.current = null;
      if (instance) {
        (async () => {
          try {
            if (typeof instance.getState === 'function') {
              const state = instance.getState();
              if (state === 2) {
                await instance.stop();
              }
            } else {
              await instance.stop();
            }
          } catch { /* noop */ }
          try { await instance.clear(); } catch { /* noop */ }
        })();
      }
      setRunning(false);
    };
  }, [active, elementId]);

  return (
    <div className="w-full">
      <div className="relative w-full aspect-square bg-gray-900 rounded-xl overflow-hidden">
        {/* This div must always be in the DOM for html5-qrcode to attach to. */}
        <div id={elementId} className="w-full h-full" />

        {(starting || !running) && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-white gap-2 pointer-events-none">
            <Camera size={28} className="animate-pulse" />
            <p className="text-xs">Запуск камеры...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-white gap-2 p-4 text-center">
            <CameraOff size={28} />
            <p className="text-xs font-semibold">Ошибка камеры</p>
            <p className="text-[11px] text-gray-300 break-words">{error}</p>
          </div>
        )}

        {running && !error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 border-2 border-white/60 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
          </div>
        )}
      </div>

      {!error && (
        <p className="mt-2 text-[11px] text-gray-500 flex items-center gap-1.5">
          <AlertCircle size={12} />
          Наведите камеру на QR-код заказа клиента
        </p>
      )}
    </div>
  );
}
