import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { sanityFetch } from "@/sanity/fetch";
import { navigationQuery, siteSettingsQuery } from "@/sanity/queries";
import {
  fallbackNavItems,
  fallbackSiteSettings,
  type NavItem,
  type SiteSettings,
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
  const [navData, settings] = await Promise.all([
    sanityFetch<{ items: NavItem[] } | null>({ query: navigationQuery }),
    sanityFetch<SiteSettings | null>({ query: siteSettingsQuery }),
  ]);

  const navItems = navData?.items ?? fallbackNavItems;
  const footerText = settings?.footerText ?? fallbackSiteSettings.footerText;

  return (
    <html lang="en">
      <body className="antialiased">
        <Header items={navItems} />
        <main id="main-content">{children}</main>
        <Footer footerText={footerText} />
      </body>
    </html>
  );
}
