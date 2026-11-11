"use client";

import { useEffect, useState, type CSSProperties } from "react";

type Props = {
  /** "੦੧". */
  numeral: string;
  /** "Collection 01". */
  title: string;
  /** "In 153 days", or "Open now". */
  when: string;
  /** "Notify me", or "Shop the Collection". */
  action: string;
  /** The section it leads to, and that it waits for: "notify" or "collection". */
  target: string;
  /** The card's colour. */
  colour: string;
};

/**
 * Phones only, on the Shop page (Shop design round 2): a floating bar in
 * the card's gold, the Collection's number in Gurmukhi, its title and when
 * it opens, and the way to Notify me (or, once open, to the Collection).
 * Hidden at the top of the page; it rises once the section it leads to
 * has scrolled past, and steps away while that section is on screen.
 * With reduced motion it appears and goes without sliding.
 */
export default function ShopBar({ numeral, title, when, action, target, colour }: Props) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = document.getElementById(target);
    if (!el) return;
    // Shown only once the section is above the screen, never before reaching
    // it. Checked on scroll (once a frame), so a jump past it counts too.
    let frame = 0;
    const check = () => {
      frame = 0;
      setShown(el.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [target]);

  return (
    <div className="ed-shopbar" data-shown={shown ? "" : undefined} inert={!shown} style={{ "--sq": colour } as CSSProperties}>
      <span aria-hidden="true" className="ed-shopbar-numeral" lang="pa">
        {numeral}
      </span>
      <span className="ed-shopbar-words">
        <span className="ed-shopbar-title">{title}</span>
        <span className="ed-shopbar-when">{when}</span>
      </span>
      <a href={`#${target}`} className="ed-shopbar-action">
        {action}
        <span aria-hidden="true">{"→"}</span>
      </a>
    </div>
  );
}
