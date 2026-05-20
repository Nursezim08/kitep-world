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
  Copy,
  Check,
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
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [relatedCurrentPage, setRelatedCurrentPage] = useState(1);
  const relatedItemsPerPage = 100;

  useEffect(() => {
    fetchProduct();
    fetchCartCount();
    checkIfInCart();
  }, [productId]);

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  // Сброс на первую страницу при изменении товара
  useEffect(() => {
    setRelatedCurrentPage(1);
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

  const fetchRelatedProducts = async () => {
    if (!product) return;
    
    try {
      // Загружаем ВСЕ товары из той же категории
      const sameCategoryRes = await fetch(`/api/user/products?categoryId=${product.category.id}&limit=1000`);
      let sameCategoryProducts: Product[] = [];
      
      if (sameCategoryRes.ok) {
        const sameCategoryData = await sameCategoryRes.json();
        // Поддержка нового формата API
        const products = sameCategoryData.products || sameCategoryData;
        // Исключаем текущий товар
        sameCategoryProducts = products.filter((p: Product) => p.id !== productId);
      }
      
      // Загружаем ВСЕ товары из других категорий
      const allProductsRes = await fetch(`/api/user/products?limit=1000`);
      let otherProducts: Product[] = [];
      
      if (allProductsRes.ok) {
        const allProductsData = await allProductsRes.json();
        // Поддержка нового формата API
        const products = allProductsData.products || allProductsData;
        // Исключаем текущий товар и товары из той же категории
        otherProducts = products.filter(
          (p: Product) => p.id !== productId && !sameCategoryProducts.find((sp: Product) => sp.id === p.id)
        );
      }
      
      // Объединяем: сначала товары из той же категории, потом из других
      setRelatedProducts([...sameCategoryProducts, ...otherProducts]);
    } catch (error) {
      console.error('Error fetching related products:', error);
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

  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(`${label}: ${value}`);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
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
        <div className="px-8 py-2.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 w-72">
              <img 
                src="/logonur.png" 
                alt="Nur-Kitep Logo" 
                className="w-9 h-9 rounded-xl object-cover"
              />
              <div>
                <h1 className="text-base font-bold text-gray-900">
                  Nur-Kitep
                </h1>
                <p className="text-[10px] text-gray-500">Книги и канцелярия</p>
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
              <button className="relative p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 hover:text-gray-900">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full"></span>
              </button>

              <button 
                onClick={() => router.push('/cart')}
                className="relative p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => router.push('/profile')}
                className="flex items-center gap-2.5 hover:bg-gray-50 rounded-xl transition-colors px-2.5 py-1.5"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                  <p className="text-[10px] text-gray-500">{user.email}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-[57px]">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} px-4 pt-4 flex flex-col transition-all duration-300 sticky top-[57px] self-start`}>
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
                  onClick={() => {
                    console.log('Navigating to:', item.href);
                    router.push(item.href);
                  }}
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
                <div className="aspect-square relative">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[selectedImage].imageUrl}
                      alt={getProductName(product)}
                      className="w-full h-full object-contain rounded-3xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-3xl">
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

                {/* Description (2 lines with expand button) */}
                {getProductDescription(product) && (
                  <div className="space-y-1">
                    <p className={`text-sm text-gray-700 leading-relaxed ${isDescriptionExpanded ? '' : 'line-clamp-2'}`}>
                      {getProductDescription(product)}
                    </p>
                    <button 
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                    >
                      {isDescriptionExpanded ? 'Свернуть' : 'Развернуть'}
                    </button>
                  </div>
                )}

                {/* Rating & Price */}
                <div className="flex items-center gap-8">
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
                  
                  <span className="text-2xl font-bold text-violet-600">
                    {product.price} сом
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col items-start gap-2">
                  {!inCart ? (
                    <button
                      onClick={addToCart}
                      disabled={addingToCart}
                      className="w-64 h-12 flex items-center justify-center gap-2 px-6 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all"
                    >
                      {addingToCart ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Добавление...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} />
                          <span>Добавить в корзину</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 w-64 h-12">
                      {/* Счетчик в сером блоке */}
                      <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 h-full">
                        <button
                          onClick={async () => {
                            if (quantity === 1) {
                              // Удаляем товар из корзины
                              try {
                                const response = await fetch(`/api/user/cart/${cartItemId}`, {
                                  method: 'DELETE',
                                });
                                if (response.ok) {
                                  setInCart(false);
                                  setCartItemId(null);
                                  setQuantity(1);
                                  await fetchCartCount();
                                }
                              } catch (error) {
                                console.error('Error removing from cart:', error);
                              }
                            } else {
                              updateCartQuantity(quantity - 1);
                            }
                          }}
                          className="text-violet-600 hover:text-violet-700 transition-colors"
                        >
                          <Minus size={16} strokeWidth={3} />
                        </button>
                        <span className="text-lg font-bold text-gray-900 min-w-[24px] text-center">{quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(quantity + 1)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Plus size={16} strokeWidth={3} />
                        </button>
                      </div>
                      
                      {/* Кнопка В корзине */}
                      <button
                        onClick={() => router.push('/cart')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 h-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-all"
                      >
                        <span>В корзине</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
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
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Характеристики</h3>
                  
                  <div className="space-y-2 mb-6">
                    {/* Артикул */}
                    <div className="group flex items-baseline justify-between py-2 hover:bg-gray-50 px-3 rounded-lg transition-colors">
                      <div className="flex items-baseline gap-2 flex-1 min-w-0">
                        <span className="text-sm text-gray-600 whitespace-nowrap">Артикул</span>
                        <div className="flex-1 border-b border-dotted border-gray-300 min-w-[20px] mb-1"></div>
                        <span className="text-sm text-gray-900 font-medium">{product.sku}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('Артикул', product.sku)}
                        className="ml-3 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                        title="Копировать"
                      >
                        {copiedField === 'Артикул' ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} className="text-gray-600" />
                        )}
                      </button>
                    </div>
                    
                    {/* Бренд */}
                    {product.brand && (
                      <div className="group flex items-baseline justify-between py-2 hover:bg-gray-50 px-3 rounded-lg transition-colors">
                        <div className="flex items-baseline gap-2 flex-1 min-w-0">
                          <span className="text-sm text-gray-600 whitespace-nowrap">Бренд</span>
                          <div className="flex-1 border-b border-dotted border-gray-300 min-w-[20px] mb-1"></div>
                          <span className="text-sm text-gray-900 font-medium">{product.brand}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard('Бренд', product.brand!)}
                          className="ml-3 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                          title="Копировать"
                        >
                          {copiedField === 'Бренд' ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} className="text-gray-600" />
                          )}
                        </button>
                      </div>
                    )}
                    
                    {/* Категория */}
                    <div className="group flex items-baseline justify-between py-2 hover:bg-gray-50 px-3 rounded-lg transition-colors">
                      <div className="flex items-baseline gap-2 flex-1 min-w-0">
                        <span className="text-sm text-gray-600 whitespace-nowrap">Категория</span>
                        <div className="flex-1 border-b border-dotted border-gray-300 min-w-[20px] mb-1"></div>
                        <span className="text-sm text-gray-900 font-medium">{getCategoryName(product.category)}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('Категория', getCategoryName(product.category))}
                        className="ml-3 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                        title="Копировать"
                      >
                        {copiedField === 'Категория' ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} className="text-gray-600" />
                        )}
                      </button>
                    </div>
                    
                    {/* Статус */}
                    <div className="group flex items-baseline justify-between py-2 hover:bg-gray-50 px-3 rounded-lg transition-colors">
                      <div className="flex items-baseline gap-2 flex-1 min-w-0">
                        <span className="text-sm text-gray-600 whitespace-nowrap">Статус</span>
                        <div className="flex-1 border-b border-dotted border-gray-300 min-w-[20px] mb-1"></div>
                        <span className="text-sm text-gray-900 font-medium">В наличии</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('Статус', 'В наличии')}
                        className="ml-3 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                        title="Копировать"
                      >
                        {copiedField === 'Статус' ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} className="text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section (Full Width at Bottom) */}
            <div className="mt-8 bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Отзывы
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Примерные отзывы - только вторая строка */}
                {[
                  {
                    id: '4',
                    userName: 'Дмитрий',
                    date: '13 мая',
                    rating: 5,
                    comment: 'Товар пришел быстро, упаковка отличная. Качество на высоте!',
                    tags: ['КАЧЕСТВО', 'ДОСТАВКА']
                  },
                  {
                    id: '5',
                    userName: 'Ольга',
                    date: '12 мая',
                    rating: 4,
                    comment: 'Хороший товар за свою цену. Рекомендую!',
                    tags: ['ЦЕНА', 'КАЧЕСТВО']
                  },
                  {
                    id: '6',
                    userName: 'Сергей',
                    date: '11 мая',
                    rating: 5,
                    comment: 'Очень доволен покупкой. Буду заказывать еще.',
                    tags: ['КАЧЕСТВО']
                  },
                ].map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-2xl p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{review.userName}</h4>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${
                              i < review.rating
                                ? 'fill-orange-400 text-orange-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {review.tags && review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {review.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Comment */}
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* View All Button */}
              <div className="mt-6 flex justify-center">
                <button className="px-6 py-3 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-xl font-semibold text-sm transition-all">
                  Смотреть все отзывы
                </button>
              </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
              <div id="related-products" className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Смотрите также
                </h2>
                
                {(() => {
                  // Пагинация для похожих товаров
                  const totalRelatedPages = Math.ceil(relatedProducts.length / relatedItemsPerPage);
                  const relatedStartIndex = (relatedCurrentPage - 1) * relatedItemsPerPage;
                  const relatedEndIndex = relatedStartIndex + relatedItemsPerPage;
                  const paginatedRelatedProducts = relatedProducts.slice(relatedStartIndex, relatedEndIndex);

                  return (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {paginatedRelatedProducts.map((relatedProduct) => (
                          <div
                            key={relatedProduct.id}
                            onClick={() => router.push(`/product/${relatedProduct.id}`)}
                            className="bg-gray-50 rounded-3xl overflow-hidden cursor-pointer transition-all hover:shadow-lg group"
                          >
                            {/* Image */}
                            <div className="relative p-4 aspect-square">
                              {relatedProduct.images.length > 0 ? (
                                <img
                                  src={relatedProduct.images[0].imageUrl}
                                  alt={getProductName(relatedProduct)}
                                  className="w-full h-full object-contain rounded-2xl"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white rounded-2xl">
                                  <Package className="w-16 h-16 text-gray-300" />
                                </div>
                              )}
                              
                              {/* Favorite Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="absolute top-6 right-6 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                              >
                                <Heart size={18} className="text-gray-700" />
                              </button>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                              <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
                                {getProductName(relatedProduct)}
                              </h3>

                              {/* Rating */}
                              <div className="flex items-center gap-2 mb-3">
                                <div className="relative w-4 h-4">
                                  <Star className="absolute inset-0 text-gray-300" size={16} />
                                  <div
                                    className="absolute inset-0 overflow-hidden"
                                    style={{ width: `${(relatedProduct.averageRating / 5) * 100}%` }}
                                  >
                                    <Star className="fill-violet-600 text-violet-600" size={16} />
                                  </div>
                                </div>
                                <span className="text-xs text-gray-600">
                                  {relatedProduct.averageRating.toFixed(1)} | {relatedProduct._count.reviews} отзывов
                                </span>
                              </div>

                              {/* Price */}
                              <div className="text-2xl font-bold text-gray-900">
                                {relatedProduct.price} сом
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination for Related Products */}
                      {totalRelatedPages > 1 && (
                        <div className="mt-8 flex flex-col items-center gap-4">
                          <div className="flex items-center gap-2">
                            {/* Previous Button */}
                            <button
                              onClick={() => {
                                setRelatedCurrentPage((prev) => Math.max(1, prev - 1));
                                window.scrollTo({ top: document.getElementById('related-products')?.offsetTop || 0, behavior: 'smooth' });
                              }}
                              disabled={relatedCurrentPage === 1}
                              className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-gray-700"
                            >
                              Назад
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-2">
                              {/* First Page */}
                              {relatedCurrentPage > 3 && (
                                <>
                                  <button
                                    onClick={() => {
                                      setRelatedCurrentPage(1);
                                      window.scrollTo({ top: document.getElementById('related-products')?.offsetTop || 0, behavior: 'smooth' });
                                    }}
                                    className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
                                  >
                                    1
                                  </button>
                                  {relatedCurrentPage > 4 && (
                                    <span className="text-gray-400">...</span>
                                  )}
                                </>
                              )}

                              {/* Current Page Range */}
                              {Array.from({ length: totalRelatedPages }, (_, i) => i + 1)
                                .filter((page) => {
                                  return (
                                    page === relatedCurrentPage ||
                                    page === relatedCurrentPage - 1 ||
                                    page === relatedCurrentPage + 1 ||
                                    (relatedCurrentPage <= 2 && page <= 3) ||
                                    (relatedCurrentPage >= totalRelatedPages - 1 && page >= totalRelatedPages - 2)
                                  );
                                })
                                .map((page) => (
                                  <button
                                    key={page}
                                    onClick={() => {
                                      setRelatedCurrentPage(page);
                                      window.scrollTo({ top: document.getElementById('related-products')?.offsetTop || 0, behavior: 'smooth' });
                                    }}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all text-sm font-medium ${
                                      relatedCurrentPage === page
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                ))}

                              {/* Last Page */}
                              {relatedCurrentPage < totalRelatedPages - 2 && (
                                <>
                                  {relatedCurrentPage < totalRelatedPages - 3 && (
                                    <span className="text-gray-400">...</span>
                                  )}
                                  <button
                                    onClick={() => {
                                      setRelatedCurrentPage(totalRelatedPages);
                                      window.scrollTo({ top: document.getElementById('related-products')?.offsetTop || 0, behavior: 'smooth' });
                                    }}
                                    className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
                                  >
                                    {totalRelatedPages}
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Next Button */}
                            <button
                              onClick={() => {
                                setRelatedCurrentPage((prev) => Math.min(totalRelatedPages, prev + 1));
                                window.scrollTo({ top: document.getElementById('related-products')?.offsetTop || 0, behavior: 'smooth' });
                              }}
                              disabled={relatedCurrentPage === totalRelatedPages}
                              className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-gray-700"
                            >
                              Вперед
                            </button>
                          </div>

                          {/* Page Info */}
                          <p className="text-sm text-gray-600">
                            Страница {relatedCurrentPage} из {totalRelatedPages} · Показано {relatedStartIndex + 1}-{Math.min(relatedEndIndex, relatedProducts.length)} из {relatedProducts.length} товаров
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
