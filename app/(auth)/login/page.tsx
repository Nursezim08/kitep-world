'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Toast from '@/app/components/Toast';
import { useTranslation } from '@/app/i18n/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation('auth');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleToast, setShowGoogleToast] = useState(false);

  const urlError = searchParams.get('error');
  const errorMessages: Record<string, string> = {
    google_auth_failed: t('errors.serverError'),
    no_code: t('errors.serverError'),
    config_error: t('errors.serverError'),
    token_exchange_failed: t('errors.serverError'),
    user_info_failed: t('errors.serverError'),
    account_blocked: t('errors.accountBlocked'),
    account_inactive: t('errors.accountInactive'),
    server_error: t('errors.serverError'),
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setShowGoogleToast(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowGoogleToast(false);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.useGoogleAuth) {
          setShowGoogleToast(true);
          setError('');
        } else {
          setError(data.error || t('errors.invalidCredentials'));
        }
        return;
      }

      router.push('/profile');
      router.refresh();
    } catch (err) {
      setError(t('errors.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50 px-4 py-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {showGoogleToast && (
        <Toast
          message={t('login.googleToast')}
          type="google"
          duration={5000}
          onClose={() => setShowGoogleToast(false)}
        />
      )}

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-5 relative">
        <div className="flex justify-center mb-3">
          <Link href="/" className="flex flex-col items-center gap-0.5">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logonur.png" alt="logo" className="w-14 h-10"/>
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-violet-500 to-violet-600 bg-clip-text text-transparent">
              Nur-Kitep
            </span>
          </Link>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-xl font-extrabold text-black mb-0.5">{t('login.title')}</h1>
          <p className="text-gray-600 font-semibold text-xs">{t('login.subtitle')}</p>
        </div>

        {(error || urlError) && (
          <div className="mb-3 p-2.5 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-600 text-xs font-semibold">
              {error || errorMessages[urlError!] || t('errors.serverError')}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-black mb-1">
              {t('login.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition font-semibold text-sm"
              placeholder="example@mail.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-xs font-bold text-black">
                {t('login.password')}
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-violet-500 hover:text-violet-600 font-bold"
              >
                {t('login.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition pr-10 font-semibold text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-500 transition"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={18} />
                ) : (
                  <AiOutlineEye size={18} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white py-2 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {loading ? t('login.loggingIn') : t('login.loginButton')}
          </button>
        </form>

        <div className="mt-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-500 font-semibold">{t('login.or')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-black py-2 rounded-xl font-bold hover:border-violet-500 hover:shadow-lg transition-all text-sm"
          >
            <FcGoogle size={20} />
            {t('login.googleButton')}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-600 font-semibold">
          {t('login.noAccount')}{' '}
          <Link href="/register" className="text-violet-500 hover:text-violet-600 font-bold">
            {t('login.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50">
        <div className="text-violet-600">Загрузка...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
