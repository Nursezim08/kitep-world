'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Package, Home } from 'lucide-react';

interface PaymentSuccessClientProps {
  orderId?: string;
}

export default function PaymentSuccessClient({ orderId }: PaymentSuccessClientProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/orders');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Success header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-10 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle size={48} />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Оплата прошла!</h1>
            <p className="text-green-100">Ваш заказ успешно оплачен</p>
          </div>

          <div className="px-8 py-8 text-center">
            {orderId && (
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Номер заказа</p>
                <p className="font-mono font-semibold text-gray-900 text-sm break-all">{orderId}</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8">
              <Package size={16} />
              <span>Заказ готовится к выдаче в выбранном филиале</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/orders')}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Package size={18} />
                Мои заказы
              </button>
              <button
                onClick={() => router.push('/home')}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <Home size={18} />
                На главную
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-6">
              Автоматический переход через 5 секунд...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
