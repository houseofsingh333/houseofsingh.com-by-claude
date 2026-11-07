"use client";

import { useEffect, useState } from "react";

/**
 * The contents list of a legal page. The section nearest the top of the
 * screen is marked (aria-current and a charcoal hairline) as you read.
 */
export default function LegalContents({ items, label }: { items: { id: string; title: string }[]; label: string }) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting);
        if (seen.length) setCurrent(seen[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className="legal-contents">
      <p className="text-[12px] tracking-[0.14em] uppercase text-muted-foreground">{label}</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={current === item.id ? "location" : undefined}
              className="legal-contents-link"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
