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
import { IntroProvider } from "@/components/IntroContext";
import { devPlaceholder } from "@/lib/placeholders";
import { reportInstagramAltGaps } from "@/lib/instagram-alt";

/**
 * Layout for the public website: every page a visitor sees. The (site) route
 * group adds no segment to the URL, so /about is still /about.
 *
 * Holds everything around a page: skip link, sitewide structured data,
 * header (with the intro and the newsletter popup), page transition, footer
 * and Speed Insights. The Sanity Studio sits outside this group and so never
 * renders any of it.
 */
export default async function SiteLayout({
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

  // The fallback nav lists the site's real routes, so it stays as a default.
  // The Instagram fallback is placeholder artwork: local placeholders only.
  const instagramPhotos = contactData?.instagramPhotos?.length
    ? contactData.instagramPhotos
    : devPlaceholder(fallbackInstagramPhotos, []);
  reportInstagramAltGaps(instagramPhotos);

  return (
    <>
      {/* Intro video preload, desktop only. The intro overlay is skipped
          below 1024px, so without this media condition mobile downloaded
          126 KiB it never plays. React places this link in the <head>. */}
      <link
        rel="preload"
        as="video"
        href="/images/HOS_Logo_Animation.mp4"
        type="video/mp4"
        media="(min-width: 1024px)"
      />
      {/* No Spotify preconnects here: the embed mounts only when it scrolls
          into view, so eager hints sat unused on every page load and were
          flagged as wasted connections. */}
      <JsonLd data={jsonLd} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[100] focus:block focus:w-full focus:bg-background focus:px-6 focus:py-3 focus:text-sm focus:text-foreground focus:shadow-md"
      >
        Skip to content
      </a>
      <IntroProvider>
        <Header items={navItems} />
        <main id="main-content" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer instagramPhotos={instagramPhotos} />
      </IntroProvider>
      <SpeedInsights />
    </>
  );
}
