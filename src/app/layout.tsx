import type { Metadata } from "next";
import localFont from "next/font/local";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/PageTransition";
import { sanityFetch } from "@/sanity/fetch";
import { navigationQuery, contactPageQuery } from "@/sanity/queries";
import {
  fallbackNavItems,
  fallbackInstagramPhotos,
  type NavItem,
} from "@/lib/placeholder-data";
import type { InstagramPhoto } from "@/components/contact/InstagramPhotoPlate";
import "./globals.css";

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

export const metadata: Metadata = {
  title: {
    default: "House of Singh",
    template: "%s | House of Singh",
  },
  description:
    "House of Singh is a multidisciplinary design studio focused on residential and commercial spaces.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navData, contactData] = await Promise.all([
    sanityFetch<{ items: NavItem[] } | null>({ query: navigationQuery }),
    sanityFetch<{ instagramPhotos?: InstagramPhoto[] | null } | null>({
      query: contactPageQuery,
    }),
  ]);

  const sanityItems = navData?.items;
  const navItems =
    sanityItems && sanityItems.length >= 4 ? sanityItems : fallbackNavItems;

  const instagramPhotos = contactData?.instagramPhotos?.length
    ? contactData.instagramPhotos
    : fallbackInstagramPhotos;

  return (
    <html lang="en" className={playfair.variable}>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <Header items={navItems} />
        <main id="main-content" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer items={navItems} instagramPhotos={instagramPhotos} />
        <SpeedInsights />
      </body>
    </html>
  );
}
