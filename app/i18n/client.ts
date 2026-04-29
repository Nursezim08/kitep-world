'use client';

import { cookieName, type Language } from './settings';

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
