'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiLogOut,
  FiUser,
  FiPackage,
} from 'react-icons/fi';

interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  openTime: string | null;
  closeTime: string | null;
  workDays: string[];
  status: string;
}

interface Manager {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
}

interface BranchManagerClientProps {
  branchId: string;
}

export default function BranchManagerClient({ branchId }: BranchManagerClientProps) {
  const router = useRouter();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [currentUser, setCurrentUser] = useState<Manager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBranchData();
    fetchCurrentUser();
  }, [branchId]);

  const fetchBranchData = async () => {
    try {
      console.log('[BranchManagerClient] Fetching branch data for:', branchId);
      const response = await fetch(`/api/manager/branch/${branchId}`);
      
      if (!response.ok) {
        const data = await response.json();
        console.error('[BranchManagerClient] Error response:', data);
        
        // Обработка специфичных ошибок
        if (response.status === 401) {
          // Не авторизован - перенаправляем на вход
          router.push('/manager/login');
          return;
        }
        
        if (response.status === 403) {
          throw new Error(data.error === 'Access denied to this branch' 
            ? 'У вас нет доступа к этому филиалу' 
            : 'Доступ запрещен');
        }
        
        throw new Error(data.error || 'Не удалось загрузить данные филиала');
      }

      const data = await response.json();
      console.log('[BranchManagerClient] Branch data loaded successfully');
      setBranch(data.branch);
      setManagers(data.branch.branchUsers?.map((bu: any) => bu.user) || []);
    } catch (err) {
      console.error('[BranchManagerClient] Exception:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/manager/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '—';
    return time.slice(0, 5);
  };

  const dayNames: Record<string, string> = {
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-blue-600 text-lg font-semibold">Загрузка...</div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-red-600 text-lg font-semibold mb-4">
            {error || 'Филиал не найден'}
          </div>
          <button
            onClick={() => router.push('/manager/login')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Вернуться к входу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FiPackage className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Панель менеджера</h1>
                <p className="text-sm text-gray-600">{branch.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="flex items-center gap-2">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.fullName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <FiUser className="text-white" size={16} />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {currentUser.fullName}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <FiLogOut size={16} />
                <span className="text-sm font-medium">Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Информация о филиале */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Информация о филиале
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Название</div>
                <div className="text-base font-semibold text-gray-900">{branch.name}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Код филиала</div>
                <div className="text-base font-semibold text-gray-900">{branch.code}</div>
              </div>

              <div className="flex items-start gap-2">
                <FiMapPin className="text-blue-500 mt-1" size={18} />
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Адрес</div>
                  <div className="text-base text-gray-900">
                    {branch.city}, {branch.district}
                  </div>
                  <div className="text-base text-gray-900">{branch.address}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FiPhone className="text-blue-500" size={18} />
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Телефон</div>
                  <div className="text-base text-gray-900">{branch.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FiMail className="text-blue-500" size={18} />
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Email</div>
                  <div className="text-base text-gray-900">{branch.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FiClock className="text-blue-500 mt-1" size={18} />
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Режим работы</div>
                  <div className="text-base text-gray-900">
                    {branch.workDays.length > 0 ? (
                      <>
                        {branch.workDays.map((day) => dayNames[day] || day).join(', ')}
                        <br />
                        {formatTime(branch.openTime)} - {formatTime(branch.closeTime)}
                      </>
                    ) : (
                      'Не указан'
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Статус</div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                    branch.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {branch.status === 'active' ? 'Активен' : 'Неактивен'}
                </span>
              </div>
            </div>
          </div>

          {/* Менеджеры филиала */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Менеджеры филиала
            </h2>
            
            {managers.length > 0 ? (
              <div className="space-y-3">
                {managers.map((manager) => (
                  <div
                    key={manager.id}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                  >
                    {manager.avatar ? (
                      <img
                        src={manager.avatar}
                        alt={manager.fullName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <FiUser className="text-white" size={20} />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {manager.fullName}
                      </div>
                      <div className="text-sm text-gray-600">{manager.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Нет назначенных менеджеров
              </div>
            )}
          </div>
        </div>

        {/* Дополнительные секции можно добавить здесь */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Управление филиалом
          </h2>
          <p className="text-gray-600">
            Здесь будут размещены инструменты для управления товарами, заказами и другими
            операциями филиала.
          </p>
        </div>
      </main>
    </div>
  );
}
