'use client';

import { useEffect, useState, useRef } from 'react';
import { FcGoogle } from 'react-icons/fc';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error' | 'google';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(Date.now());
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (isPaused) return;

    const currentStartTime = Date.now() - elapsedRef.current;
    
    const interval = setInterval(() => {
      const totalElapsed = Date.now() - currentStartTime;
      elapsedRef.current = totalElapsed;
      const remaining = Math.max(0, 100 - (totalElapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        setIsVisible(false);
        setTimeout(onClose, 300); // Ждем окончания анимации
      }
    }, 10);

    return () => clearInterval(interval);
  }, [isPaused, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800';
      case 'error':
        return 'bg-red-50 text-red-800';
      case 'google':
        return 'bg-violet-50 text-violet-900';
      default:
        return 'bg-blue-50 text-blue-800';
    }
  };

  const getIcon = () => {
    if (type === 'google') {
      return (
        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
          <FcGoogle size={24} />
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={`
          ${getTypeStyles()}
          rounded-2xl shadow-lg hover:shadow-xl p-4 pr-6
          min-w-[320px] max-w-md
          backdrop-blur-sm
          relative overflow-hidden
          transition-shadow duration-200
        `}
      >
        {/* Прогресс-бар */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 pt-1">
            <p className="font-semibold text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
