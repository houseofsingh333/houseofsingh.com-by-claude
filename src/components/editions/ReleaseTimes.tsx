"use client";

import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { DEFAULT_ZONE, citiesSentence, momentIn, type CityTime } from "@/lib/editions/release";

type Props = {
  /** The release instant (ISO). */
  opens: string;
  /** The release in each city, in order (Toronto among them). */
  times: CityTime[];
};

/** The time zone never changes while the page is open: nothing to subscribe to. */
const noChange = () => () => {};

/** How long each city stays in the phone's rolling line. */
const ROLL_MS = 2500;

/**
 * When the Collection opens (Shop design round 2). Desktop: one row of
 * cities, each with its time and date. Phones: a tinted box, "In your
 * time" and the moment in the visitor's own time zone (Toronto until the
 * browser says), then "The same moment:" and the other cities rolling
 * through one at a time. Screen readers hear every city once, as one
 * sentence; with reduced motion the line stays on the first city.
 */
export default function ReleaseTimes({ opens, times }: Props) {
  // The visitor's own time zone; Toronto on the server and before hydration.
  const zone = useSyncExternalStore(
    noChange,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_ZONE,
    () => DEFAULT_ZONE,
  );
  // Which city the roll shows, and whether it slides there (the jump back to the start does not).
  const [roll, setRoll] = useState({ at: 0, slide: true });
  const local = momentIn(opens, zone);
  // The other cities: all but the visitor's own (Toronto until the browser says).
  const others = times.filter((t) => t.timeZone !== zone);

  useEffect(() => {
    if (others.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setRoll((r) => ({ at: r.at + 1, slide: true })), ROLL_MS);
    return () => window.clearInterval(timer);
  }, [others.length]);

  const sentence = `Opens at ${citiesSentence(times)}.`;
  // One step past the last is the first again (repeated at the end), so the roll never runs backwards.
  const step = Math.min(roll.at, others.length);

  return (
    <div className="ed-times">
      <p className="sr-only">{sentence}</p>
      <ol className="ed-times-row" aria-hidden="true" style={{ "--cities": times.length } as CSSProperties}>
        {times.map((t) => (
          <li key={t.label}>
            <span className="type-label text-muted-foreground">{t.label}</span>
            <span className="ed-times-clock">{t.time}</span>
            <span className="ed-times-date">{t.date}</span>
          </li>
        ))}
      </ol>
      <div className="ed-times-box" aria-hidden="true">
        <span className="type-label ed-times-box-label">In your time</span>
        <span className="ed-times-local">{local}</span>
        {others.length > 0 && (
          <span className="ed-times-same">
            <span>The same moment:</span>
            <span className="ed-times-window">
              <span
                className="ed-times-reel"
                data-snap={roll.slide ? undefined : ""}
                style={{ transform: `translateY(${-step * 1.5}em)` }}
                onTransitionEnd={() => {
                  if (step === others.length) setRoll({ at: 0, slide: false });
                }}
              >
                {[...others, others[0]].map((t, i) => (
                  <span key={`${t.label}-${i}`}>{`${t.time} in ${t.label}`}</span>
                ))}
              </span>
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
