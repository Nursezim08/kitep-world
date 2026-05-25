'use client';

import { useState, useEffect } from 'react';
import { Warehouse, AlertTriangle, TrendingDown, Package } from 'lucide-react';

interface InventoryStats {
  total: string;
  lowStock: string;
  outOfStock: string;
  totalValue: string;
}

interface LowStockItem {
  name: string;
  sku: string;
  category: string;
  quantity: number;
}

export default function ManagerInventoryClient() {
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchLowStock();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/manager/stats');
      if (response.ok) {
        const data = await response.json();
        setInventoryStats(data.inventory);
      }
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      const response = await fetch('/api/manager/inventory/low-stock');
      if (response.ok) {
        const data = await response.json();
        setLowStockItems(data);
      }
    } catch (error) {
      console.error('Error fetching low stock:', error);
    }
  };

  const stats = [
    { label: 'Всего товаров', value: inventoryStats?.total ?? '—', icon: Package, color: 'blue' },
    { label: 'Низкий остаток', value: inventoryStats?.lowStock ?? '—', icon: AlertTriangle, color: 'orange' },
    { label: 'Нет в наличии', value: inventoryStats?.outOfStock ?? '—', icon: TrendingDown, color: 'red' },
    { label: 'Общая стоимость', value: inventoryStats?.totalValue ?? '—', icon: Warehouse, color: 'green' },
  ];

  return (
    <div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-all"
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4`}>
              <stat.icon className={`text-${stat.color}-600`} size={20} strokeWidth={2} />
            </div>
            <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">{stat.label}</p>
            {statsLoading ? (
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="text-orange-600" size={20} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-xl font-bold text-gray-900">Товары с низким остатком</h3>
            <p className="text-xs sm:text-sm text-gray-600">Требуется пополнение</p>
          </div>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Товары с низким остатком отсутствуют</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {lowStockItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-200 gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                    <h4 className="text-sm sm:text-lg font-semibold text-gray-900">{item.name}</h4>
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded">
                      {item.sku}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{item.category}</p>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex-1 max-w-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] sm:text-xs font-medium text-gray-600">Остаток</span>
                        <span className="text-[10px] sm:text-xs font-bold text-orange-600">
                          {item.quantity} шт
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((item.quantity / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="w-full sm:w-auto sm:ml-4 px-4 sm:px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-medium text-xs sm:text-sm whitespace-nowrap">
                  Заказать
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
