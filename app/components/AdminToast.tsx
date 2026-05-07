'use client';

import { useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface AdminToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function AdminToast({
  message,
  type = 'info',
  duration = 5000,
  onClose,
}: AdminToastProps) {
  const onCloseRef = useRef(onClose);
  const isMountedRef = useRef(true);
  
  // Обновляем ref при изменении onClose
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          onCloseRef.current();
        }
      }, duration);

      return () => {
        isMountedRef.current = false;
        clearTimeout(timer);
      };
    }
  }, [duration]); // Убрали onClose из зависимостей

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500 text-green-400';
      case 'error':
        return 'bg-red-500/10 border-red-500 text-red-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500 text-yellow-400';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500 text-blue-400';
    }
  };

  return (
    <div
      className={`min-w-[320px] max-w-md animate-slide-in-right`}
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm shadow-2xl ${getStyles()}`}
      >
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
