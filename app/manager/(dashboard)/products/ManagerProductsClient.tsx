'use client';

import { useState } from 'react';
import { Package, Search, Filter, Plus, Edit, Trash2 } from 'lucide-react';

export default function ManagerProductsClient() {
  const [searchQuery, setSearchQuery] = useState('');

  const products = [
    {
      id: '1',
      name: 'Блокнот А5',
      sku: 'BLK-A5-001',
      category: 'Канцелярия',
      price: '₸450',
      stock: 45,
      image: '/placeholder-product.jpg',
    },
    {
      id: '2',
      name: 'Ручка синяя',
      sku: 'PEN-BLU-001',
      category: 'Канцелярия',
      price: '₸120',
      stock: 156,
      image: '/placeholder-product.jpg',
    },
    {
      id: '3',
      name: 'Манас - эпос',
      sku: 'BOOK-MAN-001',
      category: 'Книги',
      price: '₸2,500',
      stock: 23,
      image: '/placeholder-product.jpg',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Товары</h2>
        <p className="text-gray-600 font-medium">Управление товарами филиала</p>
      </div>

      {/* Search & Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium text-sm">
            <Plus size={18} />
            Добавить товар
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group"
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <Package className="text-gray-400" size={64} />
            </div>
            <div className="p-6">
              <div className="mb-4">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {product.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                <span className="text-sm text-gray-600">
                  Остаток: <span className="font-semibold">{product.stock}</span>
                </span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all">
                  <Edit size={16} />
                  Редактировать
                </button>
                <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
