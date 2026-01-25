/* eslint-disable no-undef */
import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.placeholder.com',
      },
    ],
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  turbopack: {},
  webpack: (config) => {
    // Override any @ alias to point to the local directory only
    config.resolve.alias = {
      ...config.resolve.alias,
      // Override any @ alias to point to the local directory only
      '@': path.resolve(process.cwd()),
    };
    return config;
  },
}

export default nextConfig
