import { ReactNode } from 'react';
import { ChatProvider } from './ChatContext';
import AIChatPanel from '@/app/components/AIChatPanel';

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <ChatProvider>
      {children}
      <AIChatPanel />
    </ChatProvider>
  );
}
