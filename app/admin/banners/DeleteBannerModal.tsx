'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  image: string;
  url: string | null;
  status: 'active' | 'inactive';
}

interface DeleteBannerModalProps {
  isOpen: boolean;
  banner: Banner;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteBannerModal({ isOpen, banner, onClose, onSuccess }: DeleteBannerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при удалении баннера');
      }
    } catch (error) {
      setError('Ошибка при удалении баннера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#252d3d] rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="text-red-400" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Подтверждение удаления</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a3347] rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <p className="text-gray-300 mb-4">
            Вы уверены, что хотите удалить баннер{' '}
            <span className="font-semibold text-white">"{banner.title}"</span>?
          </p>

          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm flex items-start gap-2">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <span>Это действие нельзя отменить. Баннер будет удален навсегда.</span>
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Удаление...' : 'Удалить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
