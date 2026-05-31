'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';
import LightDatePicker from '@/app/components/LightDatePicker';
import LightCustomSelect from '@/app/components/LightCustomSelect';
import QRScanner from '@/app/components/QRScanner';
import { useBlockScroll } from '@/app/hooks/useBlockScroll';

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

  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState('');
  const [confirmMode, setConfirmMode] = useState<'qr' | 'code'>('qr');
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'invalid'>('idle');
  const [manualCode, setManualCode] = useState('');

  // Блокируем скролл страницы пока открыта модалка выдачи
  useBlockScroll(!!confirmOrder);

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

  const getExpectedQrCode = (order: Order | null) => {
    if (!order) return '';
    return `ORDER:${order.rawId}`;
  };

  const getExpectedManualCode = (order: Order | null) => {
    if (!order) return '';
    // Последние 5 цифр номера заказа (как у клиента в модалке)
    const digits = order.id.replace(/\D/g, '');
    return digits.slice(-5);
  };

  const handleScan = (decoded: string) => {
    if (!confirmOrder) return;
    if (scanStatus === 'success') return;

    const trimmed = decoded.trim();
    const expected = getExpectedQrCode(confirmOrder);

    if (trimmed === expected) {
      setScannedCode(trimmed);
      setScanStatus('success');
      setScannerActive(false);
      setCompleteError('');
    } else {
      setScanStatus('invalid');
      setCompleteError('QR-код не соответствует этому заказу');
    }
  };

  const isQrConfirmed = () =>
    !!confirmOrder &&
    scanStatus === 'success' &&
    scannedCode === getExpectedQrCode(confirmOrder);

  const isCodeConfirmed = () =>
    !!confirmOrder &&
    manualCode.length === 5 &&
    manualCode === getExpectedManualCode(confirmOrder);

  const handleComplete = async () => {
    if (!confirmOrder || !orderDetails) return;

    if (confirmMode === 'qr') {
      if (!isQrConfirmed()) {
        setCompleteError('Сначала отсканируйте QR-код заказа');
        return;
      }
    } else {
      if (manualCode.length !== 5) {
        setCompleteError('Введите 5 цифр кода');
        return;
      }
      if (!isCodeConfirmed()) {
        setCompleteError('Неверный код заказа');
        return;
      }
    }

    setCompleting(true);
    setCompleteError('');
    try {
      const res = await fetch(`/api/manager/orders/${confirmOrder.rawId}/complete`, {
        method: 'PATCH',
      });
      if (!res.ok) {
        const data = await res.json();
        setCompleteError(data.error ?? 'Ошибка');
        return;
      }
      setConfirmOrder(null);
      setOrderDetails(null);
      setScannedCode('');
      setScanStatus('idle');
      setScannerActive(false);
      setManualCode('');
      setConfirmMode('qr');
      await fetchOrders();
      await fetchStats();
    } catch {
      setCompleteError('Ошибка сети');
    } finally {
      setCompleting(false);
    }
  };

  const closeConfirmModal = () => {
    setConfirmOrder(null);
    setOrderDetails(null);
    setCompleteError('');
    setScannedCode('');
    setScanStatus('idle');
    setScannerActive(false);
    setManualCode('');
    setConfirmMode('qr');
  };

  const openConfirmModal = async (order: Order) => {
    setConfirmOrder(order);
    setCompleteError('');
    setScannedCode('');
    setScanStatus('idle');
    setScannerActive(true);
    setManualCode('');
    setConfirmMode('qr');
    setLoadingDetails(true);
    
    console.log('[openConfirmModal] Opening modal for order:', order.rawId);
    
    try {
      const res = await fetch(`/api/manager/orders/${order.rawId}`);
      console.log('[openConfirmModal] Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('[openConfirmModal] Order details loaded:', data);
        setOrderDetails(data);
      } else {
        const errorData = await res.json();
        console.error('[openConfirmModal] Error response:', errorData);
        setCompleteError(errorData.error || 'Не удалось загрузить детали заказа');
      }
    } catch (error) {
      console.error('[openConfirmModal] Error fetching order details:', error);
      setCompleteError('Ошибка сети');
    } finally {
      setLoadingDetails(false);
    }
  };

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
      case 'paid': return <ShoppingCart size={14} />;
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


  return (
    <div>

      {/* Confirm Modal */}
      {confirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PackageCheck className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Выдать заказ</h3>
                  <p className="text-xs text-gray-500">{confirmOrder.id}</p>
                </div>
              </div>
              <button
                onClick={closeConfirmModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {loadingDetails ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-20 bg-gray-200 rounded" />
                </div>
              ) : completeError && !orderDetails ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3 mb-4">
                    <AlertCircle size={16} />
                    {completeError}
                  </div>
                  <button
                    onClick={() => openConfirmModal(confirmOrder!)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Попробовать снова
                  </button>
                </div>
              ) : orderDetails ? (
                <>
                  {/* Информация о клиенте */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Клиент</h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {orderDetails.user?.fullName || confirmOrder.customer}
                      </p>
                      <p className="text-xs text-gray-600">
                        {orderDetails.user?.email || confirmOrder.email}
                      </p>
                      {(orderDetails.user?.phone || confirmOrder.phone) && (
                        <p className="text-xs text-gray-600">
                          {orderDetails.user?.phone || confirmOrder.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Товары */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Товары</h4>
                    <div className="space-y-3">
                      {orderDetails.orderItems && orderDetails.orderItems.length > 0 ? (
                        orderDetails.orderItems.map((item: any, index: number) => {
                          const price = Number(item.price) || 0;
                          const quantity = Number(item.quantity) || 0;
                          const total = price * quantity;
                          
                          return (
                            <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                              {item.product?.images && item.product.images[0] && (
                                <img
                                  src={item.product.images[0].imageUrl}
                                  alt={item.product.translations?.[0]?.name || 'Товар'}
                                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {item.product?.translations?.[0]?.name || 'Без названия'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {quantity} × {price.toLocaleString('ru-RU')} с
                                </p>
                              </div>
                              <p className="text-sm font-bold text-gray-900">
                                {total.toLocaleString('ru-RU')} с
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">Нет товаров</p>
                      )}
                    </div>
                  </div>

                  {/* Итого */}
                  <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Итого к оплате:</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {orderDetails.totalAmount 
                          ? Number(orderDetails.totalAmount).toLocaleString('ru-RU') + ' с'
                          : confirmOrder.total
                        }
                      </span>
                    </div>
                  </div>

                  {/* Способ подтверждения */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        Подтверждение выдачи
                      </label>
                      {(scanStatus === 'success' || isCodeConfirmed()) && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                          <CheckCircle size={12} /> Подтверждено
                        </span>
                      )}
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmMode('qr');
                          setCompleteError('');
                        }}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                          confirmMode === 'qr'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Сканировать QR
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmMode('code');
                          setCompleteError('');
                          setScannerActive(false);
                        }}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                          confirmMode === 'code'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Ввести код
                      </button>
                    </div>

                    {confirmMode === 'qr' ? (
                      scanStatus === 'success' ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="text-green-600" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-green-700">QR-код успешно отсканирован</p>
                            <p className="text-xs text-green-600 truncate">Заказ совпадает. Можно выдать.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setScanStatus('idle');
                              setScannedCode('');
                              setCompleteError('');
                              setScannerActive(true);
                            }}
                            className="text-xs font-semibold text-green-700 hover:text-green-800"
                          >
                            Сканировать ещё
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-end mb-2">
                            <button
                              type="button"
                              onClick={() => {
                                setScanStatus('idle');
                                setScannedCode('');
                                setCompleteError('');
                                setScannerActive((v) => !v);
                              }}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                            >
                              {scannerActive ? 'Остановить камеру' : 'Включить камеру'}
                            </button>
                          </div>
                          {scannerActive ? (
                            <QRScanner
                              active={scannerActive}
                              onScan={handleScan}
                              onError={(err) => setCompleteError(err)}
                            />
                          ) : (
                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                              <p className="text-xs text-gray-500">
                                Нажмите «Включить камеру», чтобы отсканировать QR-код заказа.
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Попросите клиента показать QR-код из его аккаунта
                          </p>
                        </>
                      )
                    ) : (
                      <>
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          value={manualCode}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 5);
                            setManualCode(digits);
                            if (completeError) setCompleteError('');
                          }}
                          placeholder="Введите 5 цифр"
                          maxLength={5}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 text-center text-2xl font-bold tracking-widest ${
                            isCodeConfirmed()
                              ? 'border-green-500 focus:ring-green-500/40 text-green-700'
                              : 'border-gray-200 focus:ring-green-500/40 focus:border-green-500'
                          }`}
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Попросите клиента назвать 5-значный код заказа
                        </p>
                      </>
                    )}
                  </div>

                  {completeError && (
                    <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2 mb-4">
                      <AlertCircle size={14} />
                      {completeError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={closeConfirmModal}
                      disabled={completing}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleComplete}
                      disabled={
                        completing ||
                        (confirmMode === 'qr' ? !isQrConfirmed() : !isCodeConfirmed())
                      }
                      className="flex-1 px-4 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {completing ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <PackageCheck size={15} />
                      )}
                      Выдать заказ
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">Не удалось загрузить детали заказа</p>
              )}
            </div>
          </div>
        </div>
      )}

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
                <LightCustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'all', label: 'Все статусы' },
                    { value: 'paid', label: 'Оплачен' },
                    { value: 'completed', label: 'Завершён' },
                    { value: 'cancelled', label: 'Отменён' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Статус оплаты</label>
                <LightCustomSelect
                  value={paymentFilter}
                  onChange={setPaymentFilter}
                  options={[
                    { value: 'all', label: 'Все' },
                    { value: 'success', label: 'Оплачено' },
                    { value: 'failed', label: 'Не оплачено' },
                  ]}
                />
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
                <LightCustomSelect
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: 'date_desc', label: 'Дата: сначала новые' },
                    { value: 'date_asc', label: 'Дата: сначала старые' },
                    { value: 'total_desc', label: 'Сумма: по убыванию' },
                    { value: 'total_asc', label: 'Сумма: по возрастанию' },
                  ]}
                />
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Сумма</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Статус</th>
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
                        <span className="text-sm font-bold text-gray-900">{order.total}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-500">{order.date}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {order.status === 'paid' && (
                            <button
                              onClick={() => openConfirmModal(order)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-all"
                            >
                              <PackageCheck size={13} />
                              Выдать
                            </button>
                          )}
                          <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600">
                            <Eye size={16} />
                          </button>
                        </div>
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
                        <p className="text-xs text-gray-400">Сумма</p>
                        <p className="text-sm font-bold text-gray-900">{order.total}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    {order.status === 'paid' && (
                      <button
                        onClick={() => openConfirmModal(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-all"
                      >
                        <PackageCheck size={13} />
                        Выдать
                      </button>
                    )}
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
