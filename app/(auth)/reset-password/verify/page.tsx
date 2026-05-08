'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdminToast, { ToastType } from '@/app/components/AdminToast';
import { useTranslation } from '@/app/i18n/client';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

function VerifyResetCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation('auth');
  const email = searchParams.get('email');
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!email) {
      router.push('/forgot-password');
    } else {
      // Показываем уведомление о том, что код отправлен
      showToast(t('resetPassword.verify.codeSent') || 'Код подтверждения отправлен на ваш email', 'info');
    }
  }, [email, router]);

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

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Автоматический переход к следующему полю
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(newCode);

    // Фокус на последнем заполненном поле
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    const lastInput = document.getElementById(`code-${lastFilledIndex}`);
    lastInput?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Введите полный код');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('errors.invalidCode'));
        showToast(data.error || t('errors.invalidCode'), 'error');
        return;
      }

      showToast(t('resetPassword.verify.codeConfirmed') || 'Код подтвержден', 'success');
      
      setTimeout(() => {
        router.push(`/reset-password/new?email=${encodeURIComponent(email!)}&code=${fullCode}`);
      }, 1500);
    } catch (err) {
      setError(t('errors.connectionError'));
      showToast(t('errors.connectionError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50 px-4 py-4">
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
          <h1 className="text-xl font-extrabold text-black mb-0.5">{t('resetPassword.verify.title')}</h1>
          <p className="text-gray-600 font-semibold text-xs">
            {t('resetPassword.verify.subtitle')} {email}
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-600 text-xs font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || code.join('').length !== 6}
            className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white py-2 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {loading ? t('resetPassword.verify.verifying') : t('resetPassword.verify.verifyButton')}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-600 font-semibold">
          {t('resetPassword.verify.didntReceive')}{' '}
          <Link
            href="/forgot-password"
            className="text-violet-500 hover:text-violet-600 font-bold"
          >
            {t('resetPassword.verify.sendAgain')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyResetCodePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50">
        <div className="text-violet-600">Загрузка...</div>
      </div>
    }>
      <VerifyResetCodeForm />
    </Suspense>
  );
}
