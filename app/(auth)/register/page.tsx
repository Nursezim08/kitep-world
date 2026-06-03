'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Toast from '@/app/components/Toast';
import EmailInput from '@/app/components/EmailInput';
import PhoneInput from '@/app/components/PhoneInput';
import { useTranslation } from '@/app/i18n/client';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleToast, setShowGoogleToast] = useState(false);

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

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.useGoogleAuth) {
          setShowGoogleToast(true);
          setError('');
        } else {
          setError(data.error || t('errors.serverError'));
        }
        return;
      }

      if (data.requiresVerification) {
        router.push(`/verify-email?userId=${data.userId}&email=${encodeURIComponent(data.email)}`);
      } else {
        router.push('/profile');
      }
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
          message={t('register.googleToast')}
          type="google"
          duration={5000}
          onClose={() => setShowGoogleToast(false)}
        />
      )}
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-4 relative">
        <div className="flex justify-center mb-2">
          <Link href="/" className="flex flex-col items-center gap-0.5">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logonur.png" alt="logo" className="w-14 h-10"/>
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-violet-500 to-violet-600 bg-clip-text text-transparent">
              Nur-Kitep
            </span>
          </Link>
        </div>

        <div className="text-center mb-2.5">
          <h1 className="text-xl font-extrabold text-black mb-0.5">{t('register.title')}</h1>
          <p className="text-gray-600 font-semibold text-xs">{t('register.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-2.5 p-2 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-600 text-xs font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div>
            <label htmlFor="fullName" className="block text-xs font-bold text-black mb-1">
              {t('register.fullName')} *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition font-semibold text-sm"
              placeholder="Иван Иванов"
            />
          </div>

          <div>
            <EmailInput
              label={`${t('register.email')} *`}
              value={formData.email}
              onChange={(value) => {
                setFormData({ ...formData, email: value });
                setError('');
                setShowGoogleToast(false);
              }}
              placeholder="example@mail.com"
              required
              className="[&_input]:border-2 [&_input]:border-gray-200 [&_input]:bg-white [&_input]:text-black [&_input]:rounded-xl [&_input]:focus:ring-2 [&_input]:focus:ring-violet-500 [&_label]:text-black"
            />
          </div>

          <div>
            <PhoneInput
              label={t('register.phone')}
              value={formData.phone}
              onChange={(value) => {
                setFormData({ ...formData, phone: value });
                setError('');
                setShowGoogleToast(false);
              }}
              placeholder="+996 XXX XXX XXX"
              className="[&_input]:border-2 [&_input]:border-gray-200 [&_input]:bg-white [&_input]:text-black [&_input]:rounded-xl [&_input]:focus:ring-2 [&_input]:focus:ring-violet-500 [&_label]:text-black"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-black mb-1">
              {t('register.password')} *
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
                {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-black mb-1">
              {t('register.confirmPassword')} *
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
                {showConfirmPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white py-2 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm mt-3"
          >
            {loading ? t('register.registering') : t('register.registerButton')}
          </button>
        </form>

        <div className="mt-2.5">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-500 font-semibold">{t('register.or')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-2.5 w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-black py-2 rounded-xl font-bold hover:border-violet-500 hover:shadow-lg transition-all text-sm"
          >
            <FcGoogle size={20} />
            {t('register.googleButton')}
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-gray-600 font-semibold">
          {t('register.haveAccount')}{' '}
          <Link href="/login" className="text-violet-500 hover:text-violet-600 font-bold">
            {t('register.login')}
          </Link>
        </p>

        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            Регистрируясь, вы соглашаетесь с{' '}
            <Link href="/terms" className="text-violet-500 hover:text-violet-600 underline">
              Условиями использования
            </Link>
            {' '}и{' '}
            <Link href="/privacy" className="text-violet-500 hover:text-violet-600 underline">
              Политикой конфиденциальности
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
