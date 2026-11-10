import ChapterMark from "@/components/ChapterMark";
import TextLink from "@/components/TextLink";
import { devPlaceholder } from "@/lib/placeholders";
import { plainParagraphs, splitFirstSentence } from "@/lib/portableText";
import type { HomeIntroData } from "@/lib/types";
import ArtistPortrait from "./artist/ArtistPortrait";
import type { SiteCopy } from "@/lib/siteCopy";
import LineReveal from "./artist/LineReveal";
import { linkStudio } from "@/components/StudioLink";

const FALLBACK_BIO =
  "Depth over noise. Craft over trend. Always evolving, never in a rush. A creative practice rooted in Toronto, built on intention and quiet consistency.";

const FALLBACK_PORTRAIT = "/images/hero-placeholder-1.svg";

/**
 * Chapter II, the artist. Left: the portrait with its colour reveal. Right:
 * the chapter mark (II, "The artist"), the home bio from Sanity (its first
 * sentence lifted out as the site's opening statement in Playfair at
 * display-m, revealing line by line: the one approved exception to "serif
 * for names and numbers, sans for sentences", 10 Nov), the rest at reading
 * size, and the text link to About. Phone: portrait above, text below.
 */
export default function IntroSection({ data, copy }: { data: HomeIntroData; copy: SiteCopy }) {
  const portrait = data.portrait ?? devPlaceholder(FALLBACK_PORTRAIT, null);
  const founderName = data.founderName ?? "Maninder Singh";
  const paragraphs = plainParagraphs(data.founderBio);
  const [lead, ...more] = paragraphs.length ? paragraphs : [FALLBACK_BIO];
  const { first, rest } = splitFirstSentence(lead);
  const reading = [rest, ...more].filter(Boolean);

  return (
    <section aria-labelledby="chapter-artist" className="px-6 md:px-16 section-py">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] gap-12 lg:gap-24 items-center">
        <ArtistPortrait
          portrait={portrait}
          alt={`Portrait of ${founderName}`}
          caption={copy.artistCaption}
        />
        <div className="flex flex-col gap-7 md:gap-8">
          <ChapterMark numeral="II" label={copy.artistHeading} headingId="chapter-artist" />
          <LineReveal
            text={first}
            className="font-editorial font-normal text-display-m leading-[1.25] text-foreground max-w-[620px] text-balance"
          />
          {reading.map((p, i) => (
            <p
              key={i}
              className="text-body leading-[1.7] text-foreground max-w-[520px]"
            >
              {linkStudio(p)}
            </p>
          ))}
          <TextLink href="/about" className="self-start">
            {copy.artistLink}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
