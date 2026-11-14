"use client";

import { useEffect, useRef } from "react";

/** Set once the opening has played this session (the same key as before). */
const SEEN = "hos_intro_seen";
/** A slow or broken video never holds the opening: the still crest by then. */
const MAX_MS = 6500;
/** The first scroll over which the crest fades and settles (canvas: 260px). */
const SETTLE_PX = 260;

/*
 * Decided before the first paint, right after the markup (so no frame shows
 * the wrong one): "play" on a first visit with motion allowed, else "still".
 * Without JavaScript the section has no mark and shows the still crest.
 */
const DECIDE = `(function(){try{var s=document.currentScript.previousElementSibling,v=s.querySelector("video"),m=matchMedia("(prefers-reduced-motion: reduce)").matches,seen=sessionStorage.getItem("${SEEN}");if(seen||m||!v){s.setAttribute("data-opening","still");try{sessionStorage.setItem("${SEEN}","1")}catch(e){}}else{s.setAttribute("data-opening","play");v.preload="auto";var p=v.play();if(p&&p.catch)p.catch(function(){s.setAttribute("data-opening","still")})}}catch(e){}})();`;

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
    const video = section.querySelector("video");
    const still = () => {
      try {
        sessionStorage.setItem(SEEN, "1");
      } catch {}
    };
    // The animation's end: its last frame stays; the cue may show.
    const ended = () => {
      if (section.dataset.opening === "play") section.dataset.opening = "ended";
      still();
    };
    // It failed or stalled: the still crest instead, at once.
    const failed = () => {
      if (section.dataset.opening === "play") section.dataset.opening = "still";
      still();
    };
    // Arriving from another page (the script above runs only when the page
    // is loaded): the still crest, never an animation starting late.
    if (!section.dataset.opening) {
      section.dataset.opening = "still";
      still();
    }
    let timer: number | undefined;
    if (section.dataset.opening === "play" && video) {
      if (video.ended) ended();
      video.addEventListener("ended", ended);
      video.addEventListener("error", failed);
      timer = window.setTimeout(() => {
        if (section.dataset.opening === "play") (video.currentTime > 0 ? ended : failed)();
      }, MAX_MS);
    }

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
    <>
      <section ref={ref} className="opening" data-top="" suppressHydrationWarning>
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
      <script dangerouslySetInnerHTML={{ __html: DECIDE }} />
    </>
  );
}
