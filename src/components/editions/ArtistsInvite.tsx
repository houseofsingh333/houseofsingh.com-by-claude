"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/** Each craft holds, then slides on; the last word ("you") slides in slower and holds longest. */
const HOLD_MS = 1500;
const SLIDE_MS = 500;
const LAST_SLIDE_MS = 800;
const LAST_HOLD_MS = 4000;

/**
 * "House of Singh × a weaver … you" (Shop design round 2): the one action
 * of For artists, leading to the proposal form. Desktop: one line in
 * Playfair, the brass ×, the rolling word over its own short underline,
 * and a round arrow at the end. Phones: a tinted panel, the words stacked
 * and "Propose a collaboration" beneath. The words roll in a window one
 * and a half lines tall, so no letter is clipped; with reduced motion the
 * last word ("you") stays. Screen readers hear "Propose a collaboration".
 */
export default function ArtistsInvite({ words, href }: { words: string[]; href: string }) {
  const list = words.length ? words : ["you"];
  const last = list.length - 1;
  const [roll, setRoll] = useState({ at: last, slide: false });
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (list.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // It opens on "you" (as without motion), then rolls through the crafts and back to "you";
    // after "you", the first craft slides in and the reel jumps back to its start unseen.
    let at = last;
    const next = () => {
      const hold = at === last ? LAST_HOLD_MS : HOLD_MS;
      timer.current = window.setTimeout(() => {
        at = at + 1;
        setRoll({ at, slide: true });
        if (at > last) {
          // The repeated first word has slid in: jump back to the real first, unseen.
          timer.current = window.setTimeout(() => {
            at = 0;
            setRoll({ at: 0, slide: false });
            next();
          }, SLIDE_MS);
        } else next();
      }, hold);
    };
    next();
    return () => window.clearTimeout(timer.current);
  }, [list.length, last]);

  const duration = roll.slide ? (roll.at === last ? LAST_SLIDE_MS : SLIDE_MS) : 0;
  const reel = (
    <span className="ed-roll" aria-hidden="true">
      <span className="ed-roll-reel" style={{ transform: `translateY(${-roll.at * 1.5}em)`, transitionDuration: `${duration}ms` }}>
        {[...list, list[0]].map((w, i) => (
          <span key={`${w}-${i}`}>{w}</span>
        ))}
      </span>
    </span>
  );

  return (
    <>
      <Link href={href} className="ed-invite-line" aria-label="Propose a collaboration">
        <span aria-hidden="true">House of Singh</span>
        <span aria-hidden="true" className="ed-invite-x">
          ×
        </span>
        {reel}
        <span aria-hidden="true" className="ed-invite-arrow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
            <path d="M5 12h13" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </span>
      </Link>
      <div className="ed-invite-panel">
        <span aria-hidden="true" className="ed-invite-panel-name">
          House of Singh
        </span>
        <span aria-hidden="true" className="ed-invite-x">
          ×
        </span>
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
