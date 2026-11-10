"use client";

import { useEffect, useState } from "react";

/**
 * Phones only (below 1024): the price and Buy held at the foot of the
 * screen while the piece is read, leading to the Buy form; it steps aside
 * while the form itself is on screen (styles/editions.css).
 */
export default function PhoneBuyBar({ price, label }: { price: string; label: string }) {
  const [away, setAway] = useState(false);
  useEffect(() => {
    const form = document.getElementById("buy");
    if (!form || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setAway(e.isIntersecting), { threshold: 0.15 });
    io.observe(form);
    return () => io.disconnect();
  }, []);
  return (
    <div className="ed-bar" data-away={away ? "" : undefined} inert={away}>
      <span className="ed-bar-price">{price}</span>
      <a href="#buy" className="ed-bar-buy type-label">
        {label}
      </a>
    </div>
  );
}
