"use client";

import { useState, useEffect, useRef } from "react";
import type { RapidFireItem } from "@/lib/types";

export default function RapidFire({ items }: { items: RapidFireItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Scroll entrance with native Intersection Observer.
  // Reduced motion is handled purely via CSS (!important overrides).
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Skip observer if user prefers reduced motion — CSS ensures visibility
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div ref={sectionRef} className="rapidfire-section">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const number = String(index + 1).padStart(2, "0");
        const buttonId = `rapidfire-q-${index}`;
        const panelId = `rapidfire-a-${index}`;

        return (
          <div
            key={item.question}
            className="rapidfire-item"
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(16px)",
              transition: revealed
                ? `opacity 500ms cubic-bezier(0.25, 0.1, 0.25, 1) ${index * 80}ms, transform 500ms cubic-bezier(0.25, 0.1, 0.25, 1) ${index * 80}ms`
                : "none",
            }}
          >
            <button
              type="button"
              id={buttonId}
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="rapidfire-btn"
              data-open={isOpen ? "" : undefined}
            >
              <span className="rapidfire-number">({number})</span>
              <span className="rapidfire-question">{item.question}</span>
              <span className="rapidfire-toggle" aria-hidden="true">
                {/* Closed eye — visible when collapsed */}
                <span
                  className="rapidfire-eye"
                  style={{ opacity: isOpen ? 0 : 1 }}
                >
                  <svg
                    viewBox="0 0 22 22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 11C4 4 18 4 21 11C18 18 4 18 1 11Z" />
                    <line x1="4" y1="4" x2="18" y2="18" />
                  </svg>
                </span>
                {/* Open eye — visible when expanded */}
                <span
                  className="rapidfire-eye"
                  style={{ opacity: isOpen ? 1 : 0 }}
                >
                  <svg
                    viewBox="0 0 22 22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 11C4 4 18 4 21 11C18 18 4 18 1 11Z" />
                    <circle cx="11" cy="11" r="2.5" />
                  </svg>
                </span>
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              className="rapidfire-panel"
              data-open={isOpen ? "" : undefined}
            >
              <div>
                <p className="rapidfire-answer">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
