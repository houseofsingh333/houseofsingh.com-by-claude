"use client";

import { useEffect } from "react";

/**
 * The exhibition's fallback driver: where the browser has no CSS scroll
 * driven animations, set each room's progress (--p, 0 to 1) from the scroll
 * position, only while the pinned layout is active. Renders nothing.
 */
export default function ExhibitionProgress() {
  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) return;
    const pinned = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const rooms = Array.from(document.querySelectorAll<HTMLElement>(".exhibition-room"));
    let raf = 0;
    const update = () => {
      raf = 0;
      if (!pinned.matches) {
        rooms.forEach((r) => r.style.removeProperty("--p"));
        return;
      }
      const vh = window.innerHeight;
      rooms.forEach((r) => {
        const rect = r.getBoundingClientRect();
        const span = rect.height - vh;
        const p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
        r.style.setProperty("--p", p.toFixed(4));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    pinned.addEventListener("change", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      pinned.removeEventListener("change", onScroll);
    };
  }, []);
  return null;
}
