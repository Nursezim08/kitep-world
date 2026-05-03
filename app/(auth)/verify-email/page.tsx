'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MdEmail } from 'react-icons/md';
import { useTranslation } from '@/app/i18n/client';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation('auth');
  const userId = searchParams.get('userId');
  const email = searchParams.get('email');

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!userId || !email) {
      router.push('/register');
    }
  }, [userId, email, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');

    // Автоматический переход к следующему полю
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Автоматическая отправка при заполнении всех полей
    if (index === 5 && value && newCode.every(digit => digit !== '')) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    
    setCode(newCode);
    
    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    } else if (pastedData.length > 0) {
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      setError(t('verifyEmail.enterFullCode'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          code: codeToVerify,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('errors.invalidCode'));
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      router.push('/profile');
      router.refresh();
    } catch (err) {
      setError(t('errors.connectionError'));
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('errors.serverError'));
        return;
      }

      setResendCooldown(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(t('errors.connectionError'));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50 px-4 py-12">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 relative">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src="/logonur.png" alt="logo" className="w-20 h-16"/>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-500 to-violet-600 bg-clip-text text-transparent">
              Nur-Kitep
            </span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center">
              <MdEmail className="text-violet-500 text-3xl" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-black mb-2">
            {t('verifyEmail.title')}
          </h1>
          <p className="text-gray-600 font-semibold">
            {t('verifyEmail.subtitle')}
          </p>
          <p className="text-violet-600 font-bold mt-1">{email}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
            <p className="text-red-600 text-sm font-semibold text-center">{error}</p>
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus={index === 0}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => handleSubmit()}
          disabled={loading || code.some(digit => digit === '')}
          className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-4"
        >
          {loading ? t('verifyEmail.verifying') : t('verifyEmail.verifyButton')}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600 font-semibold mb-2">
            {t('verifyEmail.didntReceive')}
          </p>
          <button
            onClick={handleResendCode}
            disabled={resendLoading || resendCooldown > 0}
            className="text-violet-500 hover:text-violet-600 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading
              ? t('verifyEmail.resending')
              : resendCooldown > 0
              ? t('verifyEmail.resendCooldown').replace('{seconds}', resendCooldown.toString())
              : t('verifyEmail.resendCode')}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t-2 border-gray-100">
          <p className="text-center text-sm text-gray-600 font-semibold">
            {t('verifyEmail.wrongEmail')}{' '}
            <Link
              href="/register"
              className="text-violet-500 hover:text-violet-600 font-bold"
            >
              {t('verifyEmail.backToRegister')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50">
        <div className="text-violet-600">Загрузка...</div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
