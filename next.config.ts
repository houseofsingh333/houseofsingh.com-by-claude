import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
    // Aligned with sanityImage.ts profiles:
    // thumbnail: 320, 480, 640  |  body: 640, 960, 1280  |  hero: 960, 1280, 1600, 1920
    deviceSizes: [640, 960, 1280, 1600, 1920],
    imageSizes: [320, 480],
  },
};

export default nextConfig;
