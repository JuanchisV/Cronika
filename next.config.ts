import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",

  basePath: "/Cronika",
  assetPrefix: "/Cronika/",

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
