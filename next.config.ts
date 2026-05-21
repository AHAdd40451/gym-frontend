import type { NextConfig } from "next";
import { config } from "dotenv";

config();

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "bundui-images.netlify.app",
      },
      {
        protocol: "https",
        hostname: "gym-api.moduleminds.ltd",
      },
    ],
  },
};

export default nextConfig;