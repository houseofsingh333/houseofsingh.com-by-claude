import type { Metadata } from "next";
import Link from "next/link";
import { EDITIONS_DEFAULTS } from "@/lib/editions/defaults";
import { requireEditions } from "@/lib/editions/enabled";
import { loadCollections } from "@/lib/editions/load";

/**
 * House of Singh Editions: reachable only from the footer's "Shop" link,
 * and never indexed (every /editions page is noindex, and none is in the
 * sitemap, llms.txt or the structured data), except /editions itself in
 * anticipation (its own metadata). In anticipation the Shop's menu is
 * left out: nothing beyond the sealed Collection is shown, and Archive
 * appears only once a Collection has closed. Above the footer, the
 * sitewide closing section gives way to one quiet line with the Shop's
 * address (styles/editions.css hides the closing section on Shop pages).
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

export default async function EditionsLayout({ children }: { children: React.ReactNode }) {
  const mode = await requireEditions("any");
  const archived = mode === "full" && (await loadCollections()).some((c) => c.state === "closed");
  const nav = NAV.filter((n) => archived || n.href !== "/editions/archive");
  return (
    <div className="ed">
      <header className="ed-head">
        <Link href="/editions" className="ed-head-brand">
          <span className="type-label text-muted-foreground">Shop</span>
          <span className="ed-head-name">{EDITIONS_DEFAULTS.brand}</span>
        </Link>
        {mode === "full" && (
          <nav aria-label="The Shop" className="ed-head-nav">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="hairline">
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      {children}
      <div className="ed-foot">
        <p className="ed-foot-question">
          {`${EDITIONS_DEFAULTS.questionLine} Write to `}
          <a href={`mailto:${EDITIONS_DEFAULTS.questionEmail}`} className="hairline-rest text-foreground">
            {EDITIONS_DEFAULTS.questionEmail}
          </a>
        </p>
        <p className="ed-foot-seller">
          <span>Sold by {EDITIONS_DEFAULTS.seller}.</span>
          <Link href="/editions/terms" className="hairline">
            Terms of sale
          </Link>
        </p>
      </div>
    </div>
  );
}
