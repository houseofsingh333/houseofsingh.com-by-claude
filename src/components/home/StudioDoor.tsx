import ScrollProgress from "./ScrollProgress";

const STUDIO_URL = "https://studios.houseofsingh.com";
/** Served by the studio site, so it always matches the studio's own mark. */
const STUDIO_LOGO = "https://studios.houseofsingh.com/hos-studios-logo.svg";
const DEFAULT_LINE = "Beyond the personal work, a studio for brands.";

/**
 * Chapter VII, the door: the way through to House of Singh Studios. A
 * canvas half with the numeral, "The practice" and one Playfair line
 * (editable in Site Settings), and a charcoal half with the studio's logo,
 * its description and the link out. On desktop with motion allowed the
 * section pins briefly and the charcoal half slides in from the right as
 * you scroll (see "Door" in styles/home.css). Phones, reduced motion and no
 * JavaScript: both halves in place, stacked on phones.
 */
export default function StudioDoor({ line }: { line?: string | null }) {
  return (
    <section aria-labelledby="chapter-practice" className="door">
      <ScrollProgress
        selector=".door"
        media="(min-width: 1024px) and (prefers-reduced-motion: no-preference)"
      />
      <div className="door-stage">
        <div className="door-canvas px-6 md:px-16">
          <div className="flex items-baseline gap-4">
            <span aria-hidden="true" className="font-editorial italic text-[30px] leading-none text-accent">
              VII
            </span>
            <span className="text-[13px] tracking-[0.14em] uppercase text-muted-foreground">
              The practice
            </span>
          </div>
          <h2
            id="chapter-practice"
            className="font-editorial font-normal text-[30px] md:text-[36px] leading-[1.25] text-foreground max-w-[420px]"
          >
            {line || DEFAULT_LINE}
          </h2>
          <span aria-hidden="true" className="door-hint">
            Keep scrolling to step inside
          </span>
        </div>

        <div className="door-panel px-6 md:px-16">
          {/* eslint-disable-next-line @next/next/no-img-element -- the studio's own SVG, from its site */}
          <img
            src={STUDIO_LOGO}
            alt="House of Singh Studios"
            width={260}
            height={48}
            className="door-logo"
            loading="lazy"
            decoding="async"
          />
          <p className="text-[16px] md:text-[18px] leading-[1.7] text-muted-foreground-inverse max-w-[480px]">
            A design studio specializing in brand identities, graphic design, and
            creative direction for SMEs.
          </p>
          <div className="flex flex-col gap-3">
            <a href={STUDIO_URL} target="_blank" rel="noopener noreferrer" className="door-link">
              Visit House of Singh Studios
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M7 17 17 7" />
                <path d="M9 7h8v8" />
              </svg>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <p className="flex items-center gap-2 text-[13px] leading-[1.5] text-muted-foreground-inverse">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="shrink-0">
                <rect x="3" y="5" width="18" height="14" />
                <path d="M3 9h18" />
              </svg>
              You are leaving this site. Opens studios.houseofsingh.com in a new tab.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
