import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["georaster", "georaster-layer-for-leaflet"],
};

export default nextConfig;
