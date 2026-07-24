"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import SanityImage from "@/components/SanityImage";
import { useIntro } from "@/components/IntroContext";
import type { HeroSlide } from "@/lib/placeholder-data";
import { EASE_SMOOTH, EASE_SLOW } from "@/lib/animation";

// ——— Ken Burns presets ———

type KenBurnsPreset = {
  from: { scale: number; x: string; y: string };
  to: { scale: number; x: string; y: string };
};

const KEN_BURNS_PRESETS: KenBurnsPreset[] = [
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.06, x: "-1.5%", y: "-1%" } },
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.05, x: "1.5%", y: "0%" } },
  { from: { scale: 1.06, x: "0%", y: "-0.5%" }, to: { scale: 1.0, x: "0%", y: "0.5%" } },
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.04, x: "1%", y: "1%" } },
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.05, x: "1.2%", y: "-0.8%" } },
  { from: { scale: 1.0, x: "0.5%", y: "0%" }, to: { scale: 1.07, x: "-1%", y: "0.3%" } },
  { from: { scale: 1.08, x: "0%", y: "0.5%" }, to: { scale: 1.02, x: "0%", y: "-0.3%" } },
];

const SLIDE_DURATION = 8000;
const IMAGE_FADE_DURATION = 1.5;
const CAPTION_IN_DELAY = 1.2;
const CAPTION_IN_DURATION = 1.2;
const CAPTION_OUT_DURATION = 0.6;
const FIRST_SLIDE_FADE_DURATION = 1.8;

type Props = {
  slides: HeroSlide[];
};

export default function CinematicHero({ slides }: Props) {
  const prefersReduced = useReducedMotion();
  // Shared signal from the Header intro overlay — no polling.
  const { introComplete } = useIntro();
  const [current, setCurrent] = useState(0);
  // Starts true so the first caption is present in the server-rendered HTML
  // and paints with the hero. Gating it behind the intro made it an invisible
  // LCP element (4-5s render delay). Later slides re-sequence it normally.
  const [showCaption, setShowCaption] = useState(true);
  const [isFirstSlide, setIsFirstSlide] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setCurrent(index);
      setIsFirstSlide(false);
      scheduleCaptionIn();
    }, CAPTION_OUT_DURATION * 1000 + 50);
  }, [current, scheduleCaptionIn]);

  // The first caption is shown from the initial render (see useState above),
  // so there is no intro-gated timer here. Later slides are sequenced by
  // scheduleCaptionIn() from the autoplay/navigation handlers.

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
        setCurrent((prev) => {
          const next = (prev + 1) % slides.length;
          return next;
        });
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

  if (slides.length === 0) return null;

  const slide = slides[current];
  const preset = KEN_BURNS_PRESETS[current % KEN_BURNS_PRESETS.length];
  const fadeDuration = isFirstSlide ? FIRST_SLIDE_FADE_DURATION : IMAGE_FADE_DURATION;

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
      {/* ——— Image layers with crossfade + Ken Burns ——— */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide._id + "-" + current}
          className="absolute inset-0"
          // First slide paints at full opacity from the first frame so it is
          // the LCP element, independent of the intro. Later slides crossfade.
          initial={{ opacity: isFirstSlide ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: {
              duration: fadeDuration,
              ease: EASE_SLOW,
            },
          }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{
              scale: preset.from.scale,
              x: preset.from.x,
              y: preset.from.y,
            }}
            animate={introComplete ? {
              scale: preset.to.scale,
              x: preset.to.x,
              y: preset.to.y,
            } : undefined}
            transition={{
              duration: SLIDE_DURATION / 1000,
              ease: "linear",
            }}
          >
            <SanityImage
              image={slide.image}
              context="hero"
              alt={slide.imageAlt || slide.caption || "Hero"}
              priority={current === 0}
              fill
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ——— Vignette overlay — film still feel ——— */}
      <div className="absolute inset-0 pointer-events-none hero-vignette" />

      {/* ——— Bottom-left: dots + caption ——— */}
      <div className="absolute bottom-6 left-5 md:bottom-8 md:left-8 z-10 flex items-center gap-4 md:gap-5">
        {/* Slide dots — always visible once intro is done */}
        {introComplete && slides.length > 1 && (
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`p-0 border-0 block w-1.5 h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  i === current
                    ? "bg-white scale-150"
                    : "bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Caption — sequenced separately from image */}
        <AnimatePresence mode="wait">
          {showCaption && slide.caption && (
            <motion.p
              key={"caption-" + current}
              className="text-[10px] md:text-xs tracking-[0.15em] uppercase text-white/70 max-w-[200px] md:max-w-md"
              // The first caption paints at full opacity so it is never an
              // invisible LCP element. Subsequent slides keep the calm
              // fade-and-rise reveal.
              initial={
                isFirstSlide ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{
                duration: isFirstSlide ? 0 : CAPTION_IN_DURATION,
                ease: EASE_SMOOTH,
              }}
            >
              {slide.caption}
            </motion.p>
          )}
        </AnimatePresence>
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
