'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, X, Maximize2, Minimize2, Send } from 'lucide-react';
import { useChat } from '@/app/(user)/ChatContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatPanel() {
  const { isOpen, closeChat, sidebarCollapsed } = useChat();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 380, height: 520 });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          content: 'Здравствуйте! Я AI-помощник Nur-Kitep. Чем могу помочь вам сегодня?',
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Спасибо за ваш вопрос! AI-помощник находится в разработке. Скоро я смогу помочь вам с выбором товаров, ответить на вопросы о заказах и многое другое.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000);
  };

  if (!isOpen || !initialized) return null;

  const sidebarLeft = sidebarCollapsed ? 80 : 288;

  const panelStyle = isFullscreen
    ? ({
        position: 'fixed',
        top: 57,
        left: sidebarLeft,
        right: 0,
        bottom: 0,
        width: `calc(100% - ${sidebarLeft}px)`,
        height: 'calc(100vh - 57px)',
        zIndex: 9999,
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
              className={`max-w-[78%] rounded-2xl px-3 py-2.5 ${
                message.role === 'user' ? 'bg-violet-600 text-white' : 'bg-white text-gray-900 shadow-sm border border-gray-100'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-violet-200' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </p>
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
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 bg-white flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-gray-900 placeholder-gray-400"
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
