"use client";

import NextLink from "next/link";
import { useSyncExternalStore, type ComponentProps } from "react";

/**
 * The site's link: Next.js's Link, with one difference. During the first
 * page load it does not prefetch the pages it points to; once the page has
 * loaded and the browser is idle, links prefetch as usual (audit M1, option
 * 2, approved 12 Nov). The pages a visitor might open next no longer
 * compete with the page being opened. After the first load (every later
 * page change) nothing is different.
 */
let ready = false;
const waiting = new Set<() => void>();

function begin() {
  if (ready || typeof window === "undefined") return;
  const go = () => {
    if (ready) return;
    ready = true;
    waiting.forEach((notify) => notify());
    waiting.clear();
  };
  // A second after the load, when the browser is idle (at most two more seconds).
  const later = () =>
    window.setTimeout(() => {
      if ("requestIdleCallback" in window) window.requestIdleCallback(go, { timeout: 2000 });
      else go();
    }, 1000);
  if (document.readyState === "complete") later();
  else window.addEventListener("load", later, { once: true });
}

function subscribe(notify: () => void) {
  if (ready) return () => {};
  waiting.add(notify);
  begin();
  return () => waiting.delete(notify);
}

export default function Link(props: ComponentProps<typeof NextLink>) {
  const loaded = useSyncExternalStore(subscribe, () => ready, () => false);
  // An explicit prefetch choice on a link is kept; otherwise none until loaded.
  const prefetch = props.prefetch !== undefined ? props.prefetch : loaded ? undefined : false;
  return <NextLink {...props} prefetch={prefetch} />;
}
