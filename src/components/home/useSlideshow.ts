"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const SLIDE_DURATION = 8000;
const CAPTION_IN_DELAY = 1.2;
const CAPTION_OUT_DURATION = 0.6;

/**
 * The home hero slideshow's timing: which slide is shown and which it
 * replaced, the caption sequence (fade out, switch, rise in), dot
 * navigation, a pause while the tab is hidden, and autoplay every 8 s once
 * the intro is complete. Slides load progressively: the current and the
 * next, then each later one as the show reaches it; loaded slides stay.
 * No autoplay with reduced motion or a single slide.
 */
export function useSlideshow(
  slideCount: number,
  introComplete: boolean,
  prefersReduced: boolean,
) {
  // The slide shown, and the one it replaced (kept underneath while the new
  // one fades in over it, its zoom still running so it never snaps back).
  const [{ current, previous }, setSlide] = useState<{
    current: number;
    previous: number | null;
  }>({ current: 0, previous: null });
  // Starts true so the first caption is present in the server-rendered HTML
  // and paints with the hero. Gating it behind the intro made it an invisible
  // LCP element (4-5s render delay). Later slides re-sequence it normally.
  const [showCaption, setShowCaption] = useState(true);
  const [isFirstSlide, setIsFirstSlide] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Slides load progressively: the current and the next, then each later one
  // as the show reaches the slide before it. Loaded slides stay mounted.
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(
    () => new Set([0, 1].filter((i) => i < slideCount)),
  );
  const next = slideCount ? (current + 1) % slideCount : 0;
  if (slideCount > 0 && (!loaded.has(current) || !loaded.has(next))) {
    setLoaded(new Set([...loaded, current, next]));
  }

  const showSlide = useCallback((index: number) => {
    setSlide((s) =>
      s.current === index ? s : { current: index, previous: s.current },
    );
    setIsFirstSlide(false);
  }, []);

  // ——— Show caption after image settles ———
  const scheduleCaptionIn = useCallback(() => {
    captionTimerRef.current = setTimeout(() => {
      setShowCaption(true);
    }, CAPTION_IN_DELAY * 1000);
  }, []);

  // ——— Manual slide navigation (dot click) ———
  const goToSlide = useCallback((index: number) => {
    if (index === current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
    setShowCaption(false);
    setTimeout(() => {
      showSlide(index);
      scheduleCaptionIn();
    }, CAPTION_OUT_DURATION * 1000 + 50);
  }, [current, showSlide, scheduleCaptionIn]);

  // ——— Pause autoplay when tab is hidden, resume when visible ———
  const visibleRef = useRef(true);
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        visibleRef.current = false;
        if (timerRef.current) clearTimeout(timerRef.current);
        if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
      } else {
        visibleRef.current = true;
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // ——— Autoplay timer ———
  useEffect(() => {
    if (!introComplete || slideCount <= 1 || prefersReduced) return;

    const advance = () => {
      // Skip advance if tab is hidden — autoplay resumes on next interval when visible
      if (!visibleRef.current) return;
      // 1. Hide caption first
      setShowCaption(false);

      // 2. After caption fades out, switch slide
      timerRef.current = setTimeout(() => {
        setSlide((s) => ({
          current: (s.current + 1) % slideCount,
          previous: s.current,
        }));
        setIsFirstSlide(false);

        // 3. Schedule caption in for new slide
        scheduleCaptionIn();
      }, CAPTION_OUT_DURATION * 1000 + 100);
    };

    const id = setInterval(advance, SLIDE_DURATION);
    return () => {
      clearInterval(id);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
    };
  }, [introComplete, slideCount, prefersReduced, scheduleCaptionIn]);

  return { current, previous, showCaption, isFirstSlide, loaded, goToSlide };
}
