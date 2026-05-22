'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Bell,
  LogOut,
  Settings,
  Globe,
} from 'lucide-react';
import { setLanguageCookie, getLanguageCookie, useTranslation } from '@/app/i18n/client';
import { languages, type Language } from '@/app/i18n/settings';

interface UserHeaderUser {
  fullName: string;
  email: string;
  avatar?: string | null;
}

interface UserHeaderProps {
  user: UserHeaderUser;
  cartCount?: number;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
}

export default function UserHeader({
  user,
  cartCount: cartCountProp,
  searchQuery: searchQueryProp,
  onSearchChange,
  onSearchSubmit,
}: UserHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation('user');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('ru');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalCartCount, setInternalCartCount] = useState(0);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const isSearchControlled = onSearchChange !== undefined;
  const searchQuery = isSearchControlled ? (searchQueryProp ?? '') : internalSearchQuery;
  const cartCount = cartCountProp !== undefined ? cartCountProp : internalCartCount;

  useEffect(() => {
    if (cartCountProp === undefined) {
      fetch('/api/user/cart')
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data) setInternalCartCount(data.cartItems?.length ?? 0);
        })
        .catch(() => {});
    }
  }, [cartCountProp]);

  useEffect(() => {
    setCurrentLang(getLanguageCookie() || 'ru');
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguageCookie(lang);
    setCurrentLang(lang);
    setLangDropdownOpen(false);
    window.location.reload();
  };

  const languageLabels: Record<Language, string> = {
    ru: 'RU',
    kg: 'KG',
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearchChange = (value: string) => {
    if (isSearchControlled) {
      onSearchChange!(value);
    } else {
      setInternalSearchQuery(value);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(e);
    } else if (internalSearchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(internalSearchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="px-8 py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 w-72">
            <img
              src="/logonur.png"
              alt="Nur-Kitep Logo"
              className="w-9 h-9 rounded-xl object-cover"
            />
            <div>
              <h1 className="text-base font-bold text-gray-900">Nur-Kitep</h1>
              <p className="text-[10px] text-gray-500">Книги и канцелярия</p>
            </div>
          </div>

          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-4 flex-1 max-w-xl mx-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('header.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-sm text-gray-900 placeholder-gray-400"
              />
            </div>
          </form>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div ref={langDropdownRef} className="relative">
              <button
                onClick={() => setLangDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 hover:text-gray-900 border border-gray-200"
              >
                <Globe size={15} />
                <span className="text-xs font-bold">{languageLabels[currentLang]}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                        currentLang === lang
                          ? 'text-violet-600 bg-violet-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {lang === 'ru' ? '🇷🇺 Русский' : '🇰🇬 Кыргызча'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="relative p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 hover:text-gray-900">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full" />
            </button>

            <a
              href="/cart"
              className="relative p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 hover:text-gray-900 inline-flex items-center justify-center"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>

            {/* Profile Dropdown */}
            <div ref={profileDropdownRef} className="relative">
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 hover:bg-gray-50 rounded-xl transition-colors px-2.5 py-1.5"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                  <p className="text-[10px] text-gray-500">{user.email}</p>
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <a
                    href="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={16} className="text-gray-500" />
                    <span>{t('header.settings')}</span>
                  </a>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>{t('header.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
