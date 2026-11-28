import path from 'node:path';
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['tiktok-dl-core'],
  // The addon lives outside apps/web; trace the monorepo so it can be bundled.
  outputFileTracingRoot: path.join(__dirname, '../..'),
  outputFileTracingIncludes: {
    '/api/*': [
      '../../packages/core/native/core-rs/index.cjs',
      '../../packages/core/native/core-rs/core_rs.node',
    ],
  },
  webpack: (config, {isServer}) => {
    if (isServer) {
      const externals = Array.isArray(config.externals)
        ? config.externals
        : [];
      config.externals = [...externals, 'tiktok-dl-core'];
    }
    return config;
  },
};

export default nextConfig;
