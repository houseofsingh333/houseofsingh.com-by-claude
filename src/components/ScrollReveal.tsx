"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";

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
} & Omit<HTMLMotionProps<"div">, "initial" | "animate" | "transition">;

/**
 * Reusable scroll-triggered reveal with editorial rhythm.
 * Fade in + gentle upward translate on viewport entry.
 *
 * Usage:
 *   <ScrollReveal>content</ScrollReveal>
 *   <ScrollReveal delay={0.1} offset={30}>staggered item</ScrollReveal>
 *
 * Respects prefers-reduced-motion: renders immediately with no animation.
 */
export default function ScrollReveal({
  delay = 0,
  threshold = 0.15,
  offset = 20,
  duration = 0.7,
  as = "div",
  children,
  className,
  style,
  ...rest
}: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: threshold });
  const prefersReduced = useReducedMotion();

  const MotionTag = motion[as] as typeof motion.div;

  if (prefersReduced) {
    return (
      <MotionTag ref={ref} className={className} style={style} {...rest}>
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: offset }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: offset }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
