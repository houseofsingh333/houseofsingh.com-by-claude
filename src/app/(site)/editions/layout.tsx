import type { Metadata } from "next";
import Link from "next/link";
import { EDITIONS_DEFAULTS } from "@/lib/editions/defaults";

/**
 * House of Singh Editions, while in development: reachable only from the
 * footer's "Shop" link, and never indexed (every /editions page is
 * noindex, and none is in the sitemap, llms.txt or the structured data).
 */
export const metadata: Metadata = {
  title: { default: "House of Singh Editions", template: "%s | House of Singh Editions" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

const NAV = [
  { href: "/editions#collection", label: "The Collection" },
  { href: "/editions#before-you-buy", label: "Before you buy" },
  { href: "/editions/artists", label: "For artists" },
  { href: "/editions/archive", label: "Archive" },
];

export default function EditionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ed">
      <header className="ed-head">
        <Link href="/editions" className="ed-head-brand">
          <span className="type-label text-muted-foreground">Shop</span>
          <span className="ed-head-name">{EDITIONS_DEFAULTS.brand}</span>
        </Link>
        <nav aria-label="The Shop" className="ed-head-nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hairline">
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
      <div className="ed-foot">
        <p>Sold by {EDITIONS_DEFAULTS.seller}.</p>
        <Link href="/editions/terms" className="hairline">
          Terms of sale
        </Link>
      </div>
    </div>
  );
}
