"use client";

import { useEffect, useState, type RefObject } from "react";

type Options = {
  /** Share of the element that must be visible (0 to 1). Default 0. */
  threshold?: number;
  /** Grows or shrinks the viewport used for the test, as in CSS margin. */
  rootMargin?: string;
  /** Stop watching after the first time in view (default), or keep tracking. */
  once?: boolean;
  /** The value before the browser has reported anything. Default false. */
  initial?: boolean;
};

/**
 * Whether an element is in view, from one IntersectionObserver.
 *
 * The site's single in view hook: scroll reveals, the portraits' colour
 * reveal, deferred embeds, the projects scroll hint and the journal's sticky
 * filter bar all use it. By default it turns true once and stays true; with
 * `once: false` it follows the element in and out of view.
 */
export function useInView(
  ref: RefObject<Element | null>,
  { threshold = 0, rootMargin, once = true, initial = false }: Options = {},
): boolean {
  const [inView, setInView] = useState(initial);
  const done = once && inView && !initial;

  useEffect(() => {
    const el = ref.current;
    if (!el || done) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (once) {
          if (visible) {
            setInView(true);
            observer.disconnect();
          }
        } else {
          setInView(visible);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, once, done]);

  return inView;
}
