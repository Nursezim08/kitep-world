'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  Grid,
  ShoppingCart,
  Package,
  MessageCircle,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useTranslation } from '@/app/i18n/client';
import { useChat } from '@/app/(user)/ChatContext';

export type UserActiveTab = 'home' | 'catalog' | 'orders' | 'cart' | 'aiChat' | 'profile' | 'none';

interface UserSidebarProps {
  active?: UserActiveTab;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  cartCount?: number;
}

/**
 * Адаптивная навигация для пользовательской части.
 * - На экранах >= lg (1024px) рендерит вертикальный sidebar (как было)
 * - На мобильных и планшетах (< lg) рендерит фиксированную нижнюю панель
 *
 * Также экспортирует helper getActiveTab(pathname).
 */
export default function UserSidebar({
  active,
  collapsed = false,
  onCollapseChange,
  cartCount,
}: UserSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation('user');
  const { openChat } = useChat();

  const currentActive: UserActiveTab = active ?? getActiveTab(pathname);

  type Item = {
    key: UserActiveTab;
    title: string;
    shortTitle?: string;
    icon: typeof Home;
    href: string;
    onClick?: () => void;
  };

  const items: Item[] = [
    { key: 'home', title: t('nav.home'), icon: Home, href: '/home' },
    { key: 'catalog', title: t('nav.catalog'), icon: Grid, href: '/catalog' },
    { key: 'cart', title: t('nav.cart'), icon: ShoppingCart, href: '/cart' },
    { key: 'orders', title: t('nav.orders'), icon: Package, href: '/orders' },
    { key: 'aiChat', title: t('nav.aiChat'), shortTitle: 'AI', icon: MessageCircle, href: '/ai-chat', onClick: openChat },
    { key: 'profile', title: t('nav.profile'), icon: User, href: '/profile' },
  ];

  // На мобильной нижней панели показываем все 6 пунктов
  const mobileItems = items;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const goTo = (item: Item) => {
    if (item.onClick) {
      item.onClick();
    } else {
      router.push(item.href);
    }
  };

  return (
    <>
      {/* Desktop sidebar (>= lg) */}
      <aside
        className={`hidden lg:flex ${collapsed ? 'w-20' : 'w-72'} px-4 pt-4 flex-col transition-all duration-300 sticky top-[57px] self-start`}
      >
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200">
          <div
            className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-4 px-2`}
          >
            {!collapsed && (
              <span className="text-sm font-semibold text-gray-500">
                {t('sidebar.navigation')}
              </span>
            )}
            <button
              onClick={() => onCollapseChange?.(!collapsed)}
              className="p-2 hover:bg-gray-50 rounded-lg transition-all text-gray-500 hover:text-gray-900"
              title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const isActive = currentActive === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => goTo(item)}
                  className={`w-full flex items-center justify-center ${collapsed ? '' : 'justify-start gap-3 px-3'} py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-violet-500/15 text-violet-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={collapsed ? item.title : ''}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-center gap-2'} px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl font-medium text-sm transition-all`}
              title={collapsed ? t('sidebar.logout') : ''}
            >
              <LogOut size={16} />
              {!collapsed && <span>{t('sidebar.logout')}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile/Tablet bottom navigation (< lg) */}
      <nav
        className="lg:hidden fixed inset-x-0 bottom-0 z-[60] bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] bottom-nav-safe"
        style={{ position: 'fixed' }}
      >
        <div className="grid grid-cols-6 h-16">
          {mobileItems.map((item) => {
            const isActive = currentActive === item.key;
            const showCartBadge =
              item.key === 'cart' && typeof cartCount === 'number' && cartCount > 0;
            return (
              <button
                key={item.key}
                onClick={() => goTo(item)}
                className={`flex flex-col items-center justify-center gap-1 px-1 transition-colors ${
                  isActive ? 'text-violet-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span className="relative">
                  <item.icon size={18} />
                  {showCartBadge && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-violet-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {cartCount! > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </span>
                <span className="text-[9px] font-medium leading-none truncate max-w-full">
                  {item.shortTitle ?? item.title}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export function getActiveTab(pathname: string | null | undefined): UserActiveTab {
  if (!pathname) return 'none';
  if (pathname === '/home' || pathname.startsWith('/home/')) return 'home';
  if (pathname.startsWith('/catalog')) return 'catalog';
  if (pathname.startsWith('/orders')) return 'orders';
  if (pathname.startsWith('/cart')) return 'cart';
  if (pathname.startsWith('/ai-chat')) return 'aiChat';
  if (pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/product')) return 'catalog';
  if (pathname.startsWith('/search')) return 'catalog';
  if (pathname.startsWith('/checkout')) return 'cart';
  if (pathname.startsWith('/payment')) return 'cart';
  return 'none';
}
