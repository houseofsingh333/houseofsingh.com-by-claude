"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * True once the element has scrolled into view (and stays true).
 *
 * Only marks the moment of reveal. Whether anything is ever hidden is
 * decided by CSS (see "Scroll reveal" in globals.css): the hidden start
 * state applies only when JavaScript is running and the visitor allows
 * motion, so server HTML, reduced motion and no JavaScript all show the
 * content straight away.
 */
export function useRevealOnScroll(
  ref: RefObject<Element | null>,
  threshold = 0.15,
): boolean {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || revealed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, revealed]);

  return revealed;
}
