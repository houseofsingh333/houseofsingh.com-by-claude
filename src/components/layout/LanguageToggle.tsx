"use client";

import { usePathname, useRouter } from "next/navigation";

type Props = {
  tabIndex?: number;
};

/*
 * ── TEST CHECKLIST ──────────────────────────────────────────────────
 * 1. Navigate to /about  → "E" should be black with bullet, "ਪ" gray.
 *    Click "ਪ" → URL should become /pa/about, "ਪ" black with bullet.
 * 2. Navigate to /pa/about → "ਪ" should be black with bullet, "E" gray.
 *    Click "E" → URL should become /about, "E" black with bullet.
 * 3. Navigate to / → click "ਪ" → URL should become /pa (not /pa/).
 *    Click "E" → URL should become / (not empty string).
 * 4. Repeat all above on mobile (touch) — every tap must register.
 * 5. Add ?foo=bar#section to URL, toggle — params and hash preserved.
 * 6. Rapidly toggle 5× — should never produce /pa/pa double prefix.
 * ────────────────────────────────────────────────────────────────────
 */

export default function LanguageToggle({ tabIndex = 0 }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  // Robust check: only match /pa or /pa/… (not /pages, /party, etc.)
  const isPa = pathname === "/pa" || pathname.startsWith("/pa/");

  const switchTo = (lang: "en" | "pa") => {
    // Preserve query params and hash from the browser URL
    const suffix =
      typeof window !== "undefined"
        ? window.location.search + window.location.hash
        : "";

    let next: string;

    if (lang === "en") {
      if (!isPa) return; // already English
      next = pathname.slice(3) || "/";
    } else {
      if (isPa) return; // already Punjabi
      // Guard: never double-prefix
      next = "/pa" + (pathname === "/" ? "" : pathname);
    }

    router.push(next + suffix);
  };

  return (
    <div role="group" aria-label="Language" className="flex items-center gap-3">
      <LangButton
        label="E"
        ariaLabel="English"
        active={!isPa}
        tabIndex={tabIndex}
        onClick={() => switchTo("en")}
        fontStyle={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.08em",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      />
      <LangButton
        label="ਪ"
        ariaLabel="ਪੰਜਾਬੀ (Punjabi)"
        active={isPa}
        tabIndex={tabIndex}
        onClick={() => switchTo("pa")}
        fontStyle={{
          fontSize: 14,
          fontFamily: "var(--font-pa)",
        }}
      />
    </div>
  );
}

/* ── Individual language button ─────────────────────────────────── */

function LangButton({
  label,
  ariaLabel,
  active,
  tabIndex,
  onClick,
  fontStyle,
}: {
  label: string;
  ariaLabel: string;
  active: boolean;
  tabIndex: number;
  onClick: () => void;
  fontStyle: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      className="flex flex-col items-center justify-center min-h-[44px] min-w-[36px] px-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60 focus-visible:ring-offset-2"
    >
      <span
        className="select-none leading-none"
        style={{
          ...fontStyle,
          color: active ? "var(--foreground)" : "rgba(0,0,0,0.35)",
          transition: "color 150ms ease-out",
        }}
      >
        {label}
      </span>

      {/* Bullet indicator — always in DOM for stable layout, invisible when inactive */}
      <span
        aria-hidden="true"
        className="block w-[5px] h-[5px] rounded-full mt-[4px]"
        style={{
          backgroundColor: active ? "var(--foreground)" : "transparent",
          transition: "background-color 150ms ease-out",
        }}
      />
    </button>
  );
}
