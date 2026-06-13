import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Сборка self-contained приложения для запуска в Docker (Timeweb App Platform)
  output: 'standalone',
  
  // PWA настройки
  // Service Worker и manifest.json находятся в public/
  // Кастомный Service Worker регистрируется через app/register-sw.tsx
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.twcstorage.ru',
        port: '',
        pathname: '/nur-kitep/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Дополнительные headers для PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
