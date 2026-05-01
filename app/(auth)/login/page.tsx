'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Toast from '@/app/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    google_auth_failed: 'Ошибка авторизации через Google',
    no_code: 'Не получен код авторизации',
    config_error: 'Ошибка конфигурации Google OAuth',
    token_exchange_failed: 'Не удалось обменять код на токен',
    user_info_failed: 'Не удалось получить информацию о пользователе',
    account_blocked: 'Ваш аккаунт заблокирован',
    account_inactive: 'Ваш аккаунт неактивен',
    server_error: 'Ошибка сервера',
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
        // Проверка на Google аккаунт
        if (data.useGoogleAuth) {
          setShowGoogleToast(true);
          setError('');
        } else {
          setError(data.error || 'Ошибка при входе');
        }
        return;
      }

      router.push('/profile');
      router.refresh();
    } catch (err) {
      setError('Ошибка соединения с сервером');
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
      
      {/* Toast уведомление для Google аккаунтов */}
      {showGoogleToast && (
        <Toast
          message="Этот аккаунт зарегистрирован через Google. Используйте кнопку 'Войти через Google' ниже."
          type="google"
          duration={5000}
          onClose={() => setShowGoogleToast(false)}
        />
      )}

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-5 relative">
        {/* Logo */}
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
          <h1 className="text-xl font-extrabold text-black mb-0.5">Вход</h1>
          <p className="text-gray-600 font-semibold text-xs">Войдите в свой аккаунт</p>
        </div>

        {(error || urlError) && (
          <div className="mb-3 p-2.5 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-600 text-xs font-semibold">
              {error || errorMessages[urlError!] || 'Произошла ошибка'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-black mb-1"
            >
              Email
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
            <label
              htmlFor="password"
              className="block text-xs font-bold text-black mb-1"
            >
              Пароль
            </label>
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
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-500 font-semibold">или</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-black py-2 rounded-xl font-bold hover:border-violet-500 hover:shadow-lg transition-all text-sm"
          >
            <FcGoogle size={20} />
            Войти через Google
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-600 font-semibold">
          Нет аккаунта?{' '}
          <Link
            href="/register"
            className="text-violet-500 hover:text-violet-600 font-bold"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
