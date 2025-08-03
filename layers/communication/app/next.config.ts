import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
