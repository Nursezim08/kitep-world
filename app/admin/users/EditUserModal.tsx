'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Lock, Shield } from 'lucide-react';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: UserData | null;
}

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'user',
    password: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        password: '',
        status: user.status,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Ошибка при обновлении пользователя');
      }
    } catch (error) {
      setError('Ошибка при обновлении пользователя');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="bg-[#252d3d] rounded-2xl w-full max-w-2xl m-4 my-8 border border-gray-800/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <h2 className="text-xl font-bold text-white">Редактировать пользователя</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a3347] rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Полное имя *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                placeholder="Введите полное имя"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                placeholder="example@mail.com"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Телефон
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                placeholder="+996 XXX XXX XXX"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Новый пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                placeholder="Оставьте пустым, чтобы не менять"
                minLength={6}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Оставьте поле пустым, если не хотите менять пароль
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Роль *
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white appearance-none cursor-pointer"
                required
              >
                <option value="user">Пользователь</option>
                <option value="manager">Менеджер</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Статус
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'active' })}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  formData.status === 'active'
                    ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50'
                    : 'bg-[#1e2533] text-gray-400 border-2 border-gray-700/50 hover:border-gray-600'
                }`}
              >
                Активен
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'inactive' })}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  formData.status === 'inactive'
                    ? 'bg-gray-500/20 text-gray-400 border-2 border-gray-500/50'
                    : 'bg-[#1e2533] text-gray-400 border-2 border-gray-700/50 hover:border-gray-600'
                }`}
              >
                Неактивен
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'blocked' })}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  formData.status === 'blocked'
                    ? 'bg-red-500/20 text-red-400 border-2 border-red-500/50'
                    : 'bg-[#1e2533] text-gray-400 border-2 border-gray-700/50 hover:border-gray-600'
                }`}
              >
                Заблокирован
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 bg-[#1e2533] hover:bg-[#2a3347] text-white rounded-xl font-medium transition-all"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
