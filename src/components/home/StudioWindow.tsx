import SanityImage from "@/components/SanityImage";
import type { SiteCopy } from "@/lib/siteCopy";
import { hasImageAsset } from "@/lib/sanityImage";
import type { StudioWorkCard } from "@/lib/types";

const STUDIO_URL = "https://studios.houseofsingh.com";

/** The external arrow, eased forward on hover and focus (CSS). */
function Arrow({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={className}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

/**
 * Chapter VII, the window into the studio (canvas frame "Window B1: a quiet
 * thumbnail row"). A still section: the numeral and label; the House of
 * Singh Studios logo in charcoal beside the studio line, the link out and
 * the leaving note; then, below a hairline, up to three studio work cards,
 * small and in greyscale, each coming into colour on hover or focus and
 * opening its link in a new tab. The cards are this site's own content
 * (Site Settings, Homepage chapters, Chapter VII, Studio work cards), shown
 * in the order set there; with none filled in, the row and its label are
 * hidden and the rest stays. All text is editable in that same section.
 */
export default function StudioWindow({
  copy,
  cards,
}: {
  copy: SiteCopy;
  cards?: StudioWorkCard[] | null;
}) {
  // Only complete cards: an image, a client name and a link.
  const work = (cards ?? [])
    .filter((c) => hasImageAsset(c.image) && c.clientName?.trim() && c.link?.trim())
    .slice(0, 3);

  return (
    <section aria-labelledby="chapter-practice" className="window px-6 md:px-16 section-py">
      <div className="flex items-baseline gap-4">
        <span aria-hidden="true" className="font-editorial text-[30px] leading-none text-accent">
          VII
        </span>
        <h2 id="chapter-practice" className="type-label text-muted-foreground">
          {copy.practiceLabel}
        </h2>
      </div>

      <div className="window-main">
        {/* eslint-disable-next-line @next/next/no-img-element -- an SVG logo: next/image adds nothing for vector files. */}
        <img
          src="/images/hos-studios-logo-charcoal.svg"
          alt="House of Singh Studios"
          width={340}
          height={235}
          loading="lazy"
          decoding="async"
          className="window-logo"
        />
        <div className="window-text">
          <p className="font-editorial text-[length:clamp(24px,calc(21.37px_+_0.674vw),30px)] leading-[1.35] text-foreground max-w-[560px]">
            {copy.practiceLine}
          </p>
          <a href={STUDIO_URL} target="_blank" rel="noopener noreferrer" className="window-link">
            <span className="window-link-label">
              {copy.practiceLinkText}
              <Arrow className="window-link-arrow" />
              <span className="sr-only"> (opens in a new tab)</span>
            </span>
            <span aria-hidden="true" className="window-link-line" />
          </a>
          <p className="text-[13px] leading-[1.5] text-muted-foreground">{copy.practiceLeavingNote}</p>
        </div>
      </div>

      {work.length > 0 && (
        <div className="window-work">
          <p className="window-work-label">{copy.practiceWorkLabel}</p>
          <ul className="window-work-list">
            {work.map((w, i) => (
              <li key={w._key ?? i}>
                <a href={w.link!.trim()} target="_blank" rel="noopener noreferrer" className="window-work-item">
                  <span className="window-thumb">
                    {/* The colour photograph (with its alt text), and a
                        greyscale copy over it that fades away on hover and
                        focus; the copy is hidden from screen readers. */}
                    <SanityImage image={w.image} context="thumbnail" fill sizes="140px" develop={false} className="object-cover" />
                    <span aria-hidden="true" className="window-thumb-grey">
                      <SanityImage image={w.image} context="thumbnail" alt="" fill sizes="140px" develop={false} className="object-cover" />
                    </span>
                  </span>
                  <span className="window-work-name">
                    {w.clientName!.trim()}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
