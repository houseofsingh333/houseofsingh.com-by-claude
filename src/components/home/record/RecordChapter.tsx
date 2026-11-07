import SanityImage from "@/components/SanityImage";
import type { SanityImage as SanityImageData } from "@/lib/types";
import RecordPlayer from "./RecordPlayer";
import type { SiteCopy } from "@/lib/siteCopy";

/*
 * Chapter VI, the record: the playlist as a record on Maninder's shelf. A
 * square sleeve with a vinyl disc peeking out from behind it, and the
 * Spotify player beneath. The disc turns slowly only while the playlist
 * plays (see RecordPlayer and "Record" in styles/home.css); with reduced
 * motion it never turns.
 */

const RECORD_ID = "studio-record";

/**
 * Convert any Spotify URL to its embed form so the iframe renders an inline
 * player instead of redirecting to the Spotify app.
 */
function toEmbedUrl(raw: string): string {
  if (raw.includes("open.spotify.com/embed/")) return raw;
  const open = raw.match(
    /https?:\/\/open\.spotify\.com\/(playlist|album|track|episode|show)\/([^?#]+)/,
  );
  if (open) return `https://open.spotify.com/embed/${open[1]}/${open[2]}?utm_source=generator`;
  const uri = raw.match(/spotify:(playlist|album|track|episode|show):(\w+)/);
  if (uri) return `https://open.spotify.com/embed/${uri[1]}/${uri[2]}?utm_source=generator`;
  return raw;
}

/** The crest, drawn in the current text colour through a mask. */
function Crest({ className }: { className: string }) {
  return <span aria-hidden="true" className={`record-crest ${className}`} />;
}

type Props = {
  playlistUrl?: string;
  sleeve?: SanityImageData | null;
  /** Site Settings, Chapter VI (today's text when empty). */
  copy: SiteCopy;
};

export default function RecordChapter({ playlistUrl, sleeve, copy }: Props) {
  if (!playlistUrl) return null;
  const embedSrc = toEmbedUrl(playlistUrl);

  return (
    <section aria-labelledby="chapter-listening" className="px-6 md:px-16 section-py">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] gap-14 lg:gap-24 items-center">
        <div className="flex flex-col gap-7 max-w-[560px]">
          <div className="flex items-baseline gap-4">
            <span aria-hidden="true" className="font-editorial italic text-[30px] leading-none text-accent">
              VI
            </span>
            <span className="text-[13px] tracking-[0.14em] uppercase text-muted-foreground">
              {copy.listeningLabel}
            </span>
          </div>
          <h2
            id="chapter-listening"
            className="font-editorial font-normal text-[36px] md:text-[44px] lg:text-[52px] leading-[1.1] text-foreground"
          >
            {copy.listeningHeading}
          </h2>
          <p className="font-editorial italic text-[20px] md:text-[22px] leading-[1.5] text-foreground">
            {copy.listeningNote}
          </p>
          <p className="text-[16px] md:text-[17px] leading-[1.7] text-muted-foreground max-w-[480px]">
            {copy.listeningIntro}
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {/* The record: the disc sits behind the sleeve and peeks out. */}
          <div id={RECORD_ID} className="record">
            <div className="record-disc" aria-hidden="true">
              <div className="record-spin">
                <span className="record-label">
                  <Crest className="record-label-crest" />
                </span>
              </div>
            </div>
            <div className="record-sleeve">
              {sleeve ? (
                <SanityImage
                  image={sleeve}
                  context="thumbnail"
                  fill
                  sizes="(min-width: 1024px) 384px, 64vw"
                  className="object-cover"
                />
              ) : (
                <Crest className="record-sleeve-crest" />
              )}
              <span className="record-tag">{copy.listeningTag}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[12px] tracking-[0.14em] uppercase text-muted-foreground">
              {copy.listeningPlayerLabel}
            </p>
            <RecordPlayer embedSrc={embedSrc} recordId={RECORD_ID} title={copy.listeningPlayerLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}
