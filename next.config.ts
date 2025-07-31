import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Fix for Supabase node-fetch issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Handle node-fetch polyfill
    config.resolve.alias = {
      ...config.resolve.alias,
      'node-fetch': 'isomorphic-fetch',
    };
    
    return config;
  },
};

export default nextConfig;
