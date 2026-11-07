/*
 * The swipe on a card, frame by frame (canvas "PG-SwipeStory", locked):
 *
 *   1. Touch: the card settles to 98.5 percent in 200 ms.
 *   2. Drag: it follows the finger exactly and fades as it travels; the
 *      card it leads to waits underneath at 96 percent and invisible,
 *      growing to full size and tone in step with the drag.
 *   3. Release past a third of the width, or a quick flick: it carries on
 *      out on --ease-soft-out in 450 ms; the next one settles.
 *   4. Release earlier: it glides back in 350 ms, no bounce.
 *   At either end it moves a third as far and returns. The gesture is only
 *   claimed once sideways movement clearly dominates, so vertical
 *   scrolling is never blocked. Transforms and opacity only.
 *
 * Used for whole cards (between projects) and for the photographs inside
 * a card's photograph. With reduced motion nothing slides: a long enough
 * sideways swipe simply moves on (the caller crossfades).
 */

import { token } from "./motion";

export type SwipeTarget = {
  /** The element that moves (the current card or photograph). */
  current: () => HTMLElement | null;
  /** The element waiting underneath in that direction (1 next, -1 previous). */
  neighbour: (dir: 1 | -1) => HTMLElement | null;
  /** Whether there is somewhere to go in that direction. */
  canGo: (dir: 1 | -1) => boolean;
  /** Called once the move has played out: change what is current. */
  commit: (dir: 1 | -1) => void;
  /** Ignore gestures that start inside these (for example the photograph). */
  ignore?: (target: EventTarget | null) => boolean;
  /** Touching (pointer down) and letting go, for pausing a cycle. */
  onTouch?: (down: boolean) => void;
  reduced: () => boolean;
};

const CLAIM_PX = 10;
const FLICK_PX_PER_MS = 0.45;

/** The soft out curve from the motion tokens. */
const easeOut = () => token("--ease-soft-out", "cubic-bezier(0.33, 1, 0.68, 1)");

function setStyle(el: HTMLElement | null, s: Partial<CSSStyleDeclaration>) {
  if (el) Object.assign(el.style, s);
}

/** Clear what a move left on an element (its own CSS takes over again). */
export function clearSwipeStyles(el: HTMLElement | null) {
  if (!el) return;
  for (const a of el.getAnimations()) a.cancel();
  setStyle(el, { transform: "", opacity: "", visibility: "", zIndex: "", transition: "" });
}

function animate(el: HTMLElement | null, to: Keyframe, ms: number): Promise<void> {
  if (!el) return Promise.resolve();
  const from: Keyframe = { transform: el.style.transform || "none", opacity: el.style.opacity || "1" };
  const a = el.animate([from, to], { duration: ms, easing: easeOut(), fill: "forwards" });
  return a.finished.then(() => {
    Object.assign(el.style, to as Partial<CSSStyleDeclaration>);
    a.cancel();
  }).catch(() => {});
}

/** Show the neighbour underneath, at the drag's progress (0 to 1). */
function peek(el: HTMLElement | null, p: number) {
  setStyle(el, {
    visibility: "visible",
    zIndex: "1",
    transition: "none",
    opacity: String(p),
    transform: `scale(${0.96 + 0.04 * p})`,
  });
}

/**
 * Play a whole move without a finger: what the arrows do. Past an end, the
 * card nudges a short way and returns.
 */
export async function playMove(t: SwipeTarget, dir: 1 | -1, width: number) {
  const cur = t.current();
  if (t.reduced()) {
    if (t.canGo(dir)) t.commit(dir);
    return;
  }
  if (!t.canGo(dir)) {
    await animate(cur, { transform: `translateX(${(-dir * width) / 9}px)` }, 200);
    await animate(cur, { transform: "translateX(0px)" }, 350);
    clearSwipeStyles(cur);
    return;
  }
  const next = t.neighbour(dir);
  peek(next, 0);
  setStyle(cur, { zIndex: "2" });
  await Promise.all([
    animate(cur, { transform: `translateX(${-dir * width * 1.05}px)`, opacity: "0" }, 450),
    animate(next, { transform: "scale(1)", opacity: "1" }, 450),
  ]);
  t.commit(dir);
}

/** Attach the swipe to an element; returns a function that detaches it. */
export function attachSwipe(zone: HTMLElement, t: SwipeTarget): () => void {
  let id: number | null = null;
  let x0 = 0;
  let y0 = 0;
  let claimed = false;
  let abandoned = false;
  let dx = 0;
  let width = 1;
  let shown: HTMLElement | null = null;
  let samples: { x: number; t: number }[] = [];

  const reset = () => {
    id = null;
    claimed = false;
    abandoned = false;
    dx = 0;
    samples = [];
  };

  const down = (e: PointerEvent) => {
    if (id !== null || e.button !== 0 || t.ignore?.(e.target)) return;
    id = e.pointerId;
    x0 = e.clientX;
    y0 = e.clientY;
    width = zone.getBoundingClientRect().width || 1;
    samples = [{ x: e.clientX, t: e.timeStamp }];
    t.onTouch?.(true);
    if (!t.reduced()) {
      setStyle(t.current(), { transition: `transform 200ms ${easeOut()}`, transform: "scale(0.985)", zIndex: "2" });
    }
  };

  const move = (e: PointerEvent) => {
    if (e.pointerId !== id || abandoned) return;
    const mx = e.clientX - x0;
    const my = e.clientY - y0;
    if (!claimed) {
      if (Math.abs(my) > CLAIM_PX && Math.abs(my) > Math.abs(mx)) {
        // A vertical scroll: let the page have it.
        abandoned = true;
        setStyle(t.current(), { transition: `transform 200ms ${easeOut()}`, transform: "" });
        return;
      }
      if (Math.abs(mx) < CLAIM_PX || Math.abs(mx) < Math.abs(my) * 1.4) return;
      claimed = true;
      try {
        zone.setPointerCapture(e.pointerId);
      } catch {}
    }
    dx = mx;
    samples.push({ x: e.clientX, t: e.timeStamp });
    if (samples.length > 6) samples.shift();
    if (t.reduced()) return;
    const dir: 1 | -1 = dx < 0 ? 1 : -1;
    const can = t.canGo(dir);
    const travel = can ? dx : dx / 3;
    const p = Math.min(1, Math.abs(dx) / width);
    const cur = t.current();
    setStyle(cur, {
      transition: "none",
      zIndex: "2",
      transform: `translateX(${travel}px) scale(0.985)`,
      opacity: can ? String(1 - p) : "1",
    });
    const next = can ? t.neighbour(dir) : null;
    if (shown && shown !== next) clearSwipeStyles(shown);
    shown = next;
    if (next) peek(next, p);
  };

  const up = async (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    const wasClaimed = claimed;
    const finalDx = dx;
    const first = samples[0];
    const last = samples[samples.length - 1];
    const velocity = last && first && last.t > first.t ? (last.x - first.x) / (last.t - first.t) : 0;
    reset();
    t.onTouch?.(false);
    const cur = t.current();
    if (!wasClaimed) {
      setStyle(cur, { transition: `transform 200ms ${easeOut()}`, transform: "" });
      return;
    }
    const dir: 1 | -1 = finalDx < 0 ? 1 : -1;
    const can = t.canGo(dir);
    const flick = Math.abs(velocity) > FLICK_PX_PER_MS && Math.sign(velocity) === Math.sign(finalDx);
    const go = can && (Math.abs(finalDx) > width / 3 || flick);
    if (t.reduced()) {
      if (go) t.commit(dir);
      return;
    }
    const next = shown;
    shown = null;
    if (go) {
      await Promise.all([
        animate(cur, { transform: `translateX(${-dir * width * 1.05}px)`, opacity: "0" }, 450),
        animate(next, { transform: "scale(1)", opacity: "1" }, 450),
      ]);
      t.commit(dir);
    } else {
      await Promise.all([
        animate(cur, { transform: "translateX(0px) scale(1)", opacity: "1" }, 350),
        animate(next, { transform: "scale(0.96)", opacity: "0" }, 350),
      ]);
      clearSwipeStyles(cur);
      clearSwipeStyles(next);
    }
  };

  zone.addEventListener("pointerdown", down);
  zone.addEventListener("pointermove", move);
  zone.addEventListener("pointerup", up);
  zone.addEventListener("pointercancel", up);
  return () => {
    zone.removeEventListener("pointerdown", down);
    zone.removeEventListener("pointermove", move);
    zone.removeEventListener("pointerup", up);
    zone.removeEventListener("pointercancel", up);
  };
}
