"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import SanityImage from "@/components/SanityImage";
import type { HeroSlide } from "@/lib/placeholder-data";

// ——— Ken Burns presets ———

type KenBurnsPreset = {
  from: { scale: number; x: string; y: string };
  to: { scale: number; x: string; y: string };
};

const KEN_BURNS_PRESETS: KenBurnsPreset[] = [
  // zoom in, pan top-left
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.06, x: "-1.5%", y: "-1%" } },
  // zoom in, drift right
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.05, x: "1.5%", y: "0%" } },
  // zoom out slightly, drift down
  { from: { scale: 1.06, x: "0%", y: "-0.5%" }, to: { scale: 1.0, x: "0%", y: "0.5%" } },
  // subtle zoom in, pan bottom-right
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.04, x: "1%", y: "1%" } },
  // subtle zoom in, pan top-right
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.05, x: "1.2%", y: "-0.8%" } },
  // zoom in, pan left
  { from: { scale: 1.0, x: "0.5%", y: "0%" }, to: { scale: 1.07, x: "-1%", y: "0.3%" } },
  // slow zoom out, slight pan up
  { from: { scale: 1.08, x: "0%", y: "0.5%" }, to: { scale: 1.02, x: "0%", y: "-0.3%" } },
];

const SLIDE_DURATION = 8000; // 8 seconds per slide
const IMAGE_FADE_DURATION = 1.5;
const CAPTION_IN_DELAY = 1.2;
const CAPTION_IN_DURATION = 1.2;
const CAPTION_OUT_DURATION = 0.6;
const FIRST_SLIDE_FADE_DURATION = 1.8;

const SESSION_KEY = "hos_intro_seen";

const cubicSmooth = [0.25, 0.1, 0.25, 1] as const;
const cubicSlow = [0.4, 0, 0.2, 1] as const;

type Props = {
  slides: HeroSlide[];
};

export default function CinematicHero({ slides }: Props) {
  const prefersReduced = useReducedMotion();
  const [introComplete, setIntroComplete] = useState(false);
  const [current, setCurrent] = useState(0);
  const [showCaption, setShowCaption] = useState(false);
  const [isFirstSlide, setIsFirstSlide] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ——— Wait for Header intro to finish ———
  useEffect(() => {
    const check = () => {
      try {
        if (sessionStorage.getItem(SESSION_KEY)) {
          setIntroComplete(true);
          return true;
        }
      } catch {
        setIntroComplete(true);
        return true;
      }
      return false;
    };

    if (check()) return;

    // Poll until intro finishes (Header sets sessionStorage on video end)
    const interval = setInterval(() => {
      if (check()) clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // ——— Show caption after image settles ———
  const scheduleCaptionIn = useCallback(() => {
    captionTimerRef.current = setTimeout(() => {
      setShowCaption(true);
    }, CAPTION_IN_DELAY * 1000);
  }, []);

  // ——— Start first slide when intro completes ———
  useEffect(() => {
    if (!introComplete || slides.length === 0) return;
    // First slide: show caption after a slightly longer delay for the slower fade
    captionTimerRef.current = setTimeout(() => {
      setShowCaption(true);
    }, (FIRST_SLIDE_FADE_DURATION + 0.3) * 1000);
  }, [introComplete, slides.length]);

  // ——— Autoplay timer ———
  useEffect(() => {
    if (!introComplete || slides.length <= 1 || prefersReduced) return;

    const advance = () => {
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

  // ——— Pause autoplay when tab is hidden ———
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
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
            <p className="font-editorial italic text-sm md:text-base font-light tracking-[0.08em] text-white/80">
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
          initial={{ opacity: 0 }}
          animate={{ opacity: introComplete ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: {
              duration: fadeDuration,
              ease: cubicSlow,
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
              priority={current <= 1}
              fill
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ——— Vignette overlay — film still feel ——— */}
      <div className="absolute inset-0 pointer-events-none hero-vignette" />

      {/* ——— Bottom-left: dots + caption ——— */}
      <div className="absolute bottom-6 left-5 md:bottom-8 md:left-8 z-10 flex items-end gap-4 md:gap-5">
        {/* Slide dots — always visible once intro is done */}
        {introComplete && slides.length > 1 && (
          <div className="flex gap-2 mb-0.5">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`block w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  i === current
                    ? "bg-white scale-150"
                    : "bg-white/25"
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
              className="hidden md:block font-editorial italic text-sm font-light tracking-[0.08em] text-white/80 max-w-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{
                duration: CAPTION_IN_DURATION,
                ease: cubicSmooth,
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
