import { SpeedInsights } from "@vercel/speed-insights/next";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/PageTransition";
import GlideScroll from "@/components/GlideScroll";
import HomeFullLoad from "@/components/HomeFullLoad";
import SmoothAnchors from "@/components/SmoothAnchors";
import { bookingUrl } from "@/lib/booking";
import { sanityFetch } from "@/sanity/fetch";
import {
  menuPhotosQuery,
  navigationQuery,
  siteSettingsQuery,
} from "@/sanity/queries";
import { fallbackNavItems } from "@/lib/placeholder-data";
import type { MenuPhoto, NavItem, SanityImage, SiteSettings } from "@/lib/types";
import { hasImageAsset } from "@/lib/sanityImage";
import { siteCopy } from "@/lib/siteCopy";

type Photo = { image?: SanityImage | null; alt?: string | null } | null;
type MenuPhotoSources = {
  /** Site Settings, Menu: each page's own photograph. */
  set?: { home?: Photo; about?: Photo; projects?: Photo; journal?: Photo; contact?: Photo } | null;
  home?: Photo;
  about?: Photo;
  projects?: Photo;
  journal?: Photo;
  contact?: Photo;
};

/**
 * The menu photograph for each page, by its link: the page's own Menu
 * photograph in Site Settings when set, else a default from the site (the
 * first hero, the About portrait, the first project in homepage order, the
 * latest journal entry, the Contact portrait or else the About portrait).
 */
function buildMenuPhotos(items: NavItem[], d: MenuPhotoSources | null): Record<string, MenuPhoto> {
  const pick = (...options: (Photo | undefined)[]): MenuPhoto | null => {
    for (const o of options) if (o?.image && hasImageAsset(o.image)) return { image: o.image, alt: o.alt };
    return null;
  };
  const byHref: Record<string, MenuPhoto | null> = {
    "/": pick(d?.set?.home, d?.home),
    "/about": pick(d?.set?.about, d?.about),
    "/projects": pick(d?.set?.projects, d?.projects),
    "/journal": pick(d?.set?.journal, d?.journal),
    "/contact": pick(d?.set?.contact, d?.contact, d?.about),
  };
  const photos: Record<string, MenuPhoto> = {};
  for (const item of items) {
    const photo = item.external ? null : byHref[item.href];
    if (photo) photos[item.href] = photo;
  }
  return photos;
}
import JsonLd from "@/components/JsonLd";
import { buildSiteJsonLd } from "@/lib/structured-data";
import { IntroProvider } from "@/components/IntroContext";

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
  const [navData, settings, menuDefaults] = await Promise.all([
    sanityFetch<{ items: NavItem[] } | null>({ query: navigationQuery }),
    sanityFetch<SiteSettings | null>({ query: siteSettingsQuery }),
    sanityFetch<MenuPhotoSources | null>({ query: menuPhotosQuery }),
  ]);

  const jsonLd = buildSiteJsonLd(settings);

  const sanityItems = navData?.items;
  const navItems =
    sanityItems && sanityItems.length >= 4 ? sanityItems : fallbackNavItems;

  // The fallback nav lists the site's real routes, so it stays as a default.
  // Every editable text from Site Settings, or today's text when empty.
  const copy = siteCopy(settings);
  const menuPhotos = buildMenuPhotos(navItems, menuDefaults);

  // No preload hint for the intro video: browsers do not support
  // <link rel=preload as=video>, so it was ignored and only logged a console
  // warning on every page. The intro's own <video preload="auto"> loads it.

  return (
    <>
      {/* No Spotify preconnects here: the embed mounts only when it scrolls
          into view, so eager hints sat unused on every page load and were
          flagged as wasted connections. */}
      <JsonLd data={jsonLd} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[100] focus:block focus:w-full focus:bg-background focus:px-6 focus:py-3 focus:text-small focus:text-foreground focus:shadow-md"
      >
        Skip to content
      </a>
      <IntroProvider>
        <Header
          items={navItems}
          menuPhotos={menuPhotos}
          menuCopy={{
            menuClose: copy.menuClose,
            menuInstagram: copy.menuInstagram,
            menuNewsletter: copy.menuNewsletter,
            menuNewsletterLine: copy.menuNewsletterLine,
            menuStudio: copy.menuStudio,
            menuStudioNote: copy.menuStudioNote,
            menuTimeLabel: copy.menuTimeLabel,
            codaNewsletterPlaceholder: copy.codaNewsletterPlaceholder,
            codaNewsletterThanks: copy.codaNewsletterThanks,
          }}
        />
        <GlideScroll />
      <HomeFullLoad />
      <SmoothAnchors />
        <main id="main-content" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer
          copy={{
            codaInvite: copy.codaInvite,
            codaTimeLabel: copy.codaTimeLabel,
            codaBookLabel: copy.codaBookLabel,
            codaWriteLabel: copy.codaWriteLabel,
            codaPagesLabel: copy.codaPagesLabel,
            codaNewsletterLabel: copy.codaNewsletterLabel,
            codaNewsletterPlaceholder: copy.codaNewsletterPlaceholder,
            codaNewsletterThanks: copy.codaNewsletterThanks,
            menuInstagram: copy.menuInstagram,
          }}
          bookUrl={bookingUrl(settings?.codaBookUrl)}
        />
      </IntroProvider>
      <SpeedInsights />
    </>
  );
}
