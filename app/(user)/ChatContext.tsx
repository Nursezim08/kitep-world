'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ChatContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
}

const ChatContext = createContext<ChatContextType>({
  isOpen: false,
  openChat: () => {},
  closeChat: () => {},
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const setSidebarCollapsed = useCallback((v: boolean) => setSidebarCollapsedState(v), []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        openChat: () => setIsOpen(true),
        closeChat: () => setIsOpen(false),
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
