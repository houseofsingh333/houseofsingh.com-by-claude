"use client";

import { useEffect, useState } from "react";

/**
 * A number or short label that crossfades when it changes (counters, the
 * Toronto time, the journal's month): the old value fades out while the
 * new one fades in, in the same place (styles/motion.css, .xfade). Screen
 * readers, find in page and checks only ever see the current value. Reduced motion: it simply
 * changes.
 */
export default function Crossfade({ value, className }: { value: string; className?: string }) {
  const [shown, setShown] = useState(value);
  const [previous, setPrevious] = useState<string | null>(null);
  const [turn, setTurn] = useState(0);
  if (value !== shown) {
    setPrevious(shown);
    setShown(value);
    setTurn((t) => t + 1);
  }
  useEffect(() => {
    if (previous === null) return;
    const t = window.setTimeout(() => setPrevious(null), 600);
    return () => window.clearTimeout(t);
  }, [previous, turn]);
  return (
    <span className={`xfade${className ? ` ${className}` : ""}`}>
      {previous !== null && (
        // The old value is drawn by CSS (::before), not page text: nothing reads or measures it as it fades.
        <span key={`out-${turn}`} className="xfade-out" data-text={previous} aria-hidden="true" />
      )}
      <span key={`in-${turn}`} className={turn ? "xfade-in" : undefined}>
        {shown}
      </span>
    </span>
  );
}
