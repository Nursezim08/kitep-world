'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface UserData {
  id: string;
  fullName: string;
  email: string;
}

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: UserData | null;
}

export default function DeleteUserModal({ isOpen, onClose, onSuccess, user }: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Ошибка при удалении пользователя');
      }
    } catch (error) {
      setError('Ошибка при удалении пользователя');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#252d3d] rounded-2xl w-full max-w-md m-4 border border-gray-800/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-red-400" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Подтверждение удаления</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a3347] rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <p className="text-gray-300">
            Вы уверены, что хотите заблокировать пользователя{' '}
            <span className="font-bold text-white">{user.fullName}</span>?
          </p>

          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex gap-3">
              <AlertTriangle className="text-red-400 flex-shrink-0" size={20} />
              <div className="space-y-2">
                <p className="text-red-400 font-semibold text-sm">
                  Пользователь будет заблокирован
                </p>
                <ul className="text-red-400/80 text-sm space-y-1">
                  <li>• Пользователь не сможет войти в систему</li>
                  <li>• Все активные сессии будут завершены</li>
                  <li>• Данные пользователя сохранятся</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-800/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-2.5 bg-[#1e2533] hover:bg-[#2a3347] text-white rounded-xl font-medium transition-all disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Блокировка...' : 'Заблокировать'}
          </button>
        </div>
      </div>
    </div>
  );
}
