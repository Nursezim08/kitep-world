'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Toast from '@/app/components/Toast';
import { useTranslation } from '@/app/i18n/client';

function NewPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation('auth');
  const email = searchParams.get('email');
  const code = searchParams.get('code');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!email || !code) {
      router.push('/forgot-password');
    }
  }, [email, code, router]);

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

    // Проверка совпадения паролей
    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('resetPassword.new.passwordMismatch'));
      setToastType('error');
      setToastMessage(t('resetPassword.new.passwordMismatch'));
      setShowToast(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          newPassword: formData.newPassword,
        }),
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
      setToastMessage(t('resetPassword.new.passwordChanged'));
      setShowToast(true);
      
      setTimeout(() => {
        router.push('/profile');
        router.refresh();
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

  if (!email || !code) {
    return null;
  }

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
          <h1 className="text-xl font-extrabold text-black mb-0.5">{t('resetPassword.new.title')}</h1>
          <p className="text-gray-600 font-semibold text-xs">
            {t('resetPassword.new.subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-600 text-xs font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="newPassword" className="block text-xs font-bold text-black mb-1">
              {t('resetPassword.new.newPassword')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
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

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-black mb-1">
              {t('resetPassword.new.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition pr-10 font-semibold text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-500 transition"
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible size={18} />
                ) : (
                  <AiOutlineEye size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-600 font-semibold space-y-1 bg-violet-50 p-2.5 rounded-xl">
            <p className="font-bold text-black mb-1">{t('resetPassword.new.requirements.title')}</p>
            <p>• {t('resetPassword.new.requirements.minLength')}</p>
            <p>• {t('resetPassword.new.requirements.uppercase')}</p>
            <p>• {t('resetPassword.new.requirements.lowercase')}</p>
            <p>• {t('resetPassword.new.requirements.number')}</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white py-2 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {loading ? t('resetPassword.new.saving') : t('resetPassword.new.saveButton')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50">
        <div className="text-violet-600">Загрузка...</div>
      </div>
    }>
      <NewPasswordForm />
    </Suspense>
  );
}
