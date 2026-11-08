"use client";

import { useEffect } from "react";

/** How much of the remaining distance each frame covers (at 60 frames a second). */
const EASE = 0.1;
/** The glide only ever runs for a fine pointer on a wide screen, with motion allowed. */
const WANTED = "(pointer: fine) and (hover: hover) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)";

/** Whether an element between the pointer and the page can scroll this way itself. */
function scrollsItself(start: EventTarget | null, dy: number): boolean {
  for (let el = start instanceof Element ? start : null; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    if (el.closest("[data-glide-off]")) return true;
    const cs = getComputedStyle(el);
    const oy = cs.overflowY;
    if (oy !== "auto" && oy !== "scroll") continue;
    // An area that keeps its scrolling to itself (the menu): never the page.
    if (cs.overscrollBehaviorY !== "auto") return true;
    if (el.scrollHeight > el.clientHeight + 1) {
      const atTop = el.scrollTop <= 0;
      const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      if ((dy < 0 && !atTop) || (dy > 0 && !atEnd)) return true;
    }
  }
  return false;
}

/** Whether the page's own scroll is locked (an overlay is open) or switched off for this page. */
function pageLocked(): boolean {
  const html = document.documentElement;
  if (html.hasAttribute("data-glide-off") || document.body.hasAttribute("data-glide-off")) return true;
  return getComputedStyle(document.body).overflowY === "hidden" || getComputedStyle(html).overflowY === "hidden";
}

/**
 * Glide scrolling on desktop: a mouse wheel or trackpad moves the page
 * with a short, soft ease instead of in steps. Native code, no library.
 *
 * Only for a fine pointer on a wide screen, never on touch, and off with
 * reduced motion. It steps aside for pinch zoom (ctrl and wheel),
 * sideways scrolling, anything that scrolls itself (menus, the filter, a
 * dialog, any [data-glide-off] area) and a locked page; and the moment
 * anything else moves the page (the keyboard, find in page, an anchor
 * link, a glide to a journal entry), it lets go and starts from there.
 * The page still scrolls natively underneath, so sticky elements,
 * scroll observers and view transitions see an ordinary scroll.
 */
export default function GlideScroll() {
  useEffect(() => {
    const media = window.matchMedia(WANTED);
    let target = window.scrollY;
    let current = window.scrollY;
    let frame = 0;
    let last = 0;
    let expected = -1;

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const step = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16.7;
      last = now;
      // The same ease whatever the frame rate.
      const k = 1 - Math.pow(1 - EASE, dt / 16.7);
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.5) current = target;
      expected = Math.round(current);
      window.scrollTo({ top: current, behavior: "instant" });
      if (current !== target) frame = requestAnimationFrame(step);
      else {
        frame = 0;
        last = 0;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!media.matches || e.defaultPrevented || e.ctrlKey || e.metaKey) return;
      let dy = e.deltaY;
      if (Math.abs(e.deltaX) > Math.abs(dy)) return; // sideways: native
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= window.innerHeight;
      if (!dy || pageLocked() || scrollsItself(e.target, dy)) return;
      e.preventDefault();
      if (!frame) {
        // Start from wherever the page is now.
        target = current = window.scrollY;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = Math.max(0, Math.min(max, target + dy));
      if (!frame) frame = requestAnimationFrame(step);
    };

    // Anything else that moves the page takes over at once.
    const onScroll = () => {
      if (frame && Math.abs(window.scrollY - expected) > 2) {
        stop();
        last = 0;
      }
      if (!frame) target = current = window.scrollY;
    };
    const onKey = () => {
      if (frame) stop();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onKey);
    return () => {
      stop();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onKey);
    };
  }, []);
  return null;
}
