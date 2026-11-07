import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { sanityFetch } from "@/sanity/fetch";
import { siteSettingsQuery } from "@/sanity/queries";
import type { SiteSettings } from "@/lib/types";
import { TITLE_TEMPLATE } from "@/lib/page-title";
import "./globals.css";

const SITE_URL = "https://houseofsingh.com";

/**
 * Sensible fallbacks used when Site Settings hasn't been filled out in Sanity.
 * These mirror the values previously hardcoded here so behaviour is unchanged
 * until the owner overrides them in the CMS.
 */
const SEO_DEFAULTS = {
  title: "House of Singh | Maninder Singh",
  description:
    "The creative world of Maninder Singh. Design, photography, and intentional living. Based in Toronto.",
  organizationName: "House of Singh",
  founderName: "Maninder Singh",
  sameAs: ["https://www.instagram.com/houseofsingh"],
};

const playfair = localFont({
  src: [
    {
      path: "../../public/fonts/playfair-display-latin-wght-normal.woff2",
      style: "normal",
    },
    {
      path: "../../public/fonts/playfair-display-latin-wght-italic.woff2",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-playfair",
  adjustFontFallback: "Times New Roman",
  fallback: ["Times New Roman", "Times", "serif"],
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#F9F7F5",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch<SiteSettings | null>({
    query: siteSettingsQuery,
  });

  const description =
    settings?.defaultMetaDescription?.trim() || SEO_DEFAULTS.description;
  const siteName =
    settings?.organizationName?.trim() || SEO_DEFAULTS.organizationName;
  const verification = settings?.googleVerification?.trim();

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SEO_DEFAULTS.title,
      template: TITLE_TEMPLATE,
    },
    description,
    alternates: {
      canonical: "/",
    },
    // OG/Twitter images come from the sitewide opengraph-image.tsx /
    // twitter-image.tsx generators (Next.js convention).
    openGraph: {
      type: "website",
      locale: "en_CA",
      siteName,
      title: SEO_DEFAULTS.title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@houseofsingh",
      site: "@houseofsingh",
    },
    // Favicon is auto-detected from app/favicon.ico (Next.js convention).
    // No apple-touch-icon asset exists, so none is referenced.
    manifest: "/site.webmanifest",
    // Only emit a verification tag when a real code is set in the CMS.
    ...(verification ? { verification: { google: verification } } : {}),
  };
}

/**
 * Root layout: the document shell only (html, body, fonts, global CSS,
 * sitewide metadata and the one line pre paint "js" flag). Everything a
 * visitor sees around a page (header, footer, page transition, intro,
 * newsletter popup, structured data, Speed Insights) lives in the public
 * site's layout, src/app/(site)/layout.tsx, so routes outside that group,
 * such as the Sanity Studio, get none of it.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the script below adds the "js" class to
    // <html> before React hydrates, which is intended.
    <html lang="en" className={playfair.variable} suppressHydrationWarning>
      <head>
        {/* Pre paint script. Scroll reveals start hidden only under the "js"
            class (and only when the visitor allows motion), so without
            JavaScript every reveal is simply visible; see "Scroll reveal" in
            styles/motion.css. It also marks loaded blur up photos (BlurUp.tsx).
            Harmless on routes outside the site, such as the Studio. */}
        <script
          dangerouslySetInnerHTML={{
            // 1. "js": JavaScript is running (scroll reveals, blur up).
            // 2. Marks each blur up photo data-loaded when it loads or fails,
            //    from the first byte, so its preview can dissolve even before
            //    React has started. Capture phase, as load does not bubble.
            __html:
              'document.documentElement.classList.add("js");' +
              'var m=function(e){var t=e.target;if(t&&t.tagName==="IMG"&&t.hasAttribute("data-blurup"))t.setAttribute("data-loaded","")};' +
              'document.addEventListener("load",m,true);document.addEventListener("error",m,true);' +
              // 3. Safety net: once the page has loaded, any blur up photo
              //    already complete is marked too, so none can stay hidden.
              'addEventListener("load",function(){document.querySelectorAll("img[data-blurup]").forEach(function(i){if(i.complete)i.setAttribute("data-loaded","")})});',
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
