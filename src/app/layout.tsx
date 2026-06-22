import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/PageTransition";
import { sanityFetch } from "@/sanity/fetch";
import {
  navigationQuery,
  contactPageQuery,
  siteSettingsQuery,
} from "@/sanity/queries";
import {
  fallbackNavItems,
  fallbackInstagramPhotos,
  type NavItem,
} from "@/lib/placeholder-data";
import type { InstagramPhoto } from "@/components/contact/InstagramPhotoPlate";
import type { SiteSettings } from "@/lib/types";
import JsonLd from "@/components/JsonLd";
import { buildSiteJsonLd } from "@/lib/structured-data";
import "./globals.css";

const SITE_URL = "https://houseofsingh.com";

/**
 * Sensible fallbacks used when Site Settings hasn't been filled out in Sanity.
 * These mirror the values previously hardcoded here so behaviour is unchanged
 * until the owner overrides them in the CMS.
 */
const SEO_DEFAULTS = {
  title: "House of Singh — Maninder Singh",
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
      template: "%s | House of Singh",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navData, contactData, settings] = await Promise.all([
    sanityFetch<{ items: NavItem[] } | null>({ query: navigationQuery }),
    sanityFetch<{ instagramPhotos?: InstagramPhoto[] | null } | null>({
      query: contactPageQuery,
    }),
    sanityFetch<SiteSettings | null>({ query: siteSettingsQuery }),
  ]);

  const jsonLd = buildSiteJsonLd(settings);

  const sanityItems = navData?.items;
  const navItems =
    sanityItems && sanityItems.length >= 4 ? sanityItems : fallbackNavItems;

  const instagramPhotos = contactData?.instagramPhotos?.length
    ? contactData.instagramPhotos
    : fallbackInstagramPhotos;

  return (
    <html lang="en" className={playfair.variable}>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <JsonLd data={jsonLd} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[100] focus:block focus:w-full focus:bg-background focus:px-6 focus:py-3 focus:text-sm focus:text-foreground focus:shadow-md"
        >
          Skip to content
        </a>
        <Header items={navItems} />
        <main id="main-content" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer instagramPhotos={instagramPhotos} />
        <SpeedInsights />
      </body>
    </html>
  );
}
