import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "logo-ai-gwgs.vercel.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "logoai-pro-envato.vercel.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "logoaipro.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pictures-storage.storage.eu-north1.nebius.cloud",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
