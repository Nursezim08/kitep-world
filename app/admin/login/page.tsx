'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FiShield } from 'react-icons/fi';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const errorMessages: Record<string, string> = {
    invalidCredentials: 'Неверный email или пароль',
    notAdmin: 'У вас нет прав администратора',
    accountBlocked: 'Ваш аккаунт заблокирован',
    accountInactive: 'Ваш аккаунт неактивен',
    telegramNotConfigured: 'Telegram не настроен для этого аккаунта',
    codeNotSent: 'Не удалось отправить код в Telegram',
    serverError: 'Ошибка сервера',
    connectionError: 'Ошибка соединения с сервером',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(errorMessages[data.error] || data.error || 'Ошибка при входе');
        return;
      }

      // Переходим на страницу ввода кода
      router.push(`/admin/verify?userId=${data.userId}`);
    } catch (err) {
      setError(errorMessages.connectionError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-5 relative border border-slate-700">
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiShield className="text-white" size={24} />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-violet-400 to-violet-500 bg-clip-text text-transparent">
              Admin Panel
            </span>
          </div>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-xl font-extrabold text-white mb-0.5">Вход в админ-панель</h1>
          <p className="text-slate-400 font-semibold text-xs">Введите учетные данные администратора</p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-900/30 border-2 border-red-500/50 rounded-xl">
            <p className="text-red-400 text-xs font-semibold">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-slate-300 mb-1"
            >
              Email администратора
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-slate-700 border-2 border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition font-semibold text-sm placeholder-slate-500"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-slate-300 mb-1"
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
                className="w-full px-3 py-2 bg-slate-700 border-2 border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition pr-10 font-semibold text-sm placeholder-slate-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-400 transition"
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

        <p className="mt-4 text-center text-xs text-slate-400 font-semibold">
          <Link
            href="/"
            className="text-violet-400 hover:text-violet-300 font-bold"
          >
            ← Вернуться на сайт
          </Link>
        </p>
      </div>
    </div>
  );
}
