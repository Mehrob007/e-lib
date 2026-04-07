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
        protocol: "https",
        hostname: "squalidly-nonoccult-tori.ngrok-free.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
