'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Settings,
  FileText,
  LogOut,
  Bell,
  Search,
  LayoutDashboard,
  Warehouse,
  User,
  Menu,
  X,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface ManagerLayoutProps {
  user: User;
  children: React.ReactNode;
}

export default function ManagerLayout({ user, children }: ManagerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [branchId, setBranchId] = useState<string | null>(null);

  useEffect(() => {
    // Получаем ID филиала менеджера
    const fetchBranchId = async () => {
      try {
        const response = await fetch('/api/manager/my-branch');
        if (response.ok) {
          const data = await response.json();
          setBranchId(data.branchId);
        }
      } catch (error) {
        console.error('Error fetching branch ID:', error);
      }
    };

    fetchBranchId();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/manager/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      title: 'Дашборд',
      icon: LayoutDashboard,
      href: '/manager/dashboard',
    },
    {
      title: 'Заказы',
      icon: ShoppingCart,
      href: '/manager/orders',
    },
    {
      title: 'Товары',
      icon: Package,
      href: '/manager/products',
    },
    {
      title: 'Склад',
      icon: Warehouse,
      href: '/manager/inventory',
    },
    {
      title: 'Отчеты',
      icon: FileText,
      href: '/manager/reports',
    },
    {
      title: 'Профиль',
      icon: User,
      href: '/manager/profile',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Menu Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Package className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Nur-Kitep
                  </h1>
                  <p className="text-xs text-gray-500">Панель менеджера</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* User & Notifications */}
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 hover:text-gray-900">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-[73px]">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-72 p-4 flex flex-col z-40 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Main Navigation Card */}
          <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2 text-blue-600">
                <LayoutDashboard size={18} />
                <span className="text-sm font-semibold">Навигация</span>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      router.push(item.href);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Info Card */}
          <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 mb-3 px-2">
              <Settings size={18} />
              <span className="text-sm font-semibold">Информация</span>
            </div>

            <div className="space-y-2 px-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Филиал</p>
                <p className="text-sm font-semibold text-gray-900">
                  {branchId ? 'Загружено' : 'Загрузка...'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Роль</p>
                <p className="text-sm font-semibold text-gray-900">Менеджер</p>
              </div>
            </div>
          </div>

          {/* Logout Button Card */}
          <div className="mt-auto">
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-all"
              >
                <LogOut size={16} />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
