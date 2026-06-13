'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Проверяем, был ли баннер уже отклонен
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA установлено');
    }

    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 lg:left-auto lg:right-4 lg:bottom-4 z-50 max-w-md">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl shadow-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-violet-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1">
              Установите приложение
            </h3>
            <p className="text-sm text-violet-100 mb-3">
              Добавьте Nur-kitep на главный экран для быстрого доступа
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 bg-white text-violet-600 rounded-lg font-medium hover:bg-violet-50 transition-all"
              >
                Установить
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
