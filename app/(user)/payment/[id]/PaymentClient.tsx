'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  CheckCircle,
  Package,
  ArrowLeft,
  Loader2,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  total: number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

interface PaymentClientProps {
  orderId: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export default function PaymentClient({ orderId, user }: PaymentClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchingOrder, setFetchingOrder] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch('/api/user/orders');
      if (res.ok) {
        const orders = await res.json();
        const found = orders.find((o: any) => o.id === orderId);
        if (found) {
          setOrder({
            id: found.id,
            order_number: found.orderNumber,
            total: found.totalAmount,
            payment_status: found.paymentStatus,
            order_status: found.status,
            created_at: found.createdAt,
          });
        } else {
          setError('Заказ не найден');
        }
      }
    } catch {
      setError('Ошибка при загрузке заказа');
    } finally {
      setFetchingOrder(false);
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/finik/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Ошибка создания платежа');
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('URL платежной страницы не получен');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setIsLoading(false);
    }
  };

  if (fetchingOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => router.push('/orders')}
            className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-xl"
          >
            Перейти к заказам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Мои заказы</span>
        </button>

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Top section */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <QrCode size={28} />
              <h1 className="text-2xl font-bold">Оплата заказа</h1>
            </div>
            <p className="text-violet-200 text-sm">
              Оплата через Finik Pay QR-код
            </p>
          </div>

          <div className="px-8 py-6">
            {/* Order info */}
            {order && (
              <div className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Package size={18} className="text-violet-600" />
                  <span className="font-semibold text-gray-900">Информация о заказе</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Номер заказа</span>
                  <span className="font-medium text-gray-900">{order.order_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Покупатель</span>
                  <span className="font-medium text-gray-900">{user.fullName}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-3 mt-2">
                  <span className="text-gray-600 font-medium">К оплате</span>
                  <span className="text-2xl font-bold text-violet-600">5 сом</span>
                </div>
              </div>
            )}

            {/* Security badge */}
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-4 py-3 mb-6 text-sm">
              <ShieldCheck size={18} className="flex-shrink-0" />
              <span>Защищённый платёж через Finik Acquiring</span>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Pay button */}
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  <span>Создание платежа...</span>
                </>
              ) : (
                <>
                  <CreditCard size={22} />
                  <span>Оплатить 5 сом</span>
                </>
              )}
            </button>

            {/* How it works */}
            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Как это работает</p>
              {[
                'Нажмите кнопку "Оплатить"',
                'Отсканируйте QR-код в приложении Finik',
                'Подтвердите оплату в приложении',
                'Заказ автоматически подтвердится',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skip link */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/orders')}
            className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
          >
            Оплатить позже
          </button>
        </div>
      </div>
    </div>
  );
}
