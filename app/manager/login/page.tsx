'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FiUser } from 'react-icons/fi';
import EmailInput from '@/app/components/EmailInput';

export default function ManagerLoginPage() {
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
    notManager: 'У вас нет прав менеджера',
    noBranchAssigned: 'Вы не привязаны ни к одному филиалу',
    accountBlocked: 'Ваш аккаунт заблокирован',
    accountInactive: 'Ваш аккаунт неактивен',
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
      const response = await fetch('/api/manager/login', {
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
      router.push(`/manager/verify?userId=${data.userId}&branchId=${data.branchId}`);
    } catch (err) {
      setError(errorMessages.connectionError);
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Вход для менеджера</h1>
          <p className="text-gray-500 font-medium text-sm">Введите учетные данные</p>
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
            <EmailInput
              label="Email"
              value={formData.email}
              onChange={(value) => {
                setFormData({ ...formData, email: value });
                setError('');
              }}
              placeholder="manager@example.com"
              required
              className="[&_input]:bg-gray-50 [&_input]:border [&_input]:border-gray-200 [&_input]:text-gray-900 [&_input]:rounded-xl [&_input]:focus:ring-2 [&_input]:focus:ring-blue-500/50 [&_input]:focus:border-blue-500 [&_input]:placeholder-gray-400 [&_label]:text-gray-700 [&_label]:font-medium"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition pr-10 font-medium text-sm placeholder-gray-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 font-medium">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Вернуться на сайт
          </Link>
        </p>
      </div>
    </div>
  );
}
