"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useIntro } from "@/components/IntroContext";
import { mediaMatchesNow, prefersReducedMotionNow } from "@/hooks/useMediaQuery";

const SESSION_KEY = "hos_intro_seen";
/** Hard cap so a slow or broken video never traps the user on the overlay.
   Set above the real clip length (~5.06s) so a healthy intro plays in full;
   onError/onStalled already handle broken playback immediately. */
const INTRO_MAX_MS = 6500;

/**
 * The first visit intro (header state 0): whether it plays, its fade out,
 * and when it is done. Plays once per session on desktop; skipped on phone
 * and tablet, with reduced motion, and on later visits. Tells the hero when
 * it is over through IntroContext.
 */
export function useIntroSequence() {
  const [introVisible, setIntroVisible] = useState(false);
  const [introFading, setIntroFading] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introMaxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introDismissedRef = useRef(false);

  /* Signals the hero (via context) that the intro is over — no polling. */
  const { completeIntro } = useIntro();

  /* Dismiss the intro overlay. Idempotent: whichever trigger fires first
     (video ended, error, stalled, or the hard max-duration timer) wins. The
     hero is already painted underneath, so this only fades the overlay away. */
  const dismissIntro = useCallback(() => {
    if (introDismissedRef.current) return;
    introDismissedRef.current = true;
    if (introMaxTimerRef.current) clearTimeout(introMaxTimerRef.current);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    // Tell the hero to begin right away (matches the old video-end timing).
    completeIntro();
    setIntroFading(true);
    introTimerRef.current = setTimeout(() => {
      setIntroVisible(false);
      setIntroFading(false);
      setIntroDone(true);
      document.body.style.overflow = "";
    }, 500);
  }, [completeIntro]);

  /* ── State 0: decide whether to play intro ── */
  /* eslint-disable react-hooks/set-state-in-effect -- one-time init from browser APIs */
  useEffect(() => {
    let skip = false;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) skip = true;
    } catch {
      skip = true;
    }
    if (
      !skip &&
      prefersReducedMotionNow()
    ) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      skip = true;
    }

    // Mobile: skip the intro entirely so the hero paints immediately. The
    // overlay delayed the hero caption long enough to be measured as LCP
    // (~4s render delay). Desktop keeps the full intro sequence.
    if (!skip && mediaMatchesNow("(max-width: 1023px)")) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      skip = true;
    }

    if (skip) {
      setIntroDone(true);
      completeIntro();
    } else {
      document.body.style.overflow = "hidden";
      setIntroVisible(true);
      // Hard safety net: dismiss even if the video never fires `ended`.
      introMaxTimerRef.current = setTimeout(dismissIntro, INTRO_MAX_MS);
    }
  }, [completeIntro, dismissIntro]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    return () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      if (introMaxTimerRef.current) clearTimeout(introMaxTimerRef.current);
    };
  }, []);

  return { introVisible, introFading, introDone, dismissIntro };
}

/** The intro overlay: the logo animation centred on white, fading out. */
export default function IntroOverlay({
  fading,
  onDismiss,
}: {
  fading: boolean;
  onDismiss: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 500ms ease-in-out",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {/* Centered video container with overflow hidden */}
      <div className="relative w-[480px] max-w-[85vw] overflow-hidden">
        <video
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={onDismiss}
          onError={onDismiss}
          onStalled={onDismiss}
          width={1280}
          height={720}
          className="w-full h-auto aspect-video object-cover"
          // The animation is drawn on white: multiplied onto the canvas, its
          // white becomes the canvas colour and the logo is unchanged (audit S5).
          style={{ mixBlendMode: "multiply" }}
        >
          <source
            src="/images/HOS_Logo_Animation.mp4"
            type="video/mp4"
          />
        </video>
        {/* Edge feather mask: blends the video's edges into the canvas */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: "inset 0 0 40px 20px var(--background)",
          }}
        />
      </div>
    </div>
  );
}
