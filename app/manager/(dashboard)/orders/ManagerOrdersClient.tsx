'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import LightDatePicker from '@/app/components/LightDatePicker';

interface OrderStats {
  total: string;
  processing: string;
  completed: string;
  cancelled: string;
}

interface Order {
  id: string;
  rawId: string;
  customer: string;
  email: string;
  phone: string;
  items: number;
  total: string;
  totalRaw: number;
  status: string;
  statusText: string;
  paymentStatus: string;
  paymentStatusText: string;
  date: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ManagerOrdersClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(1);

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/manager/stats');
      if (response.ok) {
        const data = await response.json();
        setOrderStats(data.orders);
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (paymentFilter !== 'all') params.set('paymentStatus', paymentFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      params.set('sortBy', sortBy);
      params.set('page', page.toString());
      params.set('limit', '10');

      const response = await fetch(`/api/manager/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  }, [searchQuery, statusFilter, paymentFilter, dateFrom, dateTo, sortBy, page]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, paymentFilter, dateFrom, dateTo, sortBy]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const hasActiveFilters =
    statusFilter !== 'all' ||
    paymentFilter !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    sortBy !== 'date_desc';

  const resetFilters = () => {
    setStatusFilter('all');
    setPaymentFilter('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('date_desc');
    setSearchQuery('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'paid': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} />;
      case 'paid': return <Package size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'failed': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const stats = [
    { label: 'Всего заказов', value: orderStats?.total ?? '—', color: 'blue' },
    { label: 'В обработке', value: orderStats?.processing ?? '—', color: 'orange' },
    { label: 'Завершено', value: orderStats?.completed ?? '—', color: 'green' },
    { label: 'Отменено', value: orderStats?.cancelled ?? '—', color: 'red' },
  ];

  const selectClass = 'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-xs sm:text-sm font-medium';

  return (
    <div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-all"
          >
            <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">{stat.label}</p>
            {statsLoading ? (
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mt-1" />
            ) : (
              <p className={`text-xl sm:text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm mb-4 sm:mb-6">
        {/* Top row: search + toggle */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по номеру заказа или клиенту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-xs sm:text-sm"
            />
          </div>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
              filtersOpen || hasActiveFilters
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Фильтры</span>
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-white text-blue-600 rounded-full text-[10px] font-bold flex items-center justify-center">
                {[statusFilter !== 'all', paymentFilter !== 'all', !!dateFrom, !!dateTo, sortBy !== 'date_desc'].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Expandable filters */}
        {filtersOpen && (
          <div className="border-t border-gray-100 pt-4 space-y-3">
            {/* Row 1: статус заказа + статус оплаты */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Статус заказа</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
                  <option value="all">Все статусы</option>
                  <option value="paid">Оплачен</option>
                  <option value="completed">Завершён</option>
                  <option value="cancelled">Отменён</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Статус оплаты</label>
                <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className={selectClass}>
                  <option value="all">Все</option>
                  <option value="success">Оплачено</option>
                  <option value="failed">Не оплачено</option>
                </select>
              </div>
            </div>

            {/* Row 2: дата от + дата до + сортировка */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Дата от</label>
                <LightDatePicker
                  value={dateFrom}
                  onChange={setDateFrom}
                  placeholder="Дата от"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Дата до</label>
                <LightDatePicker
                  value={dateTo}
                  onChange={setDateTo}
                  placeholder="Дата до"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Сортировка</label>
                <div className="relative">
                  <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${selectClass} pl-8`}>
                    <option value="date_desc">Дата: сначала новые</option>
                    <option value="date_asc">Дата: сначала старые</option>
                    <option value="total_desc">Сумма: по убыванию</option>
                    <option value="total_asc">Сумма: по возрастанию</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reset */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                >
                  <X size={14} />
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {ordersLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex gap-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 bg-gray-200 rounded" />
                  <div className="w-48 h-3 bg-gray-100 rounded" />
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Заказы не найдены</p>
            <p className="text-xs mt-1">Попробуйте изменить параметры фильтрации</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Заказ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Клиент</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Товары</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Сумма</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Статус</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Оплата</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Дата</th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.rawId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ShoppingCart className="text-white" size={16} />
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{order.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                        <p className="text-xs text-gray-400">{order.email}</p>
                        {order.phone && <p className="text-xs text-gray-400">{order.phone}</p>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{order.items} шт</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">{order.total}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getPaymentColor(order.paymentStatus)}`}>
                          {order.paymentStatusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-500">{order.date}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.rawId} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="text-white" size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{order.id}</p>
                        <p className="text-xs text-gray-400">{order.date}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.statusText}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Клиент</p>
                      <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                      {order.phone && <p className="text-xs text-gray-400">{order.phone}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Товары</p>
                        <p className="text-sm font-medium text-gray-900">{order.items} шт</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Сумма</p>
                        <p className="text-sm font-bold text-gray-900">{order.total}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${getPaymentColor(order.paymentStatus)}`}>
                      {order.paymentStatusText}
                    </span>
                    <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600">
                      <Eye size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500">
              Показано {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–{Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total} заказов
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4));
                const p = start + i;
                if (p > pagination.totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      p === pagination.page
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
