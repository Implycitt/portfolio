import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
    qualities: [75, 90],
  },
};

export default nextConfig;
