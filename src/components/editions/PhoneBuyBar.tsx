"use client";

import { useEffect, useState } from "react";

/**
 * Phones only (Shop design round 3): a floating bar in warm stone with the
 * piece's name and price and the charcoal Buy. Hidden while the page's own
 * Buy is on screen or still ahead; it rises once Buy has scrolled away
 * above. Its Buy presses the page's Buy: when a size is needed and none is
 * chosen, the page scrolls to the sizes and says "Choose a size";
 * otherwise it goes to checkout. Never shown for a sold out piece. With
 * reduced motion it appears without sliding.
 */
export default function PhoneBuyBar({ name, price }: { name: string; price: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const buy = document.getElementById("buy");
    if (!buy) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      setShown(buy.getBoundingClientRect().bottom < 0);
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
  }, []);

  return (
    <div className="ed-bar2" data-shown={shown ? "" : undefined} inert={!shown}>
      <span className="ed-bar2-words">
        <span className="ed-bar2-name">{name}</span>
        <span className="ed-bar2-price">{price}</span>
      </span>
      <button
        type="button"
        className="ed-bar2-buy type-label"
        onClick={() => (document.getElementById("ed-buy-form") as HTMLFormElement | null)?.requestSubmit()}
      >
        Buy
      </button>
    </div>
  );
}
