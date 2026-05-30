import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Сборка self-contained приложения для запуска в Docker (Timeweb App Platform)
  output: 'standalone',
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
};

export default nextConfig;
