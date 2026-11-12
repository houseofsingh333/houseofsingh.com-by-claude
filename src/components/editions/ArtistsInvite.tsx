"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "@/components/Link";
import { useInView } from "@/hooks/useInView";
import DrawnTimes from "./DrawnTimes";

/** Each craft holds, then slides on; the last word ("you") slides in slower and holds longest. */
const HOLD_MS = 1500;
const SLIDE_MS = 500;
const LAST_SLIDE_MS = 800;
const LAST_HOLD_MS = 4000;

const REDUCED = "(prefers-reduced-motion: reduce)";
const prefersStill = () => window.matchMedia(REDUCED).matches;
const watchMotion = (change: () => void) => {
  const q = window.matchMedia(REDUCED);
  q.addEventListener("change", change);
  return () => q.removeEventListener("change", change);
};

/**
 * "House of Singh × a weaver … you" (Shop design round 2): the one action
 * of For artists, leading to the proposal form. Desktop: one line in
 * Playfair, the brass ×, the rolling word over its own short underline,
 * and a round arrow at the end. Phones: a tinted panel, the words stacked
 * and "Propose a collaboration" beneath. The words start on the first
 * craft and roll through to "you", which holds longest, then go round
 * again; the window is one and a half lines tall, so no letter is
 * clipped. With reduced motion the last word ("you") stays. Screen readers hear "Propose a collaboration".
 * The words roll only while they are on screen (the desktop line or the
 * phone panel, whichever the screen shows); elsewhere nothing runs.
 */
export default function ArtistsInvite({ words, href }: { words: string[]; href: string }) {
  const list = words.length ? words : ["you"];
  const last = list.length - 1;
  const [roll, setRoll] = useState({ at: 0, slide: false });
  const timer = useRef<number | undefined>(undefined);
  /** The word showing now, so the roll carries on from it after a pause. */
  const showing = useRef(0);
  const still = useSyncExternalStore(watchMotion, prefersStill, () => false);
  const lineRef = useRef<HTMLAnchorElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lineSeen = useInView(lineRef, { once: false });
  const panelSeen = useInView(panelRef, { once: false });
  const onScreen = lineSeen || panelSeen;

  useEffect(() => {
    if (list.length < 2 || still || !onScreen) return;
    // It opens on the first craft ("a weaver"), rolls through to "you", holds,
    // then the first craft slides in again and the reel jumps back to its start unseen.
    let at = showing.current;
    const show = (to: number, slide: boolean) => {
      at = showing.current = to;
      setRoll({ at: to, slide });
    };
    const next = () => {
      if (at > last) {
        // The repeated first word has slid in: jump back to the real first, unseen.
        timer.current = window.setTimeout(() => {
          show(0, false);
          next();
        }, SLIDE_MS);
        return;
      }
      timer.current = window.setTimeout(() => {
        show(at + 1, true);
        next();
      }, at === last ? LAST_HOLD_MS : HOLD_MS);
    };
    next();
    return () => window.clearTimeout(timer.current);
  }, [list.length, last, still, onScreen]);

  // With reduced motion the last word ("you") stays.
  const at = still ? last : roll.at;
  const duration = !still && roll.slide ? (roll.at === last ? LAST_SLIDE_MS : SLIDE_MS) : 0;
  const reel = (
    <span className="ed-roll" aria-hidden="true">
      <span className="ed-roll-reel" style={{ transform: `translateY(${-at * 1.5}em)`, transitionDuration: `${duration}ms` }}>
        {[...list, list[0]].map((w, i) => (
          <span key={`${w}-${i}`}>{w}</span>
        ))}
      </span>
    </span>
  );

  return (
    <>
      <Link ref={lineRef} href={href} className="ed-invite-line" aria-label="Propose a collaboration">
        <span aria-hidden="true" className="ed-invite-words">
          House of Singh
          <DrawnTimes className="ed-invite-x" />
          {reel}
        </span>
        <span aria-hidden="true" className="ed-invite-arrow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
            <path d="M5 12h13" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </span>
      </Link>
      <div ref={panelRef} className="ed-invite-panel">
        <span aria-hidden="true" className="ed-invite-panel-name">
          House of Singh
        </span>
        <DrawnTimes className="ed-invite-x" />
        {reel}
        <Link href={href} className="text-link ed-invite-panel-link">
          <span className="text-link-text">Propose a collaboration</span>
          <span aria-hidden="true" className="text-link-arrow">
            {"→"}
          </span>
        </Link>
      </div>
    </>
  );
}
