import type { SiteCopy } from "@/lib/siteCopy";
import { hasImageAsset, type SanityImageAsset } from "@/lib/sanityImage";
import { hotspotPosition } from "@/lib/projectHero";
import type { StudioWorkCard } from "@/lib/types";
import OutlineCta from "@/components/OutlineCta";
import PracticePanels, { type PracticePanel } from "./PracticePanels";
import ChapterMark from "@/components/ChapterMark";

const STUDIO_URL = "https://studios.houseofsingh.com";

/**
 * Chapter VII, the practice (canvas "Homepage Journal: three options",
 * page "Practice section": frame "Call to action 1, outlined, fills on
 * hover" on desktop, "FINAL phone" on phones).
 *
 * Desktop: two columns. On the left, the numeral and label at the top;
 * at the bottom, level with the photographs, the House of Singh Studios
 * logo, the studio line in Playfair, the business line and the outlined
 * call to action. On the right, up to three tall studio photographs side
 * by side, each with its client name beneath (PracticePanels).
 * Phone: one column, the photographs between the business line and the
 * call to action.
 *
 * The panels are Site Settings, Homepage chapters, Chapter VII, Studio
 * work panels, in the order set there; only complete ones show (a
 * photograph, a client name and a link). With none, the right column is
 * left out and the rest stays. Every text is editable in that section.
 */
export default function PracticeChapter({
  copy,
  cards,
  numeral = "VI",
}: {
  copy: SiteCopy;
  cards?: StudioWorkCard[] | null;
  /** Its Roman numeral, in the order Home shows its chapters. */
  numeral?: string;
}) {
  const panels: PracticePanel[] = (cards ?? [])
    .filter((c) => hasImageAsset(c.image) && c.clientName?.trim() && c.link?.trim())
    .slice(0, 3)
    .map((c, i) => {
      const image = c.image as SanityImageAsset;
      return {
        key: c._key ?? String(i),
        client: c.clientName!.trim(),
        service: c.service?.trim() || null,
        href: c.link!.trim(),
        image,
        position: hotspotPosition(image),
      };
    });

  return (
    <section
      aria-labelledby="chapter-practice"
      className="practice px-6 md:px-16 section-py"
      data-panels={panels.length}
    >
      <ChapterMark numeral={numeral} label={copy.practiceLabel} headingId="chapter-practice" className="practice-label" />

      <div className="practice-sign">
        {/* eslint-disable-next-line @next/next/no-img-element -- an SVG logo: next/image adds nothing for vector files. */}
        <img
          src="/images/hos-studios-logo-charcoal.svg"
          alt="House of Singh Studios"
          width={821}
          height={567}
          loading="lazy"
          decoding="async"
          className="practice-logo"
        />
        <p className="practice-line text-foreground">{copy.practiceLine}</p>
        <p className="practice-business text-muted-foreground">{copy.practiceBusinessLine}</p>
      </div>

      {panels.length > 0 && <PracticePanels panels={panels} />}

      <div className="practice-action">
        <OutlineCta href={STUDIO_URL} label={copy.practiceLinkText} />
        <p className="practice-note">{copy.practiceStudioNote}</p>
      </div>
    </section>
  );
}
