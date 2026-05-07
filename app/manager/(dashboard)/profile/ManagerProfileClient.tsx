'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, Save } from 'lucide-react';

export default function ManagerProfileClient() {
  const [user, setUser] = useState<any>(null);
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, branchRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/manager/my-branch'),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      if (branchRes.ok) {
        const branchData = await branchRes.json();
        setBranch(branchData.branch);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Профиль</h2>
        <p className="text-gray-600 font-medium">Управление личными данными</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {user?.fullName?.charAt(0) || 'M'}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{user?.fullName || 'Менеджер'}</h3>
            <p className="text-sm text-gray-600">{user?.email}</p>
            <span className="inline-block mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              Менеджер
            </span>
          </div>

          {branch && (
            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">Филиал</h4>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">{branch.name}</p>
                <p className="text-xs text-gray-600">Код: {branch.code}</p>
              </div>
            </div>
          )}
        </div>

        {/* Personal Info */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Личная информация</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  Полное имя
                </div>
              </label>
              <input
                type="text"
                value={user?.fullName || ''}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </div>
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  Телефон
                </div>
              </label>
              <input
                type="tel"
                value={user?.phone || 'Не указан'}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                readOnly
              />
            </div>

            {branch && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Building size={16} />
                      Филиал
                    </div>
                  </label>
                  <input
                    type="text"
                    value={branch.name}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      Код филиала
                    </div>
                  </label>
                  <input
                    type="text"
                    value={branch.code}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    readOnly
                  />
                </div>
              </>
            )}

            <div className="pt-4">
              <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium text-sm shadow-lg shadow-blue-500/30">
                <Save size={18} />
                Сохранить изменения
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
