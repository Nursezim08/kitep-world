'use client';

import { Warehouse, AlertTriangle, TrendingDown, Package } from 'lucide-react';

export default function ManagerInventoryClient() {
  const lowStockItems = [
    { name: 'Блокнот А5', current: 5, min: 20, category: 'Канцелярия', sku: 'BLK-A5-001' },
    { name: 'Ручка синяя', current: 12, min: 50, category: 'Канцелярия', sku: 'PEN-BLU-001' },
    { name: 'Манас - эпос', current: 3, min: 10, category: 'Книги', sku: 'BOOK-MAN-001' },
    { name: 'Карандаш HB', current: 8, min: 30, category: 'Канцелярия', sku: 'PENC-HB-001' },
  ];

  const stats = [
    { label: 'Всего товаров', value: '1,234', icon: Package, color: 'blue' },
    { label: 'Низкий остаток', value: '8', icon: AlertTriangle, color: 'orange' },
    { label: 'Нет в наличии', value: '3', icon: TrendingDown, color: 'red' },
    { label: 'Общая стоимость', value: '2.4M с', icon: Warehouse, color: 'green' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Склад</h2>
        <p className="text-gray-600 font-medium">Управление остатками товаров</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
          >
            <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className={`text-${stat.color}-600`} size={24} />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="text-orange-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Товары с низким остатком</h3>
            <p className="text-sm text-gray-600">Требуется пополнение</p>
          </div>
        </div>

        <div className="space-y-4">
          {lowStockItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                  <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded">
                    {item.sku}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">Остаток</span>
                      <span className="text-xs font-bold text-orange-600">
                        {item.current}/{item.min}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${(item.current / item.min) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <button className="ml-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-medium text-sm">
                Заказать
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
