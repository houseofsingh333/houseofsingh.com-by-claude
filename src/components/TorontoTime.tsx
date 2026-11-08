"use client";

import { useSyncExternalStore } from "react";
import Crossfade from "@/components/Crossfade";

const format = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Toronto",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** The time in Toronto, for example "8:14 pm". */
function torontoNow(): string {
  return format.format(new Date()).replace(/\s?([AP])M$/, (_, p: string) => ` ${p.toLowerCase()}m`);
}

/** Ticks on each minute boundary, so the clock changes with the real minute. */
function subscribe(onChange: () => void): () => void {
  let interval = 0;
  const timeout = window.setTimeout(() => {
    onChange();
    interval = window.setInterval(onChange, 60_000);
  }, 60_000 - (Date.now() % 60_000) + 50);
  return () => {
    window.clearTimeout(timeout);
    window.clearInterval(interval);
  };
}

/**
 * The local time in Toronto, updated each minute. The server has no clock
 * to offer (pages are cached), so it renders an invisible stand in of the
 * same widest shape; the real time replaces it without moving anything,
 * because the box is sized to fit any time (see .toronto-time).
 */
export default function TorontoTime({ className = "" }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, torontoNow, () => null);
  return (
    <span className={`toronto-time ${className}`}>
      {time ? <Crossfade value={time} /> : <span className="invisible">12:00 pm</span>}
    </span>
  );
}
