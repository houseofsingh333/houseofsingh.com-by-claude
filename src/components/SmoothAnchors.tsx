"use client";

import { useEffect } from "react";

/**
 * In page links glide to their anchor; nothing else on the site scrolls
 * smoothly by itself.
 *
 * The site used to set `scroll-behavior: smooth` on <html> for every
 * scroll. The browser applied it to scrolls the visitor never asked to
 * see: Next's jump to the top of a new page glided up from the old page's
 * depth (so pages seemed to open where the last one was left), and Back
 * glided down to the restored position instead of arriving there. So the
 * page scrolls instantly by default (styles/base.css), and only a plain
 * click on a link to an anchor on this same page (the skip links, the
 * contents of Privacy and Terms) turns smooth scrolling on for that one
 * jump, until the scroll ends. Reduced motion: an instant jump, as before.
 */
export default function SmoothAnchors() {
  useEffect(() => {
    const html = document.documentElement;
    let timer = 0;
    const reset = () => {
      window.clearTimeout(timer);
      window.removeEventListener("scrollend", reset);
      html.style.removeProperty("scroll-behavior");
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!(a instanceof HTMLAnchorElement) || (a.target && a.target !== "_self")) return;
      const url = new URL(a.href, window.location.href);
      const here = window.location;
      if (!url.hash || url.origin !== here.origin || url.pathname !== here.pathname || url.search !== here.search) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // Set before the browser follows the link (after this listener).
      reset();
      html.style.scrollBehavior = "smooth";
      window.addEventListener("scrollend", reset, { once: true });
      // Where scrollend is missing, or nothing needed to move.
      timer = window.setTimeout(reset, 1500);
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      reset();
    };
  }, []);
  return null;
}
