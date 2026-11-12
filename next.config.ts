import type { NextConfig } from "next";

/**
 * The Content Security Policy.
 *
 * script-src allows https://open.spotify.com and
 * https://embed-cdn.spotifycdn.com for Spotify's official iFrame API: the
 * loader (open.spotify.com/embed/iframe-api/v1) pulls its main script from
 * embed-cdn.spotifycdn.com. The home page record (Chapter VI) uses it to
 * learn when the playlist plays, so the disc turns only then. The player
 * itself never depends on it: the normal Spotify iframe (frame-src
 * open.spotify.com) is shown straight away, and if the API is blocked or
 * slow it simply stays.
 *
 * 'unsafe-eval' is allowed on the home page ONLY (see headers() below):
 * Spotify's iFrame API script calls eval, and without it the browser
 * refuses it ("Refused to evaluate a string as JavaScript because
 * 'unsafe-eval' is not an allowed source"), so the API never reports
 * ready. Every other route keeps the strict policy without it. Arriving at
 * the home page by a link inside the site keeps the policy of the page the
 * visit started on, so there the record falls back to turning when the
 * player is clicked (see RecordPlayer).
 */
function contentSecurityPolicy({ unsafeEval }: { unsafeEval: boolean }): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${unsafeEval ? " 'unsafe-eval'" : ""} https://vercel.live https://va.vercel-scripts.com https://core.sanity-cdn.com https://open.spotify.com https://embed-cdn.spotifycdn.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://cdn.sanity.io",
    "font-src 'self'",
    "connect-src 'self' https://cdn.sanity.io https://*.sanity.io https://va.vercel-scripts.com",
    "frame-src https://open.spotify.com",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: contentSecurityPolicy({ unsafeEval: false }) },
];

const nextConfig: NextConfig = {
  /*
   * The journal's months and the projects' categories have their own
   * cached addresses now. The older addresses that carried them in the
   * query (?year=&month= and ?filter=) are sent there permanently, so
   * existing links and bookmarks keep working.
   */
  async redirects() {
    return [
      {
        source: "/journal",
        has: [
          { type: "query", key: "year", value: "(?<year>\\d{4})" },
          { type: "query", key: "month", value: "(?<month>\\d{1,2})" },
        ],
        destination: "/journal/archive/:year/:month",
        permanent: true,
      },
      {
        source: "/projects",
        has: [{ type: "query", key: "filter", value: "(?<filter>.+)" }],
        destination: "/projects/category/:filter",
        permanent: true,
      },
    ];
  },
  /*
   * A project's own address on the Projects page, /projects?p=<slug>, is
   * served by a cached page per project (projects/view/[slug]); the address
   * bar keeps the friendly form.
   */
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/projects",
          has: [{ type: "query", key: "p", value: "(?<p>[a-z0-9-]+)" }],
          destination: "/projects/view/:p",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // The home page only: the same policy plus 'unsafe-eval' for Spotify's
      // iFrame API (see contentSecurityPolicy). A later rule with the same
      // header key replaces the earlier one for this exact path.
      {
        source: "/",
        headers: [{ key: "Content-Security-Policy", value: contentSecurityPolicy({ unsafeEval: true }) }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
    // Aligned with sanityImage.ts profiles:
    // thumbnail: 320, 480, 640  |  body: 640, 750, 828, 960, 1280  |  hero: 640, 750, 828, 960, 1280, 1600, 1920
    // 750 and 828 fit the phones that need about 720 to 830 pixels (many
    // Android phones, iPhones at 2x), which otherwise took the 960 file
    // (Batch C, C2: about a third fewer bytes, the same to the eye).
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 960, 1280, 1600, 1920],
    imageSizes: [320, 480],
  },
};

export default nextConfig;
