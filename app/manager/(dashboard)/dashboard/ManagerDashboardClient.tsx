'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  DollarSign,
  ChevronRight,
  Loader,
  ImageIcon,
} from 'lucide-react';

interface BranchInfo {
  id: string;
  name: string;
  code: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
}

interface Banner {
  id: string;
  url: string | null;
  status: string;
  desktopImage: string;
  mobileImage: string;
}

interface DashboardStats {
  todayOrders: string;
  totalStock: string;
  todayRevenue: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: string;
  status: string;
  statusText: string;
  time: string;
}

export default function ManagerDashboardClient() {
  const [branch, setBranch] = useState<BranchInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    fetchBranchInfo();
    fetchBanners();
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/manager/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data.stats);
        setRecentOrders(data.recentOrders || []);
      }
    } catch (error) {
      console.error('Error fetching manager dashboard:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchBranchInfo = async () => {
    try {
      const response = await fetch('/api/manager/my-branch');
      if (response.ok) {
        const data = await response.json();
        setBranch(data.branch);
      }
    } catch (error) {
      console.error('Error fetching branch:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/user/banners');
      if (response.ok) {
        const data = await response.json();
        setBanners(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setBannersLoading(false);
    }
  };

  const stats = [
    {
      title: 'Заказы сегодня',
      value: dashboardStats?.todayOrders ?? '—',
      icon: ShoppingCart,
      color: 'blue',
    },
    {
      title: 'Товары на складе',
      value: dashboardStats?.totalStock ?? '—',
      icon: Package,
      color: 'indigo',
    },
    {
      title: 'Выручка за день',
      value: dashboardStats?.todayRevenue ?? '—',
      icon: DollarSign,
      color: 'green',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <stat.icon className="text-blue-500" size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-gray-400 text-xs font-medium truncate">{stat.title}</p>
                {dashboardLoading ? (
                  <div className="w-16 h-7 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{stat.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Последние заказы</h3>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
        {dashboardLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ShoppingCart size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Нет заказов</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {recentOrders.map((order, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
              >
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                    {order.customer.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 font-semibold text-xs sm:text-sm truncate">{order.customer}</p>
                    <p className="text-gray-500 text-[10px] sm:text-xs">{order.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  <span className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-semibold border ${getStatusColor(order.status)}`}>
                    {order.statusText}
                  </span>
                  <div className="text-right hidden sm:block">
                    <p className="text-gray-900 font-semibold text-sm">{order.amount}</p>
                    <p className="text-gray-500 text-xs">{order.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Banners */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <ImageIcon size={20} className="text-blue-500" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Баннеры</h3>
          {!bannersLoading && (
            <span className="ml-auto text-xs text-gray-500 font-medium">{banners.length} активных</span>
          )}
        </div>
        {bannersLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="animate-spin text-blue-500" size={24} />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ImageIcon size={40} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Нет активных баннеров</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((banner) => (
              <div key={banner.id} className="rounded-xl overflow-hidden border border-gray-200 group">
                <div className="relative aspect-[16/6] bg-gray-100">
                  <img
                    src={banner.desktopImage}
                    alt="Баннер"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Активен
                  </span>
                </div>
                {banner.url && (
                  <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 truncate">{banner.url}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
