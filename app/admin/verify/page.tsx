'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiShield } from 'react-icons/fi';
import { FaTelegram } from 'react-icons/fa';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!userId) {
      router.push('/admin/login');
    }
  }, [userId, router]);

  const errorMessages: Record<string, string> = {
    invalidCode: 'Неверный код подтверждения',
    codeExpired: 'Код подтверждения истек',
    serverError: 'Ошибка сервера',
    connectionError: 'Ошибка соединения с сервером',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setError('');
    setResendSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('Код должен содержать 6 цифр');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(errorMessages[data.error] || data.error || 'Ошибка при проверке кода');
        return;
      }

      // Успешная авторизация - переходим в админ-панель
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError(errorMessages.connectionError);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError('');
    setResendSuccess(false);

    try {
      const response = await fetch('/api/admin/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(errorMessages[data.error] || data.error || 'Ошибка при отправке кода');
        return;
      }

      setResendSuccess(true);
      setCode('');
    } catch (err) {
      setError(errorMessages.connectionError);
    } finally {
      setResending(false);
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
          <h1 className="text-xl font-extrabold text-white mb-0.5">Подтверждение входа</h1>
          <p className="text-slate-400 font-semibold text-xs">Код отправлен в Telegram</p>
        </div>

        {/* Telegram иконка */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FaTelegram className="text-white" size={32} />
          </div>
        </div>

        <p className="text-center text-slate-300 text-sm mb-4">
          Введите 6-значный код, который был отправлен в ваш Telegram
        </p>

        {error && (
          <div className="mb-3 p-2.5 bg-red-900/30 border-2 border-red-500/50 rounded-xl">
            <p className="text-red-400 text-xs font-semibold">
              {error}
            </p>
          </div>
        )}

        {resendSuccess && (
          <div className="mb-3 p-2.5 bg-violet-900/30 border-2 border-violet-500/50 rounded-xl">
            <p className="text-violet-400 text-xs font-semibold">
              Код отправлен повторно
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="code"
              className="block text-xs font-bold text-slate-300 mb-1"
            >
              Код подтверждения
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={code}
              onChange={handleChange}
              required
              maxLength={6}
              className="w-full px-3 py-2 bg-slate-700 border-2 border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition font-bold text-2xl text-center tracking-widest placeholder-slate-500"
              placeholder="000000"
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white py-2 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {loading ? 'Проверка...' : 'Подтвердить'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resending}
            className="text-violet-400 hover:text-violet-300 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? 'Отправка...' : 'Отправить код повторно'}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400 font-semibold">
          <Link
            href="/admin/login"
            className="text-violet-400 hover:text-violet-300 font-bold"
          >
            ← Вернуться к входу
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white">Загрузка...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
