"use client";

import { useEffect, useRef, useState } from "react";

/** The external arrow (north east). */
function Arrow({ className }: { className: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={className}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

/** The forward arrow (east), for buttons that move on through a form. */
function ArrowRight({ className }: { className: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={className}>
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/** How long the fill stays after a press on a touch screen: its 600ms draw and a short hold. */
const PRESS_MS = 900;

/**
 * The outlined call to action, shared by Chapter VII ("Visit House of
 * Singh Studios") and the closing section above the footer ("Book a
 * call"): a 1px charcoal outline in the label style. On hover and keyboard
 * focus, charcoal fills it from left to right and the text turns canvas;
 * the arrow slips out to the top right while a second glides in from the
 * bottom left (styles/motion.css, "The outlined call to action"). A press
 * on a touch screen plays the fill briefly (data-pressed), since a touch
 * has no hover. Opens its address in a new tab.
 */
export default function OutlineCta({ href, label, className }: { href: string; label: string; className?: string }) {
  const [pressed, setPressed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`outline-cta type-label${className ? ` ${className}` : ""}`}
      data-pressed={pressed ? "" : undefined}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") return;
        setPressed(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setPressed(false), PRESS_MS);
      }}
    >
      <span aria-hidden="true" className="outline-cta-fill" />
      <span className="outline-cta-text">
        {label}
        <span className="sr-only"> (opens in a new tab)</span>
      </span>
      <span aria-hidden="true" className="outline-cta-arrows">
        <Arrow className="outline-cta-arrow outline-cta-arrow-out" />
        <Arrow className="outline-cta-arrow outline-cta-arrow-in" />
      </span>
    </a>
  );
}

/**
 * The outlined button for a form's primary step (approved 10 Nov): Continue,
 * Send and Submit on the contact form and the project interest form. The
 * same outline, fill and text as OutlineCta, a forward arrow that slips out
 * to the right while a second glides in from the left, and a quiet
 * disabled state (no fill) until the step can go on.
 */
export function OutlineButton({
  children,
  onClick,
  type = "button",
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-arrow="right"
      className={`outline-cta type-label${className ? ` ${className}` : ""}`}
    >
      <span aria-hidden="true" className="outline-cta-fill" />
      <span className="outline-cta-text">{children}</span>
      <span aria-hidden="true" className="outline-cta-arrows">
        <ArrowRight className="outline-cta-arrow outline-cta-arrow-out" />
        <ArrowRight className="outline-cta-arrow outline-cta-arrow-in" />
      </span>
    </button>
  );
}
