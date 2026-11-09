"use client";

import { useEffect } from "react";

/**
 * Links to the home page load it in full when this page was first opened
 * anywhere else.
 *
 * A page keeps the security policy it was first loaded with, and only the
 * home page's own policy allows what Spotify's iFrame API needs ('unsafe-eval',
 * next.config.ts). Reached by an in site navigation from, say, About, the
 * home page ran under About's stricter policy, the API was refused, and the
 * record in Chapter VI fell back to its safety net, which cannot see a pause.
 * So a plain click on any link to "/" (the crest, the wordmark, the menu,
 * the footer, the 404 page) is left to the browser, which loads the home
 * page with its own policy, instead of Next's router. When the visit began
 * on the home page its policy is already in force, and nothing changes.
 */
export default function HomeFullLoad() {
  useEffect(() => {
    // The page this document was first loaded at (this component mounts once).
    if (window.location.pathname === "/") return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!(a instanceof HTMLAnchorElement)) return;
      if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== "/") return;
      // Keep the click from Next's router (listening further down the page):
      // the browser follows the link itself.
      e.stopPropagation();
    };
    // On window, in the capture phase: before anything on the page sees it.
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
