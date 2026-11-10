import RecordPlayer from "./RecordPlayer";
import type { SiteCopy } from "@/lib/siteCopy";
import ChapterMark from "@/components/ChapterMark";

/*
 * Chapter VI, on my turntable (canvas "On my turntable", frame "A with C:
 * a peek on arrival, out and turning on play"). The label, the heading and
 * one statement on the left; on the right a sleeve of text only (Side A,
 * Vol. 01, After hours, the genres) with the record behind it, and the
 * compact Spotify player beneath.
 * The record (RecordPlayer drives it, "Record" in styles/home.css): fully
 * inside the sleeve until the chapter comes into view, then it slides out
 * to a small peek (once a visit); while the playlist plays it slides out
 * past half its width and turns; paused, it stops, then slides back to its
 * peek. Reduced motion: positions change at once and it never turns.
 * The sleeve and record are decorative; the player has its own controls.
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
  /** Site Settings, Chapter VI (today's text when empty). */
  copy: SiteCopy;
};

export default function RecordChapter({ playlistUrl, copy }: Props) {
  if (!playlistUrl) return null;
  const embedSrc = toEmbedUrl(playlistUrl);

  return (
    <section aria-labelledby="chapter-listening" className="turntable px-6 md:px-16 section-py">
      <div className="turntable-text">
        <ChapterMark numeral="VI" label={copy.listeningLabel} />
        <h2 id="chapter-listening" className="turntable-heading font-editorial font-normal text-foreground">
          {copy.listeningHeading}
        </h2>
        <p className="turntable-note text-foreground">{copy.listeningNote}</p>
      </div>

      <div className="turntable-stage">
        {/* The record behind its sleeve: decorative. */}
        <div id={RECORD_ID} className="record" aria-hidden="true">
          <div className="record-disc">
            <div className="record-spin">
              <span className="record-label">
                <Crest className="record-label-crest" />
              </span>
            </div>
          </div>
          <div className="record-sleeve">
            <div className="record-sleeve-top">
              <span>{copy.listeningSide}</span>
              <span>{copy.listeningVolume}</span>
            </div>
            <div className="record-sleeve-title">
              <span>{copy.listeningSleeveTitle}</span>
              <span className="record-sleeve-rule" />
            </div>
            <span className="record-sleeve-genres">{copy.listeningGenres}</span>
          </div>
        </div>
        <RecordPlayer embedSrc={embedSrc} recordId={RECORD_ID} title={copy.listeningPlayerLabel} />
      </div>
    </section>
  );
}
