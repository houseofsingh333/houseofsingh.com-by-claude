import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ThemeProvider from "@/components/ThemeProvider";

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

  const navItems = navData?.items ?? fallbackNavItems;

  /* Read server-side cookie so the initial HTML class avoids a flash */
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const initialClass = themeCookie === "dark" ? "dark" : "";

  return (
    <html lang="en" className={initialClass}>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider>
          <Header items={navItems} />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer items={navItems} />
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
