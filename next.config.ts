import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // script-src allows https://open.spotify.com for Spotify's official
  // iFrame API (open.spotify.com/embed/iframe-api/v1), which the home page
  // record (Chapter VI) loads to learn when the playlist plays, so the disc
  // turns only then. If it is blocked, the player still works as a plain
  // embed (frame-src) and the disc stays still.
  // img-src allows https://studios.houseofsingh.com for the House of Singh
  // Studios logo in the home page door (Chapter VII), served by the studio.
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com https://core.sanity-cdn.com https://open.spotify.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://cdn.sanity.io https://studios.houseofsingh.com; font-src 'self'; connect-src 'self' https://cdn.sanity.io https://*.sanity.io https://va.vercel-scripts.com; frame-src https://open.spotify.com; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
    // Aligned with sanityImage.ts profiles:
    // thumbnail: 320, 480, 640  |  body: 640, 960, 1280  |  hero: 640, 960, 1280, 1600, 1920
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 960, 1280, 1600, 1920],
    imageSizes: [320, 480],
  },
};

export default nextConfig;
