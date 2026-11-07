"use client";

import { useRef, type ElementType, type HTMLAttributes } from "react";
import { useInView } from "@/hooks/useInView";
import { revealProps } from "@/lib/reveal";

type Props = {
  /** Stagger delay in seconds (for sequencing sibling reveals). Default 0. */
  delay?: number;
  /** IntersectionObserver threshold (0-1). Default 0.15. */
  threshold?: number;
  /** Rise 12px while fading in (default), or false for a pure fade. */
  rise?: boolean;
  /** Render as a different HTML element. Default "div". */
  as?: "div" | "section" | "article" | "figure" | "p" | "h1" | "h2" | "h3" | "span" | "li";
  children: React.ReactNode;
} & HTMLAttributes<HTMLElement>;

/**
 * Reusable scroll-triggered reveal: a slow fade in with a gentle 12px rise
 * (--dur-reveal, --ease-slow) on viewport entry.
 *
 * Usage:
 *   <ScrollReveal>content</ScrollReveal>
 *   <ScrollReveal delay={0.1}>staggered item</ScrollReveal>
 *   <ScrollReveal rise={false}>a pure fade</ScrollReveal>
 *
 * Visible by default. The hidden start state is applied by CSS only when
 * JavaScript is running and the visitor allows motion (see "Scroll reveal"
 * in styles/motion.css), so the server HTML, reduced motion and no JavaScript all
 * show the content immediately, with no fade.
 */
export default function ScrollReveal({
  delay = 0,
  threshold = 0.15,
  rise = true,
  as = "div",
  children,
  style,
  ...rest
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const revealed = useInView(ref, { threshold });
  const Tag = as as ElementType;

  return (
    <Tag
      ref={ref}
      {...rest}
      {...revealProps({
        revealed,
        rise,
        delay: delay * 1000,
        style,
      })}
    >
      {children}
    </Tag>
  );
}
