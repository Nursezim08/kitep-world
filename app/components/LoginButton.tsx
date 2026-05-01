'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  status: string;
}

export default function LoginButton({ text }: { text: string }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-400 rounded-xl">
        <User className="w-5 h-5" />
        <span>...</span>
      </div>
    );
  }

  if (user) {
    return (
      <Link 
        href="/profile" 
        className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-violet-600 hover:shadow-lg rounded-xl transition-all"
      >
        <User className="w-5 h-5" />
        <span>{user.fullName}</span>
      </Link>
    );
  }

  return (
    <Link 
      href="/login" 
      className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-violet-500 hover:bg-violet-50 rounded-xl transition-all"
    >
      <User className="w-5 h-5" />
      {text}
    </Link>
  );
}
