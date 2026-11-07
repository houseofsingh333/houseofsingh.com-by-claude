"use client";

import { useEffect } from "react";

/**
 * Fallback driver for the pinned, scroll driven homepage chapters (the
 * exhibition rooms, the aperture): where the browser has no CSS scroll
 * driven animations, set each matching element's progress (--p, 0 to 1:
 * from its top reaching the top of the screen to its bottom reaching the
 * bottom) from the scroll position, only while `media` matches. Renders
 * nothing. Where scroll timelines exist, CSS does this itself.
 */
export default function ScrollProgress({ selector, media }: { selector: string; media: string }) {
  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) return;
    const query = window.matchMedia(media);
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      els.forEach((el) => {
        if (!query.matches) return el.style.removeProperty("--p");
        const rect = el.getBoundingClientRect();
        const span = rect.height - vh;
        const p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
        el.style.setProperty("--p", p.toFixed(4));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    query.addEventListener("change", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      query.removeEventListener("change", onScroll);
    };
  }, [selector, media]);
  return null;
}
