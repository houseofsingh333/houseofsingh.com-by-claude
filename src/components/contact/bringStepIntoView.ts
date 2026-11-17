/**
 * The contact form changes step in place, so the page used to stay where
 * it was left and a new step could open above the screen (Back from the
 * review) or with its Next button below it (approved 17 Nov 2026). When
 * the form moves to a step, this brings the step's question to just below
 * the fixed header, but only if the question or the Next button is not
 * already wholly in view; otherwise the page does not move. The glide uses
 * the motion tokens (--dur-page on --ease-slow) and never scroll-behavior
 * on <html>; with reduced motion it moves at once. Focus goes to the
 * question either way, without scrolling, so keyboard and screen reader
 * users arrive there too.
 */

/** Air between the header's lower edge and the question. */
const GAP = 24;

/** A cubic-bezier timing curve, solved for y at a given x (as CSS does). */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3;
  const slope = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 + 6 * (b - a) * (1 - t) * t + 3 * (1 - b) * t ** 2;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = slope(x1, x2, t);
      if (Math.abs(d) < 1e-6) break;
      t = Math.min(1, Math.max(0, t - (at(x1, x2, t) - x) / d));
    }
    return at(y1, y2, t);
  };
}

/** The motion tokens, read from the page so they stay the one source. */
function tokens() {
  const css = getComputedStyle(document.documentElement);
  const dur = css.getPropertyValue("--dur-page").trim();
  const ms = dur.endsWith("ms") ? parseFloat(dur) : parseFloat(dur) * 1000;
  const curve = css.getPropertyValue("--ease-slow").match(/cubic-bezier\(([^)]+)\)/)?.[1].split(",").map(Number);
  const [x1, y1, x2, y2] = curve?.length === 4 && curve.every(Number.isFinite) ? curve : [0.37, 0, 0.63, 1];
  return { ms: Number.isFinite(ms) ? ms : 600, ease: bezier(x1, y1, x2, y2) };
}

/** The lower edge of the header showing now (the crest has no box; the wordmark bar does). */
function headerBottom() {
  const shown = [...document.querySelectorAll("header[aria-hidden='false']")].map((h) => h.getBoundingClientRect());
  return Math.max(0, ...shown.filter((r) => r.height > 0).map((r) => r.bottom));
}

/** The wordmark bar's height: the header the page will show once it has moved down. */
function barHeight() {
  return Math.max(0, ...[...document.querySelectorAll("header.site-header")].map((h) => h.getBoundingClientRect().height));
}

/** Where an element will rest once its step's entrance (a short rise) has finished. */
function resting(el: Element) {
  const r = el.getBoundingClientRect();
  const rising = el.closest(".editorial-slide-up");
  const shift = rising ? new DOMMatrixReadOnly(getComputedStyle(rising).transform === "none" ? undefined : getComputedStyle(rising).transform).m42 : 0;
  return { top: r.top - shift, bottom: r.bottom - shift };
}

let stopGlide: (() => void) | null = null;

export function bringStepIntoView(question: HTMLElement | null, next: HTMLElement | null) {
  if (!question) return;
  question.focus({ preventScroll: true });

  const top = headerBottom();
  const inView = (b: { top: number; bottom: number }) => b.top >= top && b.bottom <= window.innerHeight;
  const q = resting(question);
  if (inView(q) && (!next || inView(resting(next)))) return;

  const most = document.documentElement.scrollHeight - window.innerHeight;
  const to = Math.round(Math.min(most, Math.max(0, window.scrollY + q.top - barHeight() - GAP)));
  const from = window.scrollY;
  if (Math.abs(to - from) < 1) return;

  stopGlide?.();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top: to, behavior: "instant" });
    return;
  }

  const { ms, ease } = tokens();
  const start = performance.now();
  let frame = 0;
  // The reader takes over the moment they scroll, touch or press a key.
  const stop = () => {
    cancelAnimationFrame(frame);
    for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) window.removeEventListener(type, stop);
    stopGlide = null;
  };
  for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) window.addEventListener(type, stop, { passive: true });
  stopGlide = stop;
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / ms);
    window.scrollTo({ top: from + (to - from) * ease(p), behavior: "instant" });
    if (p < 1) frame = requestAnimationFrame(step);
    else stop();
  };
  frame = requestAnimationFrame(step);
}
