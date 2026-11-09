"use client";

import { useEffect, useRef, useState } from "react";

/** The external arrow (north east). */
function Arrow({ className }: { className: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={className}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

/** How long the fill stays after a press on a touch screen: its 600ms draw and a short hold. */
const PRESS_MS = 900;

/**
 * The call to action, "Visit House of Singh Studios": a 1px charcoal
 * outlined button in the label style. On hover and keyboard focus,
 * charcoal fills it from left to right and the text turns canvas; the
 * arrow slips out to the top right while a second glides in from the
 * bottom left (styles/home.css, Practice). A press on a touch screen
 * plays the fill briefly (data-pressed), since a touch has no hover.
 * Opens the studio site in a new tab.
 */
export default function PracticeCta({ href, label }: { href: string; label: string }) {
  const [pressed, setPressed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="practice-cta type-label"
      data-pressed={pressed ? "" : undefined}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") return;
        setPressed(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setPressed(false), PRESS_MS);
      }}
    >
      <span aria-hidden="true" className="practice-cta-fill" />
      <span className="practice-cta-text">
        {label}
        <span className="sr-only"> (opens in a new tab)</span>
      </span>
      <span aria-hidden="true" className="practice-cta-arrows">
        <Arrow className="practice-cta-arrow practice-cta-arrow-out" />
        <Arrow className="practice-cta-arrow practice-cta-arrow-in" />
      </span>
    </a>
  );
}
