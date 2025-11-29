import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      // Add other image hosting services you might use
      {
        protocol: 'https',
        hostname: '**.imgur.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;