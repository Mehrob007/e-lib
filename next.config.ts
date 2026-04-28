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
    remotePatterns: [
      {
        protocol: "http",
        hostname: "10.154.193.92",
        port: "8001",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
