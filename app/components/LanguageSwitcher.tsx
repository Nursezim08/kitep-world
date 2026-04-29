'use client';

import { Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { setLanguageCookie, getLanguageCookie } from '../i18n/client';
import { languages, type Language } from '../i18n/settings';

interface LanguageSwitcherProps {
  initialLang: Language;
}

export default function LanguageSwitcher({ initialLang }: LanguageSwitcherProps) {
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const cookieLang = getLanguageCookie();
    if (cookieLang && cookieLang !== currentLang) {
      setCurrentLang(cookieLang);
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguageCookie(lang);
    setCurrentLang(lang);
    setIsOpen(false);
    window.location.reload();
  };

  const languageLabels: Record<Language, string> = {
    ru: 'RU',
    kg: 'KG',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-black hover:bg-gray-100 rounded-xl transition-all"
      >
        <Globe className="w-4 h-4" />
        <span>{languageLabels[currentLang]}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full px-4 py-2.5 text-left text-sm font-bold transition-colors ${
                  currentLang === lang
                    ? 'bg-violet-50 text-violet-600'
                    : 'text-black hover:bg-gray-50'
                }`}
              >
                {languageLabels[lang]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
