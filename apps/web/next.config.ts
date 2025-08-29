import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['tiktok-dl-core'],
  serverExternalPackages: ['vm2'],
};

export default nextConfig;
