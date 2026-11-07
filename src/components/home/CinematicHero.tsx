"use client";

import { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";
import SanityImage from "@/components/SanityImage";
import { useIntro } from "@/components/IntroContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import type { HeroSlide } from "@/lib/types";

/*
 * Home hero slideshow, in CSS (no animation library). See "Hero slideshow" in
 * globals.css: each slide crossfades in over --hero-fade (about 2s) on
 * --ease-slow, on top of the previous slide, and drifts with a slow, gentle
 * Ken Burns zoom. Reduced motion: the first slide, still, with no zoom.
 */

// ——— Ken Burns presets: gentle (about 40% smaller moves than before) ———

type KenBurnsPreset = {
  from: { scale: number; x: string; y: string };
  to: { scale: number; x: string; y: string };
};

const KEN_BURNS_PRESETS: KenBurnsPreset[] = [
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.035, x: "-0.9%", y: "-0.6%" } },
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.03, x: "0.9%", y: "0%" } },
  { from: { scale: 1.035, x: "0%", y: "-0.3%" }, to: { scale: 1.0, x: "0%", y: "0.3%" } },
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.025, x: "0.6%", y: "0.6%" } },
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.03, x: "0.7%", y: "-0.5%" } },
  { from: { scale: 1.0, x: "0.3%", y: "0%" }, to: { scale: 1.04, x: "-0.6%", y: "0.2%" } },
  { from: { scale: 1.045, x: "0%", y: "0.3%" }, to: { scale: 1.01, x: "0%", y: "-0.2%" } },
];

const SLIDE_DURATION = 8000;
const CAPTION_IN_DELAY = 1.2;
const CAPTION_OUT_DURATION = 0.6;

type Props = {
  slides: HeroSlide[];
};

/** CSS variables for a slide's Ken Burns start and end. */
function kenBurnsVars(preset: KenBurnsPreset): CSSProperties {
  return {
    "--kb-from": `translate(${preset.from.x}, ${preset.from.y}) scale(${preset.from.scale})`,
    "--kb-to": `translate(${preset.to.x}, ${preset.to.y}) scale(${preset.to.scale})`,
  } as CSSProperties;
}

export default function CinematicHero({ slides }: Props) {
  const prefersReduced = usePrefersReducedMotion();
  // Shared signal from the Header intro overlay — no polling.
  const { introComplete } = useIntro();
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
    () => new Set([0, 1].filter((i) => i < slides.length)),
  );
  const next = slides.length ? (current + 1) % slides.length : 0;
  if (slides.length > 0 && (!loaded.has(current) || !loaded.has(next))) {
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
    if (!introComplete || slides.length <= 1 || prefersReduced) return;

    const advance = () => {
      // Skip advance if tab is hidden — autoplay resumes on next interval when visible
      if (!visibleRef.current) return;
      // 1. Hide caption first
      setShowCaption(false);

      // 2. After caption fades out, switch slide
      timerRef.current = setTimeout(() => {
        setSlide((s) => ({
          current: (s.current + 1) % slides.length,
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
  }, [introComplete, slides.length, prefersReduced, scheduleCaptionIn]);

  if (slides.length === 0) return null;

  const slide = slides[current];

  // ——— Reduced motion: static first slide, no animation ———
  if (prefersReduced) {
    return (
      <div className="relative w-full h-[100svh] bg-secondary overflow-hidden">
        <SanityImage
          image={slides[0].image}
          context="hero"
          alt={slides[0].imageAlt || slides[0].caption || "Hero"}
          priority
          fill
          className="object-cover"
        />
        <div className="hero-vignette absolute inset-0 pointer-events-none" />
        {slides[0].caption && (
          <div className="absolute bottom-8 left-5 md:bottom-10 md:left-8 z-10">
            <p className="text-xs tracking-[0.15em] uppercase text-white/70">
              {slides[0].caption}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100svh] bg-secondary overflow-hidden">
      {/* ——— Image layers: crossfade + Ken Burns, in CSS ——— */}
      {slides.map((s, i) => {
        if (!loaded.has(i)) return null;
        const state =
          i === current ? "active" : i === previous ? "leaving" : "idle";
        return (
          <div
            key={s._id + "-" + i}
            className="hero-slide"
            data-state={state}
            // The first slide is shown at once, with no fade in.
            data-first={isFirstSlide && i === current ? "" : undefined}
            aria-hidden={state !== "active"}
          >
            <div
              className="hero-kb"
              style={kenBurnsVars(KEN_BURNS_PRESETS[i % KEN_BURNS_PRESETS.length])}
              // The zoom runs once the intro is done, restarting each time
              // the slide becomes active, and keeps running while it is
              // covered by the next slide.
              data-run={introComplete && state !== "idle" ? "" : undefined}
            >
              <SanityImage
                image={s.image}
                context="hero"
                alt={s.imageAlt || s.caption || "Hero"}
                priority={i === 0}
                fill
                className="object-cover"
              />
            </div>
          </div>
        );
      })}

      {/* ——— Vignette overlay — film still feel ——— */}
      <div className="absolute inset-0 pointer-events-none hero-vignette" />

      {/* ——— Bottom-left: dots + caption ——— */}
      <div className="absolute bottom-6 left-5 md:bottom-8 md:left-8 z-10 flex items-center gap-4 md:gap-5">
        {/* Slide dots: their space is held from the first paint (hidden
            until the intro is done), so the caption beside them never
            moves. With JavaScript off they are not shown at all. */}
        {slides.length > 1 && (
          <div
            className={`hero-dots flex items-center gap-2 ${introComplete ? "" : "invisible"}`}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                // The visible dot stays 6px; the ::after pseudo-element adds a
                // centred 24x24 invisible hit area so the touch target meets
                // the 24px minimum without changing the design.
                className={`p-0 border-0 block w-1.5 h-1.5 rounded-full transition-all duration-500 cursor-pointer relative after:content-[''] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-6 after:h-6 ${
                  i === current
                    ? "bg-white scale-150"
                    : "bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Caption — sequenced separately from the image: fades out, then
            the next one rises in. The first caption paints at full opacity,
            so it is never an invisible LCP element. */}
        {slide.caption && (
          <p
            className="hero-caption text-[10px] md:text-xs tracking-[0.15em] uppercase text-white/70 max-w-[200px] md:max-w-md"
            data-visible={showCaption ? "" : undefined}
            data-first={isFirstSlide ? "" : undefined}
          >
            {slide.caption}
          </p>
        )}
      </div>

      {/* ——— Scroll indicator — right side ——— */}
      {introComplete && (
        <div className="absolute bottom-6 right-5 md:bottom-8 md:right-8 z-10 hidden md:flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-widest uppercase text-white/40">
            Scroll
          </span>
          <div className="w-px h-8 bg-white/20 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-3 bg-white/50"
              style={{ animation: "scrollPulse 2s ease-in-out infinite" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
