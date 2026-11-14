import ChapterMark from "@/components/ChapterMark";
import SanityImage from "@/components/SanityImage";
import TextLink from "@/components/TextLink";
import { hotspotPosition } from "@/lib/projectHero";
import type { SiteCopy } from "@/lib/siteCopy";
import type { SanityImageAsset } from "@/lib/sanityImage";
import IntroductionReveal from "./IntroductionReveal";

type Props = {
  /** The About Page's name (Founder Name). */
  name: string;
  /** The About Page's homepage image, else its portrait. */
  portrait: SanityImageAsset | string | null;
  copy: Pick<SiteCopy, "introLabel" | "introLine" | "introAboutLink">;
  numeral: string;
};

/**
 * Chapter I, Introduction (approved 14 Nov; canvas "Introduction, calm
 * options", artboard 1): the label, "Maninder Singh" in Playfair, one line
 * and a link to About; the About portrait on the right, 520 by 650 on
 * desktop, first on a phone. The first time it is in view the photograph
 * fades in drifting up 18px over 1300ms, then the label, name, line and link
 * each fade in with a 12px lift over 1000ms, at 520, 660, 800 and 940ms, on
 * the editorial easing (IntroductionReveal, styles/home.css). Every word is
 * in Site Settings (Chapter I) and the About Page.
 */
export default function Introduction({ name, portrait, copy, numeral }: Props) {
  return (
    <IntroductionReveal className="introduction px-6 md:px-16 section-py">
      <div className="introduction-words">
        <div data-step="1">
          <ChapterMark numeral={numeral} label={copy.introLabel} />
        </div>
        <h2 id="chapter-introduction" data-step="2" className="introduction-name">
          {name}
        </h2>
        <p data-step="3" className="introduction-line">
          {copy.introLine}
        </p>
        <div data-step="4" className="introduction-link">
          <TextLink href="/about">{copy.introAboutLink}</TextLink>
        </div>
      </div>
      {portrait && (
        <figure data-step="0" className="introduction-photo">
          <SanityImage
            image={portrait}
            context="body"
            alt={(typeof portrait === "object" && portrait.alt) || `Portrait of ${name}`}
            fill
            sizes="(min-width: 1024px) 520px, calc(100vw - 48px)"
            objectPosition={typeof portrait === "object" ? hotspotPosition(portrait) : undefined}
            develop={false}
            className="object-cover"
          />
        </figure>
      )}
    </IntroductionReveal>
  );
}
