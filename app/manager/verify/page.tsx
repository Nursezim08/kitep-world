'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiMail } from 'react-icons/fi';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const branchId = searchParams.get('branchId');

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!userId || !branchId) {
      router.push('/manager/login');
    }
  }, [userId, branchId, router]);

  const errorMessages: Record<string, string> = {
    invalidCode: 'Неверный код подтверждения',
    codeExpired: 'Код подтверждения истек',
    notManager: 'У вас нет прав менеджера',
    noBranchAssigned: 'Вы не привязаны ни к одному филиалу',
    serverError: 'Ошибка сервера',
    connectionError: 'Ошибка соединения с сервером',
    'Access denied to this branch': 'Нет доступа к этому филиалу',
    'Branch not found': 'Филиал не найден',
    Unauthorized: 'Необходима авторизация',
    Forbidden: 'Доступ запрещен',
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
      const response = await fetch('/api/manager/verify-code', {
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

      // Успешная авторизация - переходим на дашборд
      router.push('/manager/dashboard');
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
      const response = await fetch('/api/manager/resend-code', {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 relative border border-gray-200">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiUser className="text-white" size={28} />
            </div>
            <span className="text-lg font-bold text-blue-600">
              Панель менеджера
            </span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Подтверждение входа</h1>
          <p className="text-gray-500 font-medium text-sm">Код отправлен на email</p>
        </div>

        {/* Email иконка */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FiMail className="text-white" size={36} />
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mb-6">
          Введите 6-значный код, который был отправлен на ваш email
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        {resendSuccess && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-600 text-sm font-medium">
              Код отправлен повторно
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-bold text-2xl text-center tracking-widest placeholder-gray-400"
              placeholder="000000"
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {loading ? 'Проверка...' : 'Подтвердить'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resending}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? 'Отправка...' : 'Отправить код повторно'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 font-medium">
          <Link
            href="/manager/login"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Вернуться к входу
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ManagerVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-gray-900">Загрузка...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
