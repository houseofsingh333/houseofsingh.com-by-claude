"use client";

import { useRef, type ElementType, type HTMLAttributes } from "react";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { revealProps } from "@/lib/reveal";

type Props = {
  /** Stagger delay in seconds (for sequencing sibling reveals). Default 0. */
  delay?: number;
  /** IntersectionObserver threshold (0-1). Default 0.15. */
  threshold?: number;
  /** Vertical offset in px for the slide-up. Default 20. */
  offset?: number;
  /** Duration in seconds. Default 0.7. */
  duration?: number;
  /** Render as a different HTML element. Default "div". */
  as?: "div" | "section" | "article" | "figure" | "p" | "h1" | "h2" | "h3" | "span" | "li";
  children: React.ReactNode;
} & HTMLAttributes<HTMLElement>;

/**
 * Reusable scroll-triggered reveal with editorial rhythm.
 * Fade in + gentle upward translate on viewport entry.
 *
 * Usage:
 *   <ScrollReveal>content</ScrollReveal>
 *   <ScrollReveal delay={0.1} offset={30}>staggered item</ScrollReveal>
 *
 * Visible by default. The hidden start state is applied by CSS only when
 * JavaScript is running and the visitor allows motion (see "Scroll reveal"
 * in globals.css), so the server HTML, reduced motion and no JavaScript all
 * show the content immediately, with no fade.
 */
export default function ScrollReveal({
  delay = 0,
  threshold = 0.15,
  offset = 20,
  duration = 0.7,
  as = "div",
  children,
  style,
  ...rest
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const revealed = useRevealOnScroll(ref, threshold);
  const Tag = as as ElementType;

  return (
    <Tag
      ref={ref}
      {...rest}
      {...revealProps({
        revealed,
        offset,
        duration: duration * 1000,
        delay: delay * 1000,
        style,
      })}
    >
      {children}
    </Tag>
  );
}
