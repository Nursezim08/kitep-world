'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Send,
  Bot,
  Star,
} from 'lucide-react';
import UserHeader from '@/app/components/UserHeader';
import UserSidebar from '@/app/components/UserSidebar';
import { useTranslation } from '@/app/i18n/client';
import { useChat } from '@/app/(user)/ChatContext';

interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
}

interface ProductCard {
  id: string;
  name: string;
  description: string | null;
  price: number;
  brand: string | null;
  sku: string;
  imageUrl: string | null;
  averageRating: number;
  reviewsCount: number;
  categoryId: string;
  categoryName: string | null;
  inStock: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: ProductCard[];
}

interface AIChatClientProps {
  user: User;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price);
}

function ProductCardItem({ product, onClick }: { product: ProductCard; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex gap-3 bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md hover:border-violet-300 transition-all cursor-pointer"
    >
      <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <Package className="w-8 h-8 text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 line-clamp-2">{product.name}</p>
        {product.brand && <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>}
        <div className="flex items-center gap-2 mt-1">
          {product.reviewsCount > 0 && (
            <div className="flex items-center gap-0.5 text-xs text-gray-600">
              <Star className="w-3 h-3 fill-violet-600 text-violet-600" />
              <span>{product.averageRating}</span>
            </div>
          )}
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              product.inStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}
          >
            {product.inStock ? 'В наличии' : 'Нет в наличии'}
          </span>
        </div>
        <p className="text-base font-bold text-gray-900 mt-1">{formatPrice(product.price)} KGS</p>
      </div>
    </div>
  );
}

export default function AIChatClient({ user }: AIChatClientProps) {
  const router = useRouter();
  const { t } = useTranslation('user');
  const { setSidebarCollapsed: syncSidebarToContext } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => { syncSidebarToContext(sidebarCollapsed); }, [sidebarCollapsed, syncSidebarToContext]);
  const [cartCount, setCartCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchCartCount();
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content:
          'Здравствуйте! Я AI-помощник Nur-Kitep. Помогу подобрать товары из каталога. Если нужного товара нет в наличии — подберу аналоги. О чём поговорим?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Авто-рост textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [inputMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSendMessage = async () => {
    const text = inputMessage.trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await fetch('/api/user/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, messages: history }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Ошибка запроса');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || '...',
        timestamp: new Date(),
        products: Array.isArray(data.products) ? data.products : [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Не удалось получить ответ: ${error?.message || 'неизвестная ошибка'}. Попробуйте позже.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Enter — перенос строки, отправка ТОЛЬКО по кнопке.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ничего не делаем при Enter — браузер сам вставит перенос строки.
    // Перехватываем только если кто-то ожидает, что Enter отправит — явно прерываем submit формы.
    if (e.key === 'Enter') {
      // Не вызываем e.preventDefault(): иначе перенос строки не появится.
      // Гарантируем, что форма не сабмитится: textarea по умолчанию не сабмитит форму на Enter.
      return;
    }
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
        <UserSidebar
          active="aiChat"
          collapsed={sidebarCollapsed}
          onCollapseChange={setSidebarCollapsed}
          cartCount={cartCount}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-57px-64px)] lg:h-[calc(100vh-57px)] flex flex-col">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1 sm:mb-2">
                AI Помощник
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Задайте вопрос о товарах — подберу из каталога и предложу аналоги, если нужного нет в наличии
              </p>
            </div>

            {/* Chat Container */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 sm:gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] flex flex-col gap-2 ${
                        message.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                          message.role === 'user'
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.role === 'user' ? 'text-violet-200' : 'text-gray-500'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {message.role === 'assistant' && message.products && message.products.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                          {message.products.map((p) => (
                            <ProductCardItem
                              key={p.id}
                              product={p}
                              onClick={() => router.push(`/product/${p.id}`)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                        {user.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2 sm:gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleFormSubmit} className="border-t border-gray-200 p-3 sm:p-4">
                <div className="flex gap-2 sm:gap-3 items-end">
                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Напишите ваш вопрос..."
                    rows={1}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-sm text-gray-900 placeholder-gray-400 resize-none max-h-40 leading-relaxed no-scrollbar"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || loading}
                    className="px-3 sm:px-6 py-2.5 sm:py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                    <span className="hidden sm:inline">Отправить</span>
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
