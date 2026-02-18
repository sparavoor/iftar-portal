import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Example of Proxying API requests (if needed)
      // {
      //   source: '/api/external/:path*',
      //   destination: 'https://api.external-service.com/:path*',
      // },
    ];
  },
};

export default nextConfig;
