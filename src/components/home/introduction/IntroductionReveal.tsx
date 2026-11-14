"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * Marks the Introduction data-revealed the first time it comes into view,
 * once. The steps and their timing are in styles/home.css ("Chapter I,
 * Introduction"); without JavaScript, or with reduced motion, it is simply
 * there.
 */
export default function IntroductionReveal({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const shown = useInView(ref, { threshold: 0.2 });
  return (
    <section ref={ref} aria-labelledby="chapter-introduction" className={className} data-revealed={shown ? "" : undefined}>
      {children}
    </section>
  );
}
