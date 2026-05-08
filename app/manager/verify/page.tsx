'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiUser } from 'react-icons/fi';
import AdminToast, { ToastType } from '@/app/components/AdminToast';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const branchId = searchParams.get('branchId');

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!userId || !branchId) {
      router.push('/manager/login');
    } else {
      // Показываем уведомление о том, что код отправлен
      showToast('Код подтверждения отправлен на ваш email', 'info');
    }
  }, [userId, branchId, router]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const newToast: Toast = {
      id: Date.now(),
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

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
        showToast(errorMessages[data.error] || data.error || 'Ошибка при отправке кода', 'error');
        return;
      }

      showToast('Код отправлен повторно на ваш email', 'success');
      setCode('');
    } catch (err) {
      showToast(errorMessages.connectionError, 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              transform: `translateY(${index * 80}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <AdminToast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
      
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
          <p className="text-gray-500 font-medium text-sm">Введите код из email</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm font-medium">
              {error}
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
