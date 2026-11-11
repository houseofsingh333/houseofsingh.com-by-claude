import type { Metadata } from "next";
import Link from "next/link";
import { EDITIONS_DEFAULTS } from "@/lib/editions/defaults";
import { requireEditions } from "@/lib/editions/enabled";
import { loadCollections } from "@/lib/editions/load";
import { canBuy } from "@/lib/editions/state";
import { gurmukhiFont } from "@/lib/editions/fonts";

/**
 * House of Singh Editions: reachable only from the footer's "Shop" link,
 * and never indexed (every /editions page is noindex, and none is in the
 * sitemap, llms.txt or the structured data), except /editions itself in
 * anticipation (its own metadata). The header is the name alone, with the
 * Shop page's sections as a menu on desktop (none on phones): The
 * Collection while it can be bought, How it works before it opens, and
 * Archive once a Collection has closed. Above the footer, the
 * sitewide closing section gives way to one quiet line with the Shop's
 * address (styles/editions.css hides the closing section on Shop pages).
 */
export const metadata: Metadata = {
  title: { default: "House of Singh Editions", template: "%s | House of Singh Editions" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

/** The Shop's own menu (desktop only): the sections of the Shop page. */
const NAV = [
  { href: "/editions#collection", label: "The Collection", when: "buying" },
  { href: "/editions#how", label: "How it works", when: "before" },
  { href: "/editions#before-you-buy", label: "Before you buy" },
  { href: "/editions#questions", label: "Questions" },
  { href: "/editions#for-artists", label: "For artists" },
  { href: "/editions/archive", label: "Archive", when: "archived" },
] as const;

export default async function EditionsLayout({ children }: { children: React.ReactNode }) {
  const mode = await requireEditions("any");
  const collections = await loadCollections();
  const current = collections[0];
  const state = mode === "anticipation" ? "sealed" : current?.state;
  const has = {
    buying: Boolean(state && canBuy(state) && mode === "full"),
    before: state === "sealed" || state === "early",
    archived: mode === "full" && collections.some((c) => c.state === "closed"),
  };
  const nav = NAV.filter((n) => !("when" in n) || has[n.when]);
  return (
    <div className={`ed ${gurmukhiFont.variable}`}>
      <header className="ed-head">
        <Link href="/editions" className="ed-head-name">
          {EDITIONS_DEFAULTS.brand}
        </Link>
        <nav aria-label="The Shop" className="ed-head-nav">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hairline">
              {n.label}
            </Link>
          ))}
        </nav>
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
          <Link href="/editions/terms" className="hairline-rest text-foreground">
            Terms of sale
          </Link>
        </p>
      </div>
    </div>
  );
}
