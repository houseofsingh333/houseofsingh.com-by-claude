import Link from "next/link";
import { devPlaceholder } from "@/lib/placeholders";
import { plainParagraphs, splitFirstSentence } from "@/lib/portableText";
import type { HomeIntroData } from "@/lib/types";
import ArtistPortrait from "./artist/ArtistPortrait";
import type { SiteCopy } from "@/lib/siteCopy";
import LineReveal from "./artist/LineReveal";

const FALLBACK_BIO =
  "Depth over noise. Craft over trend. Always evolving, never in a rush. A creative practice rooted in Toronto, built on intention and quiet consistency.";

const FALLBACK_PORTRAIT = "/images/hero-placeholder-1.svg";

/**
 * Chapter II, the artist. Left: the portrait with its colour reveal. Right:
 * the brass numeral, the home bio from Sanity (its first sentence lifted
 * out as one large Playfair statement that reveals line by line, the rest
 * at reading size) and a link to About. Phone: portrait above, text below.
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
          <span
            aria-hidden="true"
            className="font-editorial italic text-[30px] leading-none text-accent"
          >
            II
          </span>
          <h2 id="chapter-artist" className="sr-only">
            {copy.artistHeading}
          </h2>
          <LineReveal
            text={first}
            className="font-editorial font-normal text-[34px] md:text-[44px] lg:text-[52px] leading-[1.15] text-foreground max-w-[620px] text-balance"
          />
          {reading.map((p, i) => (
            <p
              key={i}
              className="text-[17px] leading-[1.7] text-foreground max-w-[520px]"
            >
              {p}
            </p>
          ))}
          <Link
            href="/about"
            className="self-start text-[13px] tracking-[0.12em] uppercase text-foreground border-b border-foreground pb-1 transition-colors duration-(--dur-hover) ease-(--ease-soft-out) hover:text-muted-foreground hover:border-muted-foreground"
          >
            {copy.artistLink}
          </Link>
        </div>
      </div>
    </section>
  );
}
