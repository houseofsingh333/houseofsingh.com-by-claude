import type { CSSProperties } from "react";

type RevealOptions = {
  /** True once the element (or its section) has scrolled into view. */
  revealed: boolean;
  /**
   * Rise into place (the standard --rise-reveal, 12px) while fading in.
   * false for a pure fade, for example a photo or the logo. Default true.
   */
  rise?: boolean;
  /** Delay in ms, for staggering siblings. */
  delay?: number;
  /** Any other inline style to keep on the element. */
  style?: CSSProperties;
};

/**
 * Attributes for an element that fades in on scroll. Spread them onto the
 * element: <div {...revealProps({ revealed })}>.
 *
 * Every reveal uses the same slow motion tokens: --dur-reveal (1400ms),
 * --ease-slow and a 12px rise. Only the stagger delay, and whether it rises
 * at all, vary per element.
 *
 * The element is visible by default. The CSS rules under "Scroll reveal" in
 * globals.css hide it before its reveal only when JavaScript has run and the
 * visitor has not asked for reduced motion.
 */
export function revealProps({
  revealed,
  rise = true,
  delay = 0,
  style,
}: RevealOptions) {
  return {
    "data-reveal": "",
    "data-revealed": revealed ? "" : undefined,
    style: {
      ...style,
      "--reveal-offset": rise ? "var(--rise-reveal)" : "0px",
      "--reveal-delay": `${delay}ms`,
    } as CSSProperties,
  };
}
