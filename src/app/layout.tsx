import type { Metadata } from "next";
import { headers } from "next/headers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import LangProvider, { type Lang } from "@/components/LangProvider";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { sanityFetch } from "@/sanity/fetch";
import { navigationQuery } from "@/sanity/queries";
import {
  fallbackNavItems,
  type NavItem,
} from "@/lib/placeholder-data";
import "./globals.css";

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
  const navData = await sanityFetch<{ items: NavItem[] } | null>({
    query: navigationQuery,
  });

  const sanityItems = navData?.items;
  const navItems =
    sanityItems && sanityItems.length >= 4 ? sanityItems : fallbackNavItems;

  // Read lang from the x-lang header set by middleware
  // This is available server-side without a client round-trip
  let lang: Lang = "en";
  try {
    const headersList = await headers();
    const xLang = headersList.get("x-lang");
    if (xLang === "pa") lang = "pa";
  } catch {
    // headers() can fail in certain environments — default to English
  }

  return (
    <html
      lang={lang === "pa" ? "pa" : "en"}
      data-lang={lang}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <LangProvider lang={lang}>
          <Header items={navItems} />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer items={navItems} />
        </LangProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
