'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
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

export default function ManagerDashboardClient() {
  const [branch, setBranch] = useState<BranchInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranchInfo();
  }, []);

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

  const stats = [
    {
      title: 'Заказы сегодня',
      value: '24',
      change: '+12%',
      icon: ShoppingCart,
      color: 'blue',
    },
    {
      title: 'Товары на складе',
      value: '1,234',
      change: '-3%',
      icon: Package,
      color: 'indigo',
    },
    {
      title: 'Выручка за день',
      value: '45,600 с',
      change: '+18%',
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Низкий остаток',
      value: '8',
      change: '+2',
      icon: AlertCircle,
      color: 'orange',
    },
  ];

  const recentOrders = [
    {
      id: '#12345',
      customer: 'Айгерим Т.',
      amount: '4,500 с',
      status: 'completed',
      statusText: 'Завершен',
      time: '5 мин назад',
    },
    {
      id: '#12344',
      customer: 'Бекжан И.',
      amount: '2,300 с',
      status: 'processing',
      statusText: 'В обработке',
      time: '12 мин назад',
    },
    {
      id: '#12343',
      customer: 'Нурайым А.',
      amount: '6,700 с',
      status: 'pending',
      statusText: 'Ожидает',
      time: '25 мин назад',
    },
    {
      id: '#12342',
      customer: 'Азамат К.',
      amount: '1,200 с',
      status: 'completed',
      statusText: 'Завершен',
      time: '1 час назад',
    },
  ];

  const lowStockItems = [
    { name: 'Блокнот А5', current: 5, min: 20, category: 'Канцелярия' },
    { name: 'Ручка синяя', current: 12, min: 50, category: 'Канцелярия' },
    { name: 'Манас - эпос', current: 3, min: 10, category: 'Книги' },
    { name: 'Карандаш HB', current: 8, min: 30, category: 'Канцелярия' },
  ];

  const recentActivity = [
    { text: 'Новый заказ #12345 от Айгерим Т.', time: '5 минут назад', type: 'order' },
    { text: 'Товар "Блокнот А5" - низкий остаток', time: '15 минут назад', type: 'alert' },
    { text: 'Заказ #12340 завершен', time: '25 минут назад', type: 'success' },
    { text: 'Новое поступление товаров', time: '1 час назад', type: 'info' },
    { text: 'Заказ #12338 отменен', time: '2 часа назад', type: 'error' },
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart size={14} className="text-blue-500" />;
      case 'alert':
        return <AlertCircle size={14} className="text-orange-500" />;
      case 'success':
        return <CheckCircle size={14} className="text-green-500" />;
      case 'error':
        return <XCircle size={14} className="text-red-500" />;
      default:
        return <Clock size={14} className="text-gray-500" />;
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
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
          Дашборд
        </h2>
        <p className="text-sm sm:text-base text-gray-600 font-medium">
          {branch ? `${branch.name} - ${branch.city}` : 'Обзор статистики филиала'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all group"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <stat.icon className={`text-${stat.color}-600`} size={20} strokeWidth={2.5} />
              </div>
              <div
                className={`flex items-center gap-1 ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <TrendingUp size={12} />
                <span className="text-xs font-bold">{stat.change}</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">{stat.title}</h3>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Последние заказы</h3>
            <button className="text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm flex items-center gap-1 hover:gap-2 transition-all">
              <span className="hidden sm:inline">Все заказы</span>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {recentOrders.map((order, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group border border-gray-100"
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
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-semibold border ${getStatusColor(
                      order.status
                    )}`}
                  >
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
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Низкий остаток</h3>
          <div className="space-y-3 sm:space-y-4">
            {lowStockItems.map((item, index) => (
              <div key={index} className="border-l-4 border-orange-500 pl-3 sm:pl-4 py-2">
                <p className="text-gray-900 font-semibold text-xs sm:text-sm">{item.name}</p>
                <p className="text-gray-500 text-[10px] sm:text-xs mb-2">{item.category}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(item.current / item.min) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-600">
                    {item.current}/{item.min}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Последняя активность</h3>
        <div className="space-y-3 sm:space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex gap-2 sm:gap-3 items-start">
              <div className="mt-1">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-xs sm:text-sm font-medium">{activity.text}</p>
                <div className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs mt-1">
                  <Clock size={10} className="sm:w-3 sm:h-3" />
                  {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
