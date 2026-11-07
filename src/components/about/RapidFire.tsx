"use client";

import { useState, useRef } from "react";
import type { RapidFireItem } from "@/lib/types";
import { useInView } from "@/hooks/useInView";
import { revealProps } from "@/lib/reveal";

export default function RapidFire({ items }: { items: RapidFireItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Scroll entrance: the items fade in, staggered, once the list is in view.
  // CSS shows them immediately under reduced motion or without JavaScript
  // (revealProps and "Scroll reveal" in globals.css).
  const revealed = useInView(sectionRef, { threshold: 0.1 });

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
            {...revealProps({
              revealed,
              delay: index * 80,
            })}
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
