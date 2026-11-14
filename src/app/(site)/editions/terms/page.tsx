import type { Metadata, ResolvingMetadata } from "next";
import { fullTitle } from "@/lib/page-title";
import { shareCard } from "@/lib/share-metadata";
import { EDITIONS_TERMS_DESCRIPTION } from "@/lib/pageDescriptions";
import { loadSettings, withDefaults } from "@/lib/editions/load";
import { DEFAULT_TERMS } from "@/lib/editions/defaults";
import { requireEditions } from "@/lib/editions/enabled";
import { taxMode } from "@/lib/editions/tax-rates";

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  return {
    title: "Terms of sale",
    description: EDITIONS_TERMS_DESCRIPTION,
    alternates: { canonical: "/editions/terms" },
    // Out of search like every Shop page, but its links are followed
    // (approved 14 Nov): the layout's nofollow is lifted here only.
    robots: { index: false, follow: true, nocache: true, googleBot: { index: false, follow: true } },
    ...(await shareCard(parent, fullTitle("Terms of sale"), EDITIONS_TERMS_DESCRIPTION, "/editions/terms")),
  };
}
// Prepared ahead and refreshed every minute, like the other pages (a change
// of EDITIONS_MODE takes a redeploy, which rebuilds it).
export const revalidate = 60;

/** Fills {gst} and {returns}; without a GST_NUMBER the sentence naming it is left out. */
function fill(text: string, gst: string | null, returns: string): string {
  let t = text.replace("{returns}", returns);
  if (gst) t = t.replace("{gst}", gst);
  else t = t.replace(/\s*GST\/HST number: \{gst\}\./, "").replace("{gst}", "");
  return t;
}

/**
 * Terms of sale (linked from Before you buy and the Shop's footer): the
 * seller, prices and tax, shipping and duties, returns, and contact. Shop
 * settings can replace the text; the GST/HST number comes from GST_NUMBER.
 */
export default async function TermsOfSalePage() {
  await requireEditions("any");
  const s = withDefaults(await loadSettings());
  // A GST/HST number only while tax is charged (TAX_MODE, a future registration).
  const gst = taxMode() !== "none" ? process.env.GST_NUMBER?.trim() || null : null;
  const sections = (s.terms ?? DEFAULT_TERMS).map((t) => ({ title: t.title, text: fill(t.text, gst, s.returnsLine) }));

  return (
    <div className="ed-page">
      <article className="ed-terms" aria-labelledby="ed-terms-title">
        <span className="type-label text-muted-foreground">House of Singh Editions</span>
        <h1 id="ed-terms-title" className="font-editorial font-normal text-display-xl leading-[1.05] text-foreground">
          Terms of sale
        </h1>
        {sections.map((t) => (
          <section key={t.title} className="ed-terms-section">
            <h2 className="font-editorial font-normal text-display-s leading-[1.2] text-foreground">{t.title}</h2>
            <p className="text-body text-foreground">{t.text}</p>
          </section>
        ))}
      </article>
    </div>
  );
}
