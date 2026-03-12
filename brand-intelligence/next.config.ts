import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "@neondatabase/serverless", "bcryptjs"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;
