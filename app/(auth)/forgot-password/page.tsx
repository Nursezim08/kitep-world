'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/app/components/Toast';
import { useTranslation } from '@/app/i18n/client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('errors.serverError'));
        setToastType('error');
        setToastMessage(data.error || t('errors.serverError'));
        setShowToast(true);
        return;
      }

      setToastType('success');
      setToastMessage(t('forgotPassword.codeSent'));
      setShowToast(true);
      
      setTimeout(() => {
        router.push(`/reset-password/verify?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err) {
      setError(t('errors.connectionError'));
      setToastType('error');
      setToastMessage(t('errors.connectionError'));
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50 px-4 py-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={3000}
          onClose={() => setShowToast(false)}
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
          <h1 className="text-xl font-extrabold text-black mb-0.5">{t('forgotPassword.title')}</h1>
          <p className="text-gray-600 font-semibold text-xs">
            {t('forgotPassword.subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-600 text-xs font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-black mb-1">
              {t('forgotPassword.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              required
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition font-semibold text-sm"
              placeholder="example@mail.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white py-2 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {loading ? t('forgotPassword.sending') : t('forgotPassword.sendButton')}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-600 font-semibold">
          {t('forgotPassword.rememberPassword')}{' '}
          <Link href="/login" className="text-violet-500 hover:text-violet-600 font-bold">
            {t('forgotPassword.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
