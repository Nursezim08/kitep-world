'use client';

import { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Package,
} from 'lucide-react';

export default function ManagerOrdersClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const orders = [
    {
      id: '#12345',
      customer: 'Айгерим Токтогулова',
      email: 'aigerim@example.com',
      phone: '+996 555 123 456',
      items: 3,
      total: '₸4,500',
      status: 'completed',
      statusText: 'Завершен',
      date: '2026-05-05 14:30',
      paymentMethod: 'Карта',
    },
    {
      id: '#12344',
      customer: 'Бекжан Исаков',
      email: 'bekzhan@example.com',
      phone: '+996 555 234 567',
      items: 2,
      total: '₸2,300',
      status: 'processing',
      statusText: 'В обработке',
      date: '2026-05-05 14:18',
      paymentMethod: 'Наличные',
    },
    {
      id: '#12343',
      customer: 'Нурайым Асанова',
      email: 'nuraiym@example.com',
      phone: '+996 555 345 678',
      items: 5,
      total: '₸6,700',
      status: 'pending',
      statusText: 'Ожидает',
      date: '2026-05-05 14:05',
      paymentMethod: 'Карта',
    },
    {
      id: '#12342',
      customer: 'Азамат Кадыров',
      email: 'azamat@example.com',
      phone: '+996 555 456 789',
      items: 1,
      total: '₸1,200',
      status: 'completed',
      statusText: 'Завершен',
      date: '2026-05-05 13:45',
      paymentMethod: 'Карта',
    },
    {
      id: '#12341',
      customer: 'Гульнара Садыкова',
      email: 'gulnara@example.com',
      phone: '+996 555 567 890',
      items: 4,
      total: '₸3,800',
      status: 'cancelled',
      statusText: 'Отменен',
      date: '2026-05-05 12:30',
      paymentMethod: 'Наличные',
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'processing':
        return <Package size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const stats = [
    { label: 'Всего заказов', value: '156', color: 'blue' },
    { label: 'В обработке', value: '12', color: 'orange' },
    { label: 'Завершено', value: '132', color: 'green' },
    { label: 'Отменено', value: '12', color: 'red' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Заказы</h2>
        <p className="text-gray-600 font-medium">Управление заказами филиала</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
          >
            <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по номеру заказа, клиенту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-medium"
          >
            <option value="all">Все статусы</option>
            <option value="pending">Ожидает</option>
            <option value="processing">В обработке</option>
            <option value="completed">Завершен</option>
            <option value="cancelled">Отменен</option>
          </select>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium text-sm shadow-lg shadow-blue-500/30">
            <Download size={18} />
            Экспорт
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Заказ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Клиент
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Товары
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="text-white" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{order.id}</p>
                        <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                      <p className="text-xs text-gray-500">{order.email}</p>
                      <p className="text-xs text-gray-500">{order.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{order.items} шт</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">{order.total}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.statusText}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{order.date}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">Показано 1-5 из 156 заказов</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Назад
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Далее
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
