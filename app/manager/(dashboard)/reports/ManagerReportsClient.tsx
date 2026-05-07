'use client';

import { FileText, Download, TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react';

export default function ManagerReportsClient() {
  const reports = [
    {
      title: 'Отчет по продажам',
      description: 'Детальная статистика продаж за период',
      icon: DollarSign,
      color: 'green',
      period: 'За месяц',
    },
    {
      title: 'Отчет по заказам',
      description: 'Анализ заказов и их статусов',
      icon: ShoppingCart,
      color: 'blue',
      period: 'За неделю',
    },
    {
      title: 'Отчет по товарам',
      description: 'Популярные товары и остатки',
      icon: Package,
      color: 'indigo',
      period: 'За месяц',
    },
    {
      title: 'Финансовый отчет',
      description: 'Доходы, расходы и прибыль',
      icon: TrendingUp,
      color: 'purple',
      period: 'За квартал',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Отчеты</h2>
        <p className="text-gray-600 font-medium">Аналитика и статистика филиала</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 bg-${report.color}-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <report.icon className={`text-${report.color}-600`} size={28} />
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {report.period}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{report.title}</h3>
            <p className="text-sm text-gray-600 mb-6">{report.description}</p>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium text-sm">
              <Download size={18} />
              Скачать отчет
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
