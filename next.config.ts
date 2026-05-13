import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.twcstorage.ru',
        port: '',
        pathname: '/nur-kitep/**',
      },
    ],
  },
};

export default nextConfig;
