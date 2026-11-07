import SanityImage from "@/components/SanityImage";
import type { SiteCopy } from "@/lib/siteCopy";
import { fetchStudioWork } from "@/sanity/studioWork";

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
 * the leaving note; then, below a hairline, three recent case studies from
 * the studio's own Sanity, small and in greyscale, each coming into colour
 * on hover or focus and opening its case study in a new tab. If the
 * studio's data cannot be reached the row is hidden and the rest stays.
 * All text is editable in Site Settings, Homepage chapters, Chapter VII.
 */
export default async function StudioWindow({
  copy,
  caseStudies,
}: {
  copy: SiteCopy;
  caseStudies?: string[] | null;
}) {
  const work = await fetchStudioWork(caseStudies, copy.practiceCaseStudyBase);

  return (
    <section aria-labelledby="chapter-practice" className="window px-6 md:px-16 section-py">
      <div className="flex items-baseline gap-4">
        <span aria-hidden="true" className="font-editorial italic text-[30px] leading-none text-accent">
          VII
        </span>
        <h2 id="chapter-practice" className="text-[13px] tracking-[0.14em] uppercase text-muted-foreground font-normal">
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
          <p className="font-editorial text-[24px] md:text-[30px] leading-[1.35] text-foreground max-w-[560px]">
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

      {work && (
        <div className="window-work">
          <p className="window-work-label">{copy.practiceWorkLabel}</p>
          <ul className="window-work-list">
            {work.map((w) => (
              <li key={w.href}>
                <a href={w.href} target="_blank" rel="noopener noreferrer" className="window-work-item">
                  <span className="window-thumb">
                    {/* The colour photograph, and a greyscale copy over it
                        that fades away on hover and focus. The client's name
                        below names the link, so the images are decorative. */}
                    <SanityImage image={{ url: w.image.url, lqip: w.image.lqip ?? undefined, isDecorative: true }} context="thumbnail" fill sizes="140px" develop={false} className="object-cover" />
                    <span aria-hidden="true" className="window-thumb-grey">
                      <SanityImage image={{ url: w.image.url, lqip: w.image.lqip ?? undefined, isDecorative: true }} context="thumbnail" fill sizes="140px" develop={false} className="object-cover" />
                    </span>
                  </span>
                  <span className="window-work-name">
                    {w.name}
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
