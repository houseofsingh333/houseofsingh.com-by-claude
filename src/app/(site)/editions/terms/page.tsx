import type { Metadata } from "next";
import { loadSettings, withDefaults } from "@/lib/editions/load";
import { DEFAULT_TERMS } from "@/lib/editions/defaults";

export const metadata: Metadata = { title: "Terms of sale" };

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
  const s = withDefaults(await loadSettings());
  const gst = process.env.GST_NUMBER?.trim() || null;
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
