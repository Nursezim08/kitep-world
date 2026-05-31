"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Grid,
  Package,
  ChevronRight,
  Star,
  Heart,
  TrendingUp,
  BookOpen,
  Pen,
  Palette,
  Briefcase,
  GraduationCap,
  Scissors,
  Loader2,
} from "lucide-react";
import UserHeader from "@/app/components/UserHeader";
import UserSidebar from "@/app/components/UserSidebar";
import { useTranslation } from "@/app/i18n/client";
import { useChat } from "@/app/(user)/ChatContext";

interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
}

interface CategoryTranslation {
  locale: "ru" | "kg";
  name: string;
}

interface Category {
  id: string;
  image: string | null;
  translations: CategoryTranslation[];
  _count: {
    products: number;
  };
}

interface ProductTranslation {
  locale: "ru" | "kg";
  name: string;
  description: string | null;
}

interface ProductImage {
  imageUrl: string;
}

interface Product {
  id: string;
  sku: string;
  price: number;
  translations: ProductTranslation[];
  images: ProductImage[];
  averageRating: number;
  totalSold: number;
  _count: {
    reviews: number;
  };
}

interface Banner {
  id: string;
  title: string;
  desktopImage: string;
  mobileImage: string;
  url: string | null;
}

interface HomeClientProps {
  user: User;
}

export default function HomeClient({ user }: HomeClientProps) {
  const router = useRouter();
  const { t } = useTranslation('user');
  const { setSidebarCollapsed: syncSidebarToContext } = useChat();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => { syncSidebarToContext(sidebarCollapsed); }, [sidebarCollapsed, syncSidebarToContext]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    // Определяем тип устройства
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Загружаем категории
      const categoriesRes = await fetch("/api/user/categories");
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      // Загружаем популярные товары
      const productsRes = await fetch(
        "/api/user/products?popular=true&limit=8",
      );
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || productsData);
      }

      // Загружаем баннеры
      const bannersRes = await fetch("/api/user/banners");
      if (bannersRes.ok) {
        const bannersData = await bannersRes.json();
        setBanners(bannersData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await fetch("/api/user/cart");
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.cartItems.length);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCartCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getCategoryName = (category: Category) => {
    return (
      category.translations.find((t) => t.locale === "ru")?.name ||
      "Без названия"
    );
  };

  const getProductName = (product: Product) => {
    return (
      product.translations.find((t) => t.locale === "ru")?.name ||
      "Без названия"
    );
  };

  // Функция для получения иконки категории по названию
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes("книг") || name.includes("китеп")) return BookOpen;
    if (name.includes("канцеляр") || name.includes("канцтовар")) return Pen;
    if (name.includes("творчест") || name.includes("искусств")) return Palette;
    if (name.includes("офис") || name.includes("бизнес")) return Briefcase;
    if (name.includes("школ") || name.includes("учеб")) return GraduationCap;
    if (name.includes("ножниц") || name.includes("инструмент")) return Scissors;
    return Grid; // По умолчанию
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader
        user={user}
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
      />

      <div className="flex pt-[57px] pb-16 lg:pb-0">
        {/* Sidebar / Bottom Navigation */}
        <UserSidebar
          active="home"
          collapsed={sidebarCollapsed}
          onCollapseChange={setSidebarCollapsed}
          cartCount={cartCount}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="p-4 sm:p-6 lg:p-8">
            {/* Banner */}
            {loading ? (
              <div className="mb-6 sm:mb-8 relative rounded-2xl overflow-hidden shadow-xl">
                <div className="relative h-40 sm:h-60 lg:h-72 bg-gray-100 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                  <span className="text-gray-500 text-sm font-medium">Загрузка баннера...</span>
                </div>
              </div>
            ) : banners.length > 0 ? (
              <div className="mb-6 sm:mb-8 relative rounded-2xl overflow-hidden shadow-xl">
                <div className="relative h-40 sm:h-60 lg:h-72">
                  {banners.map((banner, index) => (
                    <div
                      key={banner.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentBanner ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <img
                        src={
                          isMobile ? banner.mobileImage : banner.desktopImage
                        }
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
                        <h2 className="text-xl sm:text-2xl lg:text-4xl font-extrabold text-white mb-2">
                          {banner.title}
                        </h2>
                        {banner.url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(banner.url!);
                            }}
                            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-violet-600 rounded-xl font-bold hover:shadow-lg transition-all text-sm sm:text-base"
                          >
                            Подробнее
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Banner Indicators */}
                {banners.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {banners.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentBanner(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentBanner
                            ? "bg-white w-8"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Fallback banner если нет баннеров в БД (после загрузки)
              <div className="mb-6 sm:mb-8 relative rounded-2xl overflow-hidden shadow-xl">
                <div className="relative h-40 sm:h-60 lg:h-72 bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-600">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

                  <div className="relative h-full flex items-center">
                    <div className="container mx-auto px-4 sm:px-8">
                      <div className="max-w-2xl">
                        <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-bold mb-2 sm:mb-4">
                          🎉 {t('home.newSeason')}
                        </div>
                        <h1 className="text-xl sm:text-3xl lg:text-5xl font-extrabold text-white mb-2 sm:mb-4 leading-tight">
                          {t('home.welcomeTitle')}
                        </h1>
                        <p className="hidden sm:block text-base sm:text-xl text-white/90 mb-4 sm:mb-6 font-medium">
                          {t('home.welcomeSub')}
                        </p>
                        <button
                          onClick={() => router.push("/catalog")}
                          className="inline-flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-4 bg-white text-violet-600 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all text-sm sm:text-base"
                        >
                          {t('home.toCatalog')}
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-10 right-32 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl"></div>
                </div>
              </div>
            )}

            {/* Categories */}
            <section className="mb-8 sm:mb-12">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                    {t('home.categoriesTitle')}
                  </h2>
                </div>
                <button
                  onClick={() => router.push("/catalog/categories")}
                  className="flex items-center gap-1 sm:gap-2 text-violet-600 hover:text-violet-700 font-semibold text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">{t('home.allCategories')}</span>
                  <span className="sm:hidden">Все</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-4 sm:p-6 animate-pulse"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-xl mb-3 sm:mb-4 mx-auto" />
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {categories.slice(0, 6).map((category) => {
                    const categoryName = getCategoryName(category);
                    const CategoryIcon = getCategoryIcon(categoryName);

                    return (
                      <button
                        key={category.id}
                        onClick={() =>
                          router.push(`/catalog?category=${category.id}`)
                        }
                        className="group bg-white rounded-2xl p-3 sm:p-6 hover:shadow-xl transition-all border border-gray-100 hover:border-violet-200"
                      >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl flex items-center justify-center mb-2 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={categoryName}
                              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                            />
                          ) : (
                            <CategoryIcon className="w-6 h-6 sm:w-8 sm:h-8 text-violet-600" />
                          )}
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 text-center mb-0.5 sm:mb-1 line-clamp-2">
                          {categoryName}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 text-center">
                          {category._count.products} {t('home.items')}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Popular Products */}
            <section>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                      {t('home.popularTitle')}
                    </h2>
                  </div>
                  <p className="hidden sm:block text-gray-600">
                    {t('home.popularSub')}
                  </p>
                </div>
                <button
                  onClick={() => router.push("/catalog")}
                  className="flex items-center gap-1 sm:gap-2 text-violet-600 hover:text-violet-700 font-semibold text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">{t('home.allProducts')}</span>
                  <span className="sm:hidden">Все</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl overflow-hidden animate-pulse"
                    >
                      <div className="aspect-square bg-gray-200" />
                      <div className="p-3 sm:p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-10 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {products.map((product) => {
                    const mainImage = product.images[0];
                    return (
                      <div
                        key={product.id}
                        onClick={() => router.push(`/product/${product.id}`)}
                        className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all border border-gray-200 cursor-pointer"
                      >
                        {/* Product Image */}
                        <div className="relative aspect-square bg-white overflow-hidden p-2 sm:p-4">
                          {mainImage ? (
                            <img
                              src={mainImage.imageUrl}
                              alt={getProductName(product)}
                              className="w-full h-full object-contain rounded-xl"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center rounded-xl">
                              <Package className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300" />
                            </div>
                          )}

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Add to wishlist
                            }}
                            className="absolute top-3 right-3 sm:top-6 sm:right-6 p-2 sm:p-2.5 bg-white rounded-full hover:bg-gray-50 transition-all shadow-md"
                          >
                            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                          </button>
                        </div>

                        {/* Product Info */}
                        <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                            {getProductName(product)}
                          </h3>

                          {/* Rating and Price */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {/* Star with partial fill */}
                              <div className="relative w-4 h-4">
                                {/* Background star (empty) */}
                                <Star className="w-4 h-4 text-gray-300 absolute top-0 left-0" />
                                {/* Foreground star (filled) with clip */}
                                <div
                                  className="absolute top-0 left-0 overflow-hidden"
                                  style={{
                                    width: `${(product.averageRating / 5) * 100}%`,
                                  }}
                                >
                                  <Star className="w-4 h-4 fill-violet-600 text-violet-600" />
                                </div>
                              </div>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900">
                                {product.averageRating > 0
                                  ? product.averageRating.toFixed(1)
                                  : "0"}
                              </span>
                            </div>

                            {/* Price */}
                            <span className="text-sm sm:text-base font-bold text-gray-900">
                              {product.price}с
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
