'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Home,
  Grid,
  ShoppingCart,
  Package,
  MessageCircle,
  User,
  ChevronRight,
  Star,
  Bell,
  Heart,
  ChevronLeft,
  LogOut,
  ArrowLeft,
  Plus,
  Minus,
  ShoppingBag,
} from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
}

interface ProductTranslation {
  locale: 'ru' | 'kg';
  name: string;
  description: string | null;
}

interface ProductImage {
  id: string;
  imageUrl: string;
}

interface CategoryTranslation {
  locale: 'ru' | 'kg';
  name: string;
}

interface Category {
  id: string;
  translations: CategoryTranslation[];
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    avatar: string | null;
  };
}

interface Product {
  id: string;
  sku: string;
  brand: string | null;
  price: number;
  status: string;
  translations: ProductTranslation[];
  images: ProductImage[];
  category: Category;
  reviews: Review[];
  averageRating: number;
  _count: {
    reviews: number;
  };
}

interface ProductDetailClientProps {
  user: User;
  productId: string;
}

export default function ProductDetailClient({ user, productId }: ProductDetailClientProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [inCart, setInCart] = useState(false);
  const [cartItemId, setCartItemId] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
    fetchCartCount();
    checkIfInCart();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/products/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      } else {
        router.push('/catalog');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/catalog');
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/user/cart');
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.cartItems.length);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const checkIfInCart = async () => {
    try {
      const response = await fetch('/api/user/cart');
      if (response.ok) {
        const data = await response.json();
        const cartItem = data.cartItems.find((item: any) => item.product.id === productId);
        if (cartItem) {
          setInCart(true);
          setCartItemId(cartItem.id);
          setQuantity(cartItem.quantity);
        }
      }
    } catch (error) {
      console.error('Error checking cart:', error);
    }
  };

  const addToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);

    try {
      const response = await fetch('/api/user/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      });

      if (response.ok) {
        const data = await response.json();
        setInCart(true);
        setCartItemId(data.cartItem.id);
        await fetchCartCount();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const updateCartQuantity = async (newQuantity: number) => {
    if (!cartItemId || newQuantity < 1) return;

    try {
      const response = await fetch(`/api/user/cart/${cartItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        setQuantity(newQuantity);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const getProductName = (product: Product) => {
    return product.translations.find((t) => t.locale === 'ru')?.name || 'Без названия';
  };

  const getProductDescription = (product: Product) => {
    return product.translations.find((t) => t.locale === 'ru')?.description || '';
  };

  const getCategoryName = (category: Category) => {
    return category.translations.find((t) => t.locale === 'ru')?.name || 'Без категории';
  };

  const menuItems = [
    { title: 'Главная', icon: Home, href: '/home', active: false },
    { title: 'Каталог', icon: Grid, href: '/catalog', active: false },
    { title: 'Заказы', icon: Package, href: '/orders', active: false },
    { title: 'Корзина', icon: ShoppingCart, href: '/cart', active: false },
    { title: 'AI Чат', icon: MessageCircle, href: '/ai-chat', active: false },
    { title: 'Профиль', icon: User, href: '/profile', active: false },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 w-72">
              <img 
                src="/logonur.png" 
                alt="Nur-Kitep Logo" 
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Nur-Kitep
                </h1>
                <p className="text-xs text-gray-500">Книги и канцелярия</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-sm text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* User & Notifications */}
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 hover:text-gray-900">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full"></span>
              </button>

              <button 
                onClick={() => router.push('/cart')}
                className="relative p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => router.push('/profile')}
                className="flex items-center gap-3 pl-3 hover:bg-gray-50 rounded-xl transition-colors px-3 py-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-[73px]">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} px-4 pt-4 flex flex-col transition-all duration-300 sticky top-[73px] self-start`}>
          {/* Main Navigation Card */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-4 px-2`}>
              {!sidebarCollapsed && <span className="text-sm font-semibold text-gray-500">Навигация</span>}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-all text-gray-500 hover:text-gray-900"
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
                      ? 'bg-violet-500/15 text-violet-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={sidebarCollapsed ? item.title : ''}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Actions Card */}
          {!sidebarCollapsed && (
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4 px-2">
                <span className="text-sm font-semibold text-gray-500">Быстрые действия</span>
              </div>
              
              <div className="space-y-1">
                <button
                  onClick={() => router.push('/catalog')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                  <Grid size={18} className="flex-shrink-0" />
                  <span className="text-sm font-medium">Каталог</span>
                </button>
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                  <Package size={18} className="flex-shrink-0" />
                  <span className="text-sm font-medium">Мои заказы</span>
                </button>
              </div>
            </div>
          )}

          {/* Logout Button Card */}
          <div className="mt-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl font-medium text-sm transition-all`}
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
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
            >
              <ArrowLeft size={20} />
              <span>Назад к каталогу</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
              {/* Left Column: Images */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="bg-gray-100 rounded-3xl p-8 aspect-square relative">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[selectedImage].imageUrl}
                      alt={getProductName(product)}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Package className="w-32 h-32 mx-auto mb-4" />
                        <p className="text-lg">Изображение отсутствует</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnails (horizontal below main image) - Show if there are images */}
                {product.images.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto violet-scrollbar pb-2">
                    {product.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 bg-white rounded-xl border-2 transition-all overflow-hidden ${
                          selectedImage === index
                            ? 'border-violet-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image.imageUrl}
                          alt={`${getProductName(product)} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Product Info, Characteristics & Description */}
              <div className="space-y-6">
                {/* Brand & Badge */}
                <div className="flex items-center gap-3">
                  {product.brand && (
                    <span className="text-lg font-bold text-gray-900">{product.brand}</span>
                  )}
                  <span className="px-3 py-1 bg-violet-100 text-violet-600 rounded-full text-xs font-semibold">
                    Оригинал
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {getProductName(product)}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {product.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    · {product._count.reviews} оценок
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-violet-600">
                    {product.price} сом
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {!inCart ? (
                    <button
                      onClick={addToCart}
                      disabled={addingToCart}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all"
                    >
                      {addingToCart ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Добавление...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={18} />
                          <span>Добавить в корзину</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateCartQuantity(quantity - 1)}
                        disabled={quantity <= 1}
                        className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <Minus size={20} />
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-2xl font-bold text-gray-900">{quantity}</span>
                        <p className="text-xs text-gray-500 mt-1">В корзине</p>
                      </div>
                      <button
                        onClick={() => updateCartQuantity(quantity + 1)}
                        className="w-12 h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  )}

                  <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-xl font-semibold text-sm transition-all">
                    <span>Купить сейчас</span>
                  </button>
                </div>

                {/* Category Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">{getCategoryName(product.category)}</span>
                    <span>★ {product.averageRating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Product Details Table */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Характеристики и описание</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="grid grid-cols-2 gap-4 py-2">
                      <span className="text-sm text-gray-600">Артикул</span>
                      <span className="text-sm text-gray-900 font-medium">{product.sku}</span>
                    </div>
                    
                    {product.brand && (
                      <div className="grid grid-cols-2 gap-4 py-2">
                        <span className="text-sm text-gray-600">Бренд</span>
                        <span className="text-sm text-gray-900 font-medium">{product.brand}</span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 py-2">
                      <span className="text-sm text-gray-600">Категория</span>
                      <span className="text-sm text-gray-900 font-medium">{getCategoryName(product.category)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-2">
                      <span className="text-sm text-gray-600">Статус</span>
                      <span className="text-sm text-gray-900 font-medium">В наличии</span>
                    </div>
                  </div>

                  {/* Description */}
                  {getProductDescription(product) && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-base font-bold text-gray-900 mb-3">Описание</h4>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {getProductDescription(product)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Section (Full Width at Bottom) */}
            {product.reviews.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Отзывы ({product._count.reviews})
                </h2>
                
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {review.user.fullName.charAt(0)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-900">{review.user.fullName}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={`${
                                  i < review.rating
                                    ? 'fill-violet-600 text-violet-600'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          
                          {review.comment && (
                            <p className="text-gray-700">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
