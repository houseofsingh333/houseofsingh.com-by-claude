import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#F9F7F5",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://houseofsingh.com"),
  title: {
    default: "House of Singh — Maninder Singh",
    template: "%s | House of Singh",
  },
  description:
    "The creative world of Maninder Singh. Design, photography, and intentional living. Based in Toronto.",
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "House of Singh",
    title: "House of Singh — Maninder Singh",
    description:
      "The creative world of Maninder Singh. Design, photography, and intentional living. Based in Toronto.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "House of Singh — Maninder Singh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@houseofsingh",
    site: "@houseofsingh",
    images: ["/og-image.png"],
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Maninder Singh",
    alternateName: "House of Singh",
    url: "https://houseofsingh.com",
    image: "https://houseofsingh.com/og-image.png",
    jobTitle: "Creative Director",
    description:
      "Multidisciplinary designer and photographer based in Toronto",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Toronto",
      addressRegion: "Ontario",
      addressCountry: "CA",
    },
    sameAs: ["https://www.instagram.com/houseofsingh"],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "House of Singh",
    url: "https://houseofsingh.com",
    description:
      "The creative world of Maninder Singh. Design, photography, and intentional living.",
    author: {
      "@type": "Person",
      name: "Maninder Singh",
    },
  },
];

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
