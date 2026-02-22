"use client";

import { usePathname, useRouter } from "next/navigation";

type Props = {
  tabIndex?: number;
};

/**
 * Pill language toggle — E · ਪ
 *
 * Outer pill: white bg, thin black stroke, rounded-full.
 * Inner knob: black filled circle that slides left (EN) or right (PA).
 * Active label sits inside the knob → white text.
 * Inactive label sits on white bg → black text.
 * Transition: 200ms ease-out, no bounce.
 */
export default function LanguageToggle({ tabIndex = 0 }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const isPa = pathname.startsWith("/pa");

  const goEnglish = () => {
    if (!isPa) return;
    const next = pathname.slice(3) || "/";
    router.push(next);
  };

  const goPunjabi = () => {
    if (isPa) return;
    const next = "/pa" + (pathname === "/" ? "" : pathname);
    router.push(next);
  };

  return (
    /*
     * Outer pill — white background, 1px black border.
     * 56 × 28 px keeps parity with the old size so header layout is unaffected.
     */
    <div
      role="group"
      aria-label="Language"
      className="relative flex items-center rounded-full bg-white"
      style={{
        width: 56,
        height: 28,
        border: "1.5px solid black",
        /* Clip the knob so it never overflows the pill edge */
        overflow: "hidden",
      }}
    >
      {/* ── Sliding knob ─────────────────────────────────────────────── */}
      <span
        aria-hidden="true"
        className="absolute rounded-full bg-black pointer-events-none"
        style={{
          /*
           * Knob is 26×26 px — 1px inset on each side so the pill border
           * stays visible around it. translateX(0) = left (EN),
           * translateX(27px) = right (PA).
           */
          width: 26,
          height: 26,
          top: 0,
          left: 0,
          transform: isPa ? "translateX(27px)" : "translateX(0px)",
          transition: "transform 200ms ease-out",
        }}
      />

      {/* ── English button ───────────────────────────────────────────── */}
      <button
        onClick={goEnglish}
        aria-pressed={!isPa}
        aria-label="English"
        tabIndex={tabIndex}
        className={[
          "relative z-10 flex items-center justify-center",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-black focus-visible:ring-offset-1",
          "rounded-full select-none",
          /* Subtle press feedback */
          "active:scale-95",
          "transition-transform duration-100",
        ].join(" ")}
        style={{
          width: 27,
          height: 26,
          /* White when active (inside knob), black when inactive */
          color: isPa ? "black" : "white",
          transition: "color 200ms ease-out, transform 100ms",
          fontSize: 11,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 500,
          letterSpacing: "0.08em",
          cursor: isPa ? "pointer" : "default",
        }}
      >
        E
      </button>

      {/* ── Punjabi button ───────────────────────────────────────────── */}
      <button
        onClick={goPunjabi}
        aria-pressed={isPa}
        aria-label="ਪੰਜਾਬੀ"
        tabIndex={tabIndex}
        className={[
          "relative z-10 flex items-center justify-center",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-black focus-visible:ring-offset-1",
          "rounded-full select-none",
          "active:scale-95",
          "transition-transform duration-100",
        ].join(" ")}
        style={{
          width: 27,
          height: 26,
          /* White when active (inside knob), black when inactive */
          color: isPa ? "white" : "black",
          transition: "color 200ms ease-out, transform 100ms",
          fontSize: 14,
          fontFamily: "var(--font-pa)",
          cursor: isPa ? "default" : "pointer",
        }}
      >
        ਪ
      </button>
    </div>
  );
}
