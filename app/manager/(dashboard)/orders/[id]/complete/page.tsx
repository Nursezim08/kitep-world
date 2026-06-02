'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  PackageCheck,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import QRScanner from '@/app/components/QRScanner';

interface OrderDetails {
  id: string;
  rawId: string;
  user?: {
    fullName: string;
    email: string;
    phone?: string;
  };
  orderItems: Array<{
    product: {
      images: Array<{ imageUrl: string }>;
      translations: Array<{ name: string }>;
    };
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
}

export default function CompleteOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState('');
  const [confirmMode, setConfirmMode] = useState<'qr' | 'code'>('qr');
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'invalid'>('idle');
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/manager/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrderDetails(data);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Не удалось загрузить детали заказа');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const getExpectedQrCode = () => {
    if (!orderDetails) return '';
    return `ORDER:${orderDetails.rawId}`;
  };

  const getExpectedManualCode = () => {
    if (!orderDetails) return '';
    const digits = orderDetails.id.replace(/\D/g, '');
    return digits.slice(-5);
  };

  const handleScan = (decoded: string) => {
    if (scanStatus === 'success') return;

    const trimmed = decoded.trim();
    const expected = getExpectedQrCode();

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
    scanStatus === 'success' &&
    scannedCode === getExpectedQrCode();

  const isCodeConfirmed = () =>
    manualCode.length === 5 &&
    manualCode === getExpectedManualCode();

  const handleComplete = async () => {
    if (!orderDetails) return;

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
      const res = await fetch(`/api/manager/orders/${orderDetails.rawId}/complete`, {
        method: 'PATCH',
      });
      if (!res.ok) {
        const data = await res.json();
        setCompleteError(data.error ?? 'Ошибка');
        return;
      }
      router.push('/manager/orders');
    } catch {
      setCompleteError('Ошибка сети');
    } finally {
      setCompleting(false);
    }
  };

  const resetConfirmState = () => {
    setCompleteError('');
    setScannedCode('');
    setScanStatus('idle');
    setScannerActive(false);
    setManualCode('');
    setConfirmMode('qr');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3 mb-4">
              <AlertCircle size={16} />
              {error || 'Не удалось загрузить детали заказа'}
            </div>
            <button
              onClick={fetchOrderDetails}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Попробовать снова
            </button>
            <button
              onClick={() => router.push('/manager/orders')}
              className="block mx-auto mt-4 text-sm text-gray-600 hover:text-gray-800"
            >
              Вернуться к заказам
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <button
              onClick={() => router.push('/manager/orders')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Назад</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <PackageCheck className="text-green-600" size={20} />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900">Выдать заказ</h1>
                <p className="text-xs text-gray-500">{orderDetails.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Информация о клиенте */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Клиент</h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {orderDetails.user?.fullName || 'Не указано'}
              </p>
              <p className="text-xs text-gray-600">
                {orderDetails.user?.email || 'Не указано'}
              </p>
              {orderDetails.user?.phone && (
                <p className="text-xs text-gray-600">
                  {orderDetails.user.phone}
                </p>
              )}
            </div>
          </div>

          {/* Товары */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Товары</h2>
            <div className="space-y-3">
              {orderDetails.orderItems && orderDetails.orderItems.length > 0 ? (
                orderDetails.orderItems.map((item, index) => {
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
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Итого к оплате:</span>
              <span className="text-2xl font-bold text-gray-900">
                {orderDetails.totalAmount 
                  ? Number(orderDetails.totalAmount).toLocaleString('ru-RU') + ' с'
                  : '0 с'
                }
              </span>
            </div>
          </div>

          {/* Способ подтверждения */}
          <div>
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
                  resetConfirmState();
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
                  resetConfirmState();
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
            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle size={14} />
              {completeError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/manager/orders')}
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
        </div>
      </div>
    </div>
  );
}
