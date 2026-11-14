"use client";

import { useEffect, useRef } from "react";

/** Set once the opening has played this session (the same key as before). */
const SEEN = "hos_intro_seen";
/** A slow or broken video never holds the opening: the still crest by then. */
const MAX_MS = 6500;
/** The first scroll over which the crest fades and settles (canvas: 260px). */
const SETTLE_PX = 260;

/** The opening plays at most once per page load: only the page loaded first. */
let landed = false;

/**
 * The opening of Home (approved 14 Nov; canvas "Home hero, proposal",
 * artboard "In continuation"). On a first visit the logo animation plays
 * centred (about 760px wide on desktop, 300px on a phone) and, when it
 * ends, its last frame, the crest, stays in place as the first screen: no
 * overlay lifting away. The animation is drawn on white and multiplied onto
 * the canvas, so its frame has the canvas colour and isolation (otherwise a
 * white patch shows). Returning visitors and reduced motion: the still crest
 * at once, the site's drawing placed where the animation's crest ends.
 *
 * Beneath it the scroll cue ("Scroll" over a hairline drawing downward on a
 * 2.8s cycle), shown once the crest is still and only at the very top. On
 * the first scroll the crest fades and settles to 0.65 while HOUSE OF SINGH
 * appears in the header, as on every page. Reduced motion: everything still
 * and complete (no settling, the cue's line at rest).
 */
export default function HomeOpening({ scrollWord }: { scrollWord: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const html = document.documentElement;
    const video = section.querySelector("video");
    const seen = () => {
      try {
        sessionStorage.setItem(SEEN, "1");
      } catch {}
    };
    // "play" or "still" was decided in the root layout's script, before the
    // first paint (it marks <html data-opening>). Arriving from another page
    // shows the still crest, never an animation starting late.
    const first = !landed;
    landed = true;
    if (!first || html.dataset.opening !== "play" || !video) {
      if (html.dataset.opening !== "ended") html.dataset.opening = "still";
    }
    // The animation's end: its last frame stays; the cue may show.
    const ended = () => {
      if (html.dataset.opening === "play") html.dataset.opening = "ended";
      seen();
    };
    // It failed or stalled: the still crest instead, at once.
    const failed = () => {
      if (html.dataset.opening === "play") html.dataset.opening = "still";
      seen();
    };
    let timer: number | undefined;
    if (html.dataset.opening === "play" && video) {
      video.preload = "auto";
      video.addEventListener("ended", ended);
      video.addEventListener("error", failed);
      video.play().catch(failed);
      timer = window.setTimeout(() => {
        if (html.dataset.opening === "play") (video.currentTime > 0 ? ended : failed)();
      }, MAX_MS);
    }
    if (!first && html.dataset.opening === "ended") html.dataset.opening = "still";

    // The crest settles over the first scroll; the cue only at the very top.
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = Math.max(0, window.scrollY);
        section.toggleAttribute("data-top", y < 4);
        if (!reduced) section.style.setProperty("--settle", String(Math.min(1, y / SETTLE_PX)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      video?.removeEventListener("ended", ended);
      video?.removeEventListener("error", failed);
    };
  }, []);

  return (
    <section ref={ref} className="opening" data-top="">
        <div className="opening-crest">
          <div className="opening-frame">
            {/* The still crest, painted with the very first frame of the page
                (an image, so it is the page's first and largest content). On
                a first visit the canvas covers it while the animation draws
                above, so the look is unchanged (14 Nov). */}
            {/* eslint-disable-next-line @next/next/no-img-element -- a small, fixed SVG, painted at once, needs no optimizer */}
            <img
              src="/images/hos-crest-charcoal.svg"
              alt=""
              aria-hidden="true"
              width={900}
              height={900}
              fetchPriority="high"
              decoding="sync"
              className="opening-still"
            />
            <span aria-hidden="true" className="opening-cover" />
            <video
              className="opening-video"
              muted
              playsInline
              preload="none"
              width={1280}
              height={720}
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src="/images/HOS_Logo_Animation.mp4" type="video/mp4" />
            </video>
            <span aria-hidden="true" className="opening-feather" />
          </div>
        </div>
        <div aria-hidden="true" className="opening-cue">
          <span className="opening-cue-word">{scrollWord}</span>
          <span className="opening-cue-line" />
        </div>
    </section>
  );
}
