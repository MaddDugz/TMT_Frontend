import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
     turbopack: {
    resolveAlias: {
      "@coinbase/cdp-sdk": "./empty-module.js",
    },
  },
};

export default nextConfig;
