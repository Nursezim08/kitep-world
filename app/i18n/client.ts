'use client';

import { useState, useEffect } from 'react';
import { cookieName, fallbackLng, type Language } from './settings';

export function setLanguageCookie(lang: Language) {
  document.cookie = `${cookieName}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
}

export function getLanguageCookie(): Language | null {
  const cookies = document.cookie.split(';');
  const langCookie = cookies.find(c => c.trim().startsWith(`${cookieName}=`));
  
  if (langCookie) {
    return langCookie.split('=')[1].trim() as Language;
  }
  
  return null;
}

export function useTranslation(ns: string = 'landing') {
  const [translations, setTranslations] = useState<any>({});
  const [lang, setLang] = useState<Language>(fallbackLng);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    const currentLang = getLanguageCookie() || fallbackLng;
    setLang(currentLang);

    import(`./locales/${currentLang}/${ns}.json`)
      .then(module => setTranslations(module.default))
      .catch(() => {
        import(`./locales/${fallbackLng}/${ns}.json`)
          .then(module => setTranslations(module.default));
      });
  }, [ns, reloadTrigger]);

  // Слушаем изменения cookie
  useEffect(() => {
    const checkCookie = () => {
      const currentLang = getLanguageCookie() || fallbackLng;
      if (currentLang !== lang) {
        setReloadTrigger(prev => prev + 1);
      }
    };

    // Проверяем каждые 100ms (только когда компонент активен)
    const interval = setInterval(checkCookie, 100);
    return () => clearInterval(interval);
  }, [lang]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, lang };
}
