import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['tiktok-dl-core'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      const externals = Array.isArray(config.externals) ? config.externals : [];
      config.externals = [...externals, 'tiktok-dl-core'];
    }
    return config;
  },
};

export default nextConfig;
