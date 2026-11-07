"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useInView } from "@/hooks/useInView";

/** Drift speed in px per second: slow enough to read the titles as they pass. */
const SPEED = 24;
/** After a swipe, the drift waits this long before it resumes. */
const RESUME_AFTER_TOUCH_MS = 3000;
/** A press that moves less than this is a tap (opens the entry), not a swipe. */
const TAP_SLOP = 8;

type Options = {
  sectionRef: RefObject<HTMLElement | null>;
  viewportRef: RefObject<HTMLDivElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
  /** False with reduced motion (and before hydration): no drift at all. */
  enabled: boolean;
};

/**
 * The homepage filmstrip's drift: a slow right to left loop, by transform
 * only. One period is the width of one set of real cards (the copies after
 * them make the loop seamless), so the strip wraps without a jump.
 *
 * It drifts only while the section is in view and the tab is visible, and
 * pauses while the pointer rests on the strip, while a card has keyboard
 * focus, while the visitor holds the pause button down, and while a finger
 * swipes the strip (resuming a few seconds after). Returns the handlers for
 * the strip and the number of copy sets to render.
 */
export function useFilmstripDrift({ sectionRef, viewportRef, trackRef, enabled }: Options) {
  const inView = useInView(sectionRef, { once: false });
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [copySets, setCopySets] = useState(2);

  const offset = useRef(0); // px travelled, kept within one period
  const period = useRef(0); // width of one set of real cards, gap included
  const drag = useRef<{ x: number; start: number; moved: boolean; lastX: number; lastT: number; v: number } | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const glide = useRef<number | null>(null);

  const apply = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const p = period.current;
    if (p > 0) offset.current = ((offset.current % p) + p) % p;
    track.style.transform = `translate3d(${-offset.current}px, 0, 0)`;
  }, [trackRef]);

  // Measure one period and how many copy sets fill the screen.
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!enabled || !viewport || !track) return;
    const measure = () => {
      const real = track.querySelector<HTMLElement>('[data-filmstrip-card="real"]');
      const copy = track.querySelector<HTMLElement>('[data-filmstrip-card="copy"]');
      if (!real || !copy) return;
      period.current = copy.offsetLeft - real.offsetLeft;
      if (period.current > 0) {
        setCopySets(Math.max(1, Math.ceil(viewport.clientWidth / period.current)) + 1);
      }
      apply();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [enabled, viewportRef, trackRef, apply, copySets]);

  // Back to the resting position whenever the drift is switched off.
  useEffect(() => {
    if (enabled) return;
    offset.current = 0;
    const track = trackRef.current;
    if (track) track.style.transform = "";
  }, [enabled, trackRef]);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const playing = enabled && inView && !tabHidden && !userPaused && !hovering && !focused && !touching;

  // The drift itself: one animation frame loop while playing.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(now - last, 100); // a long gap (a stalled tab) never jumps
      last = now;
      offset.current += (SPEED * dt) / 1000;
      apply();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, apply]);

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      if (glide.current) cancelAnimationFrame(glide.current);
    },
    [],
  );

  // ——— Handlers for the strip ———

  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setHovering(true);
  };
  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setHovering(false);
  };

  // Swipe by hand (touch and pen): the strip follows the finger, glides a
  // little after release, and the drift resumes a few seconds later.
  const onPointerDown = (e: React.PointerEvent) => {
    if (!enabled || e.pointerType === "mouse") return;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    if (glide.current) cancelAnimationFrame(glide.current);
    setTouching(true);
    drag.current = { x: e.clientX, start: offset.current, moved: false, lastX: e.clientX, lastT: e.timeStamp, v: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > TAP_SLOP) d.moved = true;
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) d.v = (e.clientX - d.lastX) / dt;
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    offset.current = d.start - dx;
    apply();
  };
  const endDrag = () => {
    const d = drag.current;
    if (!d) return;
    // Keep the moved flag until the click that follows has been handled.
    setTimeout(() => {
      if (drag.current === d) drag.current = null;
    }, 0);
    let v = -d.v; // px per ms, in offset direction
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      offset.current += v * dt;
      apply();
      v *= Math.pow(0.94, dt / 16);
      if (Math.abs(v) > 0.01) glide.current = requestAnimationFrame(step);
    };
    if (d.moved && Math.abs(v) > 0.05) glide.current = requestAnimationFrame(step);
    resumeTimer.current = setTimeout(() => setTouching(false), RESUME_AFTER_TOUCH_MS);
  };

  // A swipe that started on a card must not also open it.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Keyboard focus: pause, and bring the focused card fully into view.
  const onFocus = (e: React.FocusEvent) => {
    setFocused(true);
    const viewport = viewportRef.current;
    const card = (e.target as HTMLElement).closest<HTMLElement>('[data-filmstrip-card="real"]');
    if (!enabled || !viewport || !card) return;
    viewport.scrollLeft = 0; // focus may scroll the clipped box; the transform owns position
    const first = trackRef.current?.querySelector<HTMLElement>('[data-filmstrip-card="real"]');
    offset.current = card.offsetLeft - (first?.offsetLeft ?? 0);
    apply();
  };
  const onBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
  };

  return {
    copySets,
    userPaused,
    togglePaused: () => setUserPaused((p) => !p),
    stripHandlers: {
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onClickCapture,
      onFocus,
      onBlur,
    },
  };
}
