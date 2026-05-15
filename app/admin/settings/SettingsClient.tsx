'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  LogOut,
  Bell,
  LayoutDashboard,
  FolderTree,
  Package,
  ShoppingCart,
  MapPin,
  FileText,
  Users,
  Globe,
  Mail,
  Phone,
  MapPinned,
  Clock,
  CreditCard,
  Bot,
  Image as ImageIcon,
  FileText as FileTextIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  status: string;
}

interface SettingsClientProps {
  user: User;
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const [settings, setSettings] = useState({
    // Общие настройки
    site_name: '',
    site_description: '',
    site_keywords: '',
    
    // Контактная информация
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    
    // Социальные сети
    social_facebook: '',
    social_instagram: '',
    social_telegram: '',
    social_whatsapp: '',
    
    // Рабочее время
    working_hours: '',
    
    // Оплата
    payment_provider: 'finik',
    payment_merchant_id: '',
    payment_api_key: '',
    
    // AI настройки
    ai_enabled: 'true',
    ai_model: 'gpt-4',
    ai_api_key: '',
    
    // SEO
    seo_title: '',
    seo_description: '',
    seo_image: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { title: 'Панель управления', icon: LayoutDashboard, href: '/admin/dashboard' },
    { title: 'Пользователи', icon: Users, href: '/admin/users' },
    { title: 'Категории', icon: FolderTree, href: '/admin/categories' },
    { title: 'Товары', icon: Package, href: '/admin/products' },
    { title: 'Баннеры', icon: ImageIcon, href: '/admin/banners' },
    { title: 'Заказы', icon: ShoppingCart, href: '#' },
    { title: 'Филиалы', icon: MapPin, href: '/admin/branches' },
    { title: 'Менеджеры', icon: Users, href: '/admin/managers' },
    { title: 'Отчеты', icon: FileText, href: '/admin/reports' },
    { title: 'Настройки', icon: Settings, active: true, href: '/admin/settings' },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      const data = await response.json();

      if (response.ok) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        setMessage('Настройки успешно сохранены');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Ошибка при сохранении настроек');
      }
    } catch (error) {
      setMessage('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#151b26]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#252d3d] border-b border-gray-800/50">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 w-72">
              <img
                src="/logonur.png"
                alt="Nur-Kitep Logo"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <h1 className="text-lg font-bold text-white">Nur-Kitep</h1>
                <p className="text-xs text-gray-400">Панель управления</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2.5 hover:bg-[#252d3d] rounded-xl transition-colors text-gray-400 hover:text-white">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full"></span>
              </button>

              <button 
                onClick={() => router.push('/admin/profile')}
                className="flex items-center gap-3 pl-3 hover:bg-[#2a3347] rounded-xl transition-colors px-3 py-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-white">{user.fullName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-[73px]">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} px-4 pt-4 flex flex-col transition-all duration-300 sticky top-[73px] self-start`}>
          <div className="bg-[#252d3d] rounded-2xl p-4 mb-4">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-4 px-2`}>
              {!sidebarCollapsed && <span className="text-sm font-semibold text-gray-400">Навигация</span>}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-[#2a3347] rounded-lg transition-all text-gray-400 hover:text-white"
                title={sidebarCollapsed ? 'Развернуть' : 'Свернуть'}
              >
                {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => item.href !== '#' && router.push(item.href)}
                  className={`w-full flex items-center justify-center ${sidebarCollapsed ? '' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl transition-all ${
                    item.active
                      ? 'bg-violet-500/15 text-violet-400'
                      : 'text-gray-400 hover:bg-[#2a3347] hover:text-white'
                  }`}
                  title={sidebarCollapsed ? item.title : ''}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-4">
            <div className="bg-[#252d3d] rounded-2xl p-4">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium text-sm transition-all`}
                title={sidebarCollapsed ? 'Выйти' : ''}
              >
                <LogOut size={16} />
                {!sidebarCollapsed && <span>Выйти</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-white mb-2">Настройки</h2>
              <p className="text-gray-400 font-semibold">
                Управление настройками системы
              </p>
            </div>

            {/* Success Message */}
            {message && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-green-400 text-sm">{message}</p>
              </div>
            )}

            {loading ? (
              <div className="bg-[#252d3d] rounded-2xl p-12 text-center border border-gray-800/50">
                <div className="inline-block w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 mt-4">Загрузка настроек...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Общие настройки */}
                <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                      <Globe className="text-violet-400" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Общие настройки</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Название сайта
                      </label>
                      <input
                        type="text"
                        value={settings.site_name}
                        onChange={(e) =>
                          setSettings({ ...settings, site_name: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                        placeholder="Nur-Kitep"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Описание сайта
                      </label>
                      <textarea
                        value={settings.site_description}
                        onChange={(e) =>
                          setSettings({ ...settings, site_description: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                        placeholder="Сеть магазинов книг и канцелярии"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Ключевые слова (через запятую)
                      </label>
                      <input
                        type="text"
                        value={settings.site_keywords}
                        onChange={(e) =>
                          setSettings({ ...settings, site_keywords: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                        placeholder="книги, канцелярия, учебники"
                      />
                    </div>
                  </div>
                </div>

                {/* Контактная информация */}
                <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <Phone className="text-blue-400" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Контактная информация</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="email"
                          value={settings.contact_email}
                          onChange={(e) =>
                            setSettings({ ...settings, contact_email: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                          placeholder="info@nur-kitep.kg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Телефон
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="tel"
                          value={settings.contact_phone}
                          onChange={(e) =>
                            setSettings({ ...settings, contact_phone: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                          placeholder="+996 XXX XXX XXX"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Адрес
                      </label>
                      <div className="relative">
                        <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          value={settings.contact_address}
                          onChange={(e) =>
                            setSettings({ ...settings, contact_address: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                          placeholder="г. Бишкек, ул. Примерная, 123"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Социальные сети */}
                <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <Globe className="text-green-400" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Социальные сети</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={settings.social_facebook}
                        onChange={(e) =>
                          setSettings({ ...settings, social_facebook: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                        placeholder="https://facebook.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={settings.social_instagram}
                        onChange={(e) =>
                          setSettings({ ...settings, social_instagram: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                        placeholder="https://instagram.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Telegram
                      </label>
                      <input
                        type="url"
                        value={settings.social_telegram}
                        onChange={(e) =>
                          setSettings({ ...settings, social_telegram: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                        placeholder="https://t.me/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={settings.social_whatsapp}
                        onChange={(e) =>
                          setSettings({ ...settings, social_whatsapp: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                        placeholder="+996 XXX XXX XXX"
                      />
                    </div>
                  </div>
                </div>

                {/* Рабочее время */}
                <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                      <Clock className="text-yellow-400" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Рабочее время</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      График работы
                    </label>
                    <textarea
                      value={settings.working_hours}
                      onChange={(e) =>
                        setSettings({ ...settings, working_hours: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                      placeholder="Пн-Пт: 9:00 - 18:00&#10;Сб-Вс: 10:00 - 16:00"
                    />
                  </div>
                </div>

                {/* Оплата */}
                <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <CreditCard className="text-emerald-400" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Настройки оплаты (Finik Pay)</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Merchant ID
                      </label>
                      <input
                        type="text"
                        value={settings.payment_merchant_id}
                        onChange={(e) =>
                          setSettings({ ...settings, payment_merchant_id: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                        placeholder="Введите Merchant ID"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={settings.payment_api_key}
                        onChange={(e) =>
                          setSettings({ ...settings, payment_api_key: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                        placeholder="Введите API Key"
                      />
                    </div>
                  </div>
                </div>

                {/* AI настройки */}
                <div className="bg-[#252d3d] rounded-2xl p-6 border border-gray-800/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                      <Bot className="text-purple-400" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">AI Помощник</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Включить AI помощника
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, ai_enabled: 'true' })}
                          className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                            settings.ai_enabled === 'true'
                              ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50'
                              : 'bg-[#1e2533] text-gray-400 border-2 border-gray-700/50 hover:border-gray-600'
                          }`}
                        >
                          Включен
                        </button>
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, ai_enabled: 'false' })}
                          className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                            settings.ai_enabled === 'false'
                              ? 'bg-red-500/20 text-red-400 border-2 border-red-500/50'
                              : 'bg-[#1e2533] text-gray-400 border-2 border-gray-700/50 hover:border-gray-600'
                          }`}
                        >
                          Выключен
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Модель AI
                      </label>
                      <select
                        value={settings.ai_model}
                        onChange={(e) =>
                          setSettings({ ...settings, ai_model: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white appearance-none cursor-pointer"
                      >
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        OpenAI API Key
                      </label>
                      <input
                        type="password"
                        value={settings.ai_api_key}
                        onChange={(e) =>
                          setSettings({ ...settings, ai_api_key: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-[#1e2533] border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500"
                        placeholder="sk-..."
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={18} />
                    <span>{saving ? 'Сохранение...' : 'Сохранить настройки'}</span>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
