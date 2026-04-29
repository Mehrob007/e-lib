import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "10.154.193.92",
        port: "8001",
        pathname: "/files/**",
      },
      {
        protocol: "http",
        hostname: "10.154.193.92",
        port: "8001",
        pathname: "/s3/**",
      },
    ],
  },
};

export default nextConfig;
