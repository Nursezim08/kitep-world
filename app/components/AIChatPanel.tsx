'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, X, Maximize2, Minimize2, Send, Package, Star } from 'lucide-react';
import { useChat } from '@/app/(user)/ChatContext';

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

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price);
}

function ProductCardItem({ product, onClick }: { product: ProductCard; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex gap-2 bg-white border border-gray-200 rounded-xl p-2 hover:shadow-md hover:border-violet-300 transition-all cursor-pointer"
    >
      <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <Package className="w-6 h-6 text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-xs text-gray-900 line-clamp-2 leading-tight">{product.name}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {product.reviewsCount > 0 && (
            <div className="flex items-center gap-0.5 text-[10px] text-gray-600">
              <Star className="w-2.5 h-2.5 fill-violet-600 text-violet-600" />
              <span>{product.averageRating}</span>
            </div>
          )}
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
              product.inStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}
          >
            {product.inStock ? 'В наличии' : 'Нет'}
          </span>
        </div>
        <p className="text-sm font-bold text-gray-900 mt-0.5">{formatPrice(product.price)} KGS</p>
      </div>
    </div>
  );
}

export default function AIChatPanel() {
  const router = useRouter();
  const { isOpen, closeChat, sidebarCollapsed } = useChat();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 380, height: 520 });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!initialized) {
      setPosition({
        x: Math.max(20, window.innerWidth - 420),
        y: Math.max(20, window.innerHeight - 560),
      });
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content:
            'Здравствуйте! Я AI-помощник Nur-Kitep. Помогу подобрать товары из каталога. Если нужного товара нет в наличии — предложу аналоги.',
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Авто-рост textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [inputMessage]);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (isFullscreen) return;
      e.preventDefault();

      const startX = e.clientX - position.x;
      const startY = e.clientY - position.y;

      const onMouseMove = (e: MouseEvent) => {
        const x = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - startX));
        const y = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - startY));
        setPosition({ x, y });
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [isFullscreen, position, size.width],
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Fixed right and bottom edges; top-left corner moves
      const rightEdge = position.x + size.width;
      const bottomEdge = position.y + size.height;

      const onMouseMove = (e: MouseEvent) => {
        const newX = Math.min(e.clientX, rightEdge - 300);
        const newY = Math.min(e.clientY, bottomEdge - 400);
        const newWidth = rightEdge - newX;
        const newHeight = bottomEdge - newY;
        setPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
        setSize({ width: newWidth, height: newHeight });
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [position, size],
  );

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
          content: `Не удалось получить ответ: ${error?.message || 'неизвестная ошибка'}.`,
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

  // Enter — перенос строки, отправка только по кнопке.
  // Textarea по умолчанию не сабмитит форму на Enter, поэтому ничего блокировать не нужно.
  const handleKeyDown = (_e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    return;
  };

  if (!isOpen || !initialized) return null;

  const panelStyle = isFullscreen
    ? ({
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        borderRadius: 0,
      } as React.CSSProperties)
    : ({
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: 9999,
      } as React.CSSProperties);

  return (
    <div
      style={panelStyle}
      className={`bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden ${isFullscreen ? '' : 'rounded-2xl'}`}
    >
      {/* Header */}
      <div
        onMouseDown={handleDragStart}
        className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-violet-700 text-white flex-shrink-0 select-none ${!isFullscreen ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">AI Помощник</p>
            <p className="text-xs text-violet-200 leading-tight">Nur-Kitep</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title={isFullscreen ? 'Свернуть' : 'Развернуть на весь экран'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={closeChat}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
              <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[78%] flex flex-col gap-2 ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`rounded-2xl px-3 py-2.5 ${
                  message.role === 'user' ? 'bg-violet-600 text-white' : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-violet-200' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'assistant' && message.products && message.products.length > 0 && (
                <div className="flex flex-col gap-1.5 w-full">
                  {message.products.map((p) => (
                    <ProductCardItem key={p.id} product={p} onClick={() => router.push(`/product/${p.id}`)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-2xl px-3 py-2.5 shadow-sm border border-gray-100">
              <div className="flex gap-1 items-center h-4">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleFormSubmit} className="border-t border-gray-200 p-3 bg-white flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите сообщение..."
            rows={1}
            className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-gray-900 placeholder-gray-400 resize-none max-h-32 leading-relaxed no-scrollbar"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="p-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Resize handle — top-left corner */}
      {!isFullscreen && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute top-0 left-0 w-5 h-5 cursor-nw-resize z-10 flex items-start justify-start pt-1 pl-1"
          title="Изменить размер"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: 'rotate(180deg)' }}>
            <path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}
