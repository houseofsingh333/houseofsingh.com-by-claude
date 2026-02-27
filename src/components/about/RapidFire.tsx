"use client";

import { useState } from "react";
import type { RapidFireItem } from "@/lib/types";

export default function RapidFire({ items }: { items: RapidFireItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="rapidfire-item">
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              aria-controls={`rapidfire-panel-${index}`}
              className="rapidfire-btn"
            >
              <span className="rapidfire-question text-lg md:text-xl font-bold text-foreground">
                {item.question}
              </span>
              <span
                className="rapidfire-icon"
                data-open={isOpen ? "" : undefined}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            <div
              id={`rapidfire-panel-${index}`}
              role="region"
              aria-hidden={!isOpen}
              className="rapidfire-panel"
              data-open={isOpen ? "" : undefined}
            >
              <div>
                <p className="rapidfire-answer text-sm md:text-[15px] text-muted-foreground leading-[1.8]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
