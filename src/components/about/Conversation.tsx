"use client";

import { useState } from "react";
import type { RapidFireItem } from "@/lib/types";

/** Eye closed: a lowered lid with lashes. */
function EyeClosed() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 11c2.5 3.5 6 5.5 10 5.5S19.5 14.5 22 11" />
      <path d="M5 14.5 3.5 17" />
      <path d="M9.5 16.3 9 19" />
      <path d="M14.5 16.3 15 19" />
      <path d="M19 14.5 20.5 17" />
    </svg>
  );
}

/** Eye open. */
function EyeOpen() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/**
 * Chapter VI on the About page, Rapid Fire as a conversation. Each question
 * is a plain line; opening one shows Maninder's reply in Playfair, marked
 * with his name. The first reply is open to begin with; one is open at a
 * time. Each question is a button with aria-expanded and an eye icon (closed
 * or open). Without JavaScript every reply is shown.
 */
export default function Conversation({ items, replyName }: { items: RapidFireItem[]; replyName: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="convo">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.question} className="convo-item">
            <h3>
              <button
                type="button"
                id={`convo-q-${i}`}
                aria-expanded={isOpen}
                aria-controls={`convo-a-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="convo-q"
              >
                <span>{item.question}</span>
                <span className="convo-eye">
                  {isOpen ? <EyeOpen /> : <EyeClosed />}
                </span>
              </button>
            </h3>
            <div
              id={`convo-a-${i}`}
              role="region"
              aria-labelledby={`convo-q-${i}`}
              className="convo-a"
              data-open={isOpen ? "" : undefined}
            >
              <p className="convo-who">
                <span aria-hidden="true" className="convo-dot" />
                {replyName}
              </p>
              <p className="convo-reply">{item.answer}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
