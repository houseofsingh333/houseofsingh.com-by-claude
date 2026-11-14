"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Marks the Introduction data-revealed once, when the visitor has arrived at
 * it: the portrait (the words when there is none), not the whole section,
 * whose top is mostly empty canvas, and only once its top has passed about a
 * third of the way up the screen (14 Nov). Desktop and phones alike, so on a
 * phone it is measured on the portrait, which comes first. The steps and
 * their timing are in styles/home.css ("Chapter I, Introduction"); without
 * JavaScript, or with reduced motion, it is simply there.
 */
export default function IntroductionReveal({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const section = ref.current;
    const target = section?.querySelector(".introduction-photo") ?? section?.querySelector(".introduction-words");
    if (!target || shown) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // In view past the line, or already scrolled by (a page loaded or
        // reloaded further down): shown, never left hidden.
        if (entries.some((e) => e.isIntersecting || e.boundingClientRect.bottom < 0)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -33% 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <section ref={ref} aria-labelledby="chapter-introduction" className={className} data-revealed={shown ? "" : undefined}>
      {children}
    </section>
  );
}
