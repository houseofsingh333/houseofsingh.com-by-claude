import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LogoIntro from "@/components/layout/LogoIntro";
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

  const navItems = navData?.items ?? fallbackNavItems;

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <LogoIntro />
        <Header items={navItems} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer items={navItems} />
      </body>
    </html>
  );
}
