import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-ignore - allowedDevOrigins exists in Next.js 16 but types may not be updated
    allowedDevOrigins: ["http://10.204.108.168:3000"],
  },
} as NextConfig;

export default nextConfig;
