'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import LoginButton from './LoginButton';
import { type Language } from '../i18n/settings';

interface LandingHeaderProps {
  t: {
    header: {
      logo: string;
      nav: {
        catalog: string;
        about: string;
        branches: string;
        contacts: string;
      };
      login: string;
    };
  };
  initialLang: Language;
}

export default function LandingHeader({ t, initialLang }: LandingHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-2 left-0 right-0 z-50 mx-4 md:mx-8">
      <div className="bg-white/95 backdrop-blur-lg border border-gray-200 shadow-lg rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 flex items-center justify-center">
                <img
                  src="/logonur.png"
                  alt="logo"
                  className="w-16 h-12"
                />
              </div>
              <span className="text-xl md:text-xl font-bold bg-gradient-to-r from-violet-500 to-violet-600 bg-clip-text text-transparent">
                {t.header.logo}
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-black hover:text-violet-500 font-semibold transition-colors">{t.header.nav.catalog}</a>
              <a href="#" className="text-black hover:text-violet-500 font-semibold transition-colors">{t.header.nav.about}</a>
              <a href="#" className="text-black hover:text-violet-500 font-semibold transition-colors">{t.header.nav.branches}</a>
              <a href="#" className="text-black hover:text-violet-500 font-semibold transition-colors">{t.header.nav.contacts}</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher initialLang={initialLang} />
              <LoginButton text={t.header.login} />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors md:hidden"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-black" />
                ) : (
                  <Menu className="w-6 h-6 text-black" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col gap-4">
                <a
                  href="#"
                  className="text-black hover:text-violet-500 font-semibold transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.header.nav.catalog}
                </a>
                <a
                  href="#"
                  className="text-black hover:text-violet-500 font-semibold transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.header.nav.about}
                </a>
                <a
                  href="#"
                  className="text-black hover:text-violet-500 font-semibold transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.header.nav.branches}
                </a>
                <a
                  href="#"
                  className="text-black hover:text-violet-500 font-semibold transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.header.nav.contacts}
                </a>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
