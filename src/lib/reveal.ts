import type { CSSProperties } from "react";

/** The site's reveal easing, the same curve as EASE_SMOOTH in animation.ts. */
const REVEAL_EASE = "cubic-bezier(0.25, 0.1, 0.25, 1)";

type RevealOptions = {
  /** True once the element (or its section) has scrolled into view. */
  revealed: boolean;
  /** Upward travel in px while fading in. 0 for a pure fade. */
  offset?: number;
  /** Duration in ms. */
  duration?: number;
  /** Delay in ms, for staggering siblings. */
  delay?: number;
  /** CSS easing. Defaults to the site's reveal curve. */
  ease?: string;
  /** Any other inline style to keep on the element. */
  style?: CSSProperties;
};

/**
 * Attributes for an element that fades in on scroll. Spread them onto the
 * element: <div {...revealProps({ revealed, offset: 20 })}>.
 *
 * The element is visible by default. The CSS rules under "Scroll reveal" in
 * globals.css hide it before its reveal only when JavaScript has run and the
 * visitor has not asked for reduced motion.
 */
export function revealProps({
  revealed,
  offset = 20,
  duration = 700,
  delay = 0,
  ease = REVEAL_EASE,
  style,
}: RevealOptions) {
  return {
    "data-reveal": "",
    "data-revealed": revealed ? "" : undefined,
    style: {
      ...style,
      "--reveal-offset": `${offset}px`,
      "--reveal-duration": `${duration}ms`,
      "--reveal-delay": `${delay}ms`,
      "--reveal-ease": ease,
    } as CSSProperties,
  };
}
