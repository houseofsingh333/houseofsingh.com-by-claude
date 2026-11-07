"use client";

import { useEffect, useState, type RefObject } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * The archive strip's card nearest the centre (the one in focus), and the
 * custom micro scrollbar thumb, which is moved through its ref with no
 * re-render. Returns the centred card's index.
 */
export function useCentredCard(
  scrollRef: RefObject<HTMLDivElement | null>,
  thumbRef: RefObject<HTMLDivElement | null>,
): number {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      // 1. Center-card detection (grayscale→color focus)
      const scrollCenter = el.scrollLeft + el.clientWidth / 2;
      const cards = el.querySelectorAll<HTMLElement>("[data-archive-card]");
      let closest = 0;
      let minDist = Infinity;

      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(scrollCenter - cardCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });

      setActiveIndex((prev) => (prev === closest ? prev : closest));

      // 2. Update custom scrollbar thumb (via ref — no re-render)
      const thumb = thumbRef.current;
      if (thumb) {
        const ratio = el.clientWidth / el.scrollWidth;
        const thumbW = Math.max(ratio * 100, 8);
        const maxScroll = el.scrollWidth - el.clientWidth;
        const progress = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
        const thumbL = progress * (100 - thumbW);
        thumb.style.width = `${thumbW}%`;
        thumb.style.transform = `translateX(${(thumbL / thumbW) * 100}%)`;
      }
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef, thumbRef]);

  return activeIndex;
}

/**
 * A one time scroll hint: once per session, when the strip is 30% in view,
 * it eases 14px to the left and back. Cancelled by any wheel, touch or
 * press on the strip; never runs with reduced motion.
 */
export function useScrollHint(
  scrollRef: RefObject<HTMLDivElement | null>,
  prefersReducedMotion: boolean,
) {
  const stripInView = useInView(scrollRef, { threshold: 0.3 });
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !stripInView || prefersReducedMotion) return;

    const STORAGE_KEY = "projects-nudge-done";
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    let cancelled = false;
    let nudgeRaf: number | undefined;

    const cancelNudge = () => {
      cancelled = true;
    };

    // Ease-in-out cubic
    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Cancel on any user interaction
    el.addEventListener("wheel", cancelNudge, { once: true });
    el.addEventListener("touchstart", cancelNudge, { once: true });
    el.addEventListener("mousedown", cancelNudge, { once: true });

    const duration = 650;
    const distance = 14;

    const start = performance.now();
    const animateOut = (now: number) => {
      if (cancelled) return;
      const t = Math.min((now - start) / duration, 1);
      el.scrollLeft = distance * easeInOut(t);
      if (t < 1) {
        nudgeRaf = requestAnimationFrame(animateOut);
      } else {
        const start2 = performance.now();
        const animateBack = (now2: number) => {
          if (cancelled) return;
          const t2 = Math.min((now2 - start2) / duration, 1);
          el.scrollLeft = distance * (1 - easeInOut(t2));
          if (t2 < 1) nudgeRaf = requestAnimationFrame(animateBack);
        };
        nudgeRaf = requestAnimationFrame(animateBack);
      }
    };

    const delay = setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* noop */
      }
      if (!cancelled) nudgeRaf = requestAnimationFrame(animateOut);
    }, 300);

    return () => {
      clearTimeout(delay);
      if (nudgeRaf) cancelAnimationFrame(nudgeRaf);
      el.removeEventListener("wheel", cancelNudge);
      el.removeEventListener("touchstart", cancelNudge);
      el.removeEventListener("mousedown", cancelNudge);
    };
  }, [scrollRef, stripInView, prefersReducedMotion]);
}
