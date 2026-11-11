"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { shopColour } from "@/lib/editions/palette";
import { collectionTitle, gurmukhi } from "@/lib/editions/format";
import EditionsSeal from "./EditionsSeal";

type Props = {
  number: number;
  colour: string;
  /** "13 · 04 · 2027", the release date in Toronto. */
  date: string;
  /** Read to screen readers: "Collection 01, released on 13 April 2027". */
  label: string;
};

/**
 * The Collection card while it is sealed and in early access (Shop design
 * round 2): the square in its colour; "House of Singh Editions"; the
 * number large in Gurmukhi numerals (Noto Serif Gurmukhi) with "Collection
 * 01" beneath; the release date and "Released once" at the foot; the seal
 * at the bottom right. With a fine pointer the card presses toward it
 * (up to 6 degrees each way, lifted 6px with a deeper shadow) and returns
 * on leave. On a touch screen a press and hold tilts it toward the finger
 * (Shop design round 3), and on first view it settles once. Never with
 * reduced motion.
 */
/** A touch becomes a press only if it stays put this long (a scroll moves first). */
const PRESS_DELAY_MS = 140;
/** Movement that means the finger is scrolling, not pressing. */
const SCROLL_SLOP = 10;

const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function CollectionCard({ number, colour, date, label }: Props) {
  const c = shopColour(colour);
  const ref = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const touch = useRef<{ id: number; x: number; y: number; timer: number; pressing: boolean } | null>(null);
  const style = { "--sq": c.square, "--sq-ink": c.ink, "--sq-quiet": c.quiet } as CSSProperties;

  /** Tilt toward a point on the card: up to `max` degrees each way. */
  function tiltTo(clientX: number, clientY: number, max: number) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    el.style.setProperty("--rx", `${((0.5 - y) * 2 * max).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((x - 0.5) * 2 * max).toFixed(2)}deg`);
  }

  function press(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || still()) return;
    tiltTo(e.clientX, e.clientY, 6);
    el.dataset.pressed = "";
  }
  function release() {
    const el = ref.current;
    if (touch.current) window.clearTimeout(touch.current.timer);
    touch.current = null;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    delete el.dataset.pressed;
    delete el.dataset.touched;
  }

  // Touch: a press and hold tilts the card toward the finger (up to 10
  // degrees), scales it a little and tightens its shadow, following the
  // finger until it lifts. Scrolling across the card is never blocked
  // (touch-action: pan-y): a finger that moves before the press begins is
  // a scroll, and the browser's own scroll cancels the press.
  function touchStart(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" || still()) return;
    const at = { id: e.pointerId, x: e.clientX, y: e.clientY, timer: 0, pressing: false };
    at.timer = window.setTimeout(() => {
      const el = ref.current;
      if (!el || touch.current !== at) return;
      at.pressing = true;
      el.dataset.touched = "";
      tiltTo(at.x, at.y, 10);
    }, PRESS_DELAY_MS);
    touch.current = at;
  }
  function touchMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse") return press(e);
    const at = touch.current;
    if (!at || at.id !== e.pointerId) return;
    if (!at.pressing) {
      if (Math.hypot(e.clientX - at.x, e.clientY - at.y) > SCROLL_SLOP) release();
      else Object.assign(at, { x: e.clientX, y: e.clientY });
      return;
    }
    tiltTo(e.clientX, e.clientY, 10);
  }

  // Once the press has begun (the finger held still), the page stays put
  // and the card follows the finger. Before that, a moving finger scrolls as
  // usual. Touch events must be non passive to hold the page still.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const hold = (e: TouchEvent) => {
      if (touch.current?.pressing && e.cancelable) e.preventDefault();
    };
    el.addEventListener("touchmove", hold, { passive: false });
    return () => el.removeEventListener("touchmove", hold);
  }, []);

  // Once, on first view, on a touch screen: the card settles from slightly
  // lifted to flat (styles/editions.css, ed-card2-settle).
  useEffect(() => {
    const el = ref.current;
    if (!el || still() || !window.matchMedia("(hover: none)").matches || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      el.dataset.settle = "";
      io.disconnect();
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={stage} className="ed-card2-stage" onPointerDown={touchStart} onPointerMove={touchMove} onPointerUp={release} onPointerCancel={release} onPointerLeave={release} onContextMenu={(e) => touch.current?.pressing && e.preventDefault()}>
      <div ref={ref} className="ed-card2" style={style} role="img" aria-label={label} onAnimationEnd={(e) => delete e.currentTarget.dataset.settle}>
        <span className="ed-card2-label" aria-hidden="true">
          House of Singh Editions
        </span>
        <span className="ed-card2-number" aria-hidden="true">
          <span className="ed-card2-gurmukhi" lang="pa">
            {gurmukhi(number).padStart(2, "੦")}
          </span>
          <span className="ed-card2-label">{collectionTitle(number)}</span>
        </span>
        <span className="ed-card2-foot" aria-hidden="true">
          <span className="ed-card2-label">
            <span className="ed-card2-date">{date}</span>
            <br />
            Released once
          </span>
          <EditionsSeal />
        </span>
      </div>
    </div>
  );
}
