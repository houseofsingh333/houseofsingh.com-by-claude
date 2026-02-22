"use client";

import { usePathname, useRouter } from "next/navigation";

type Props = {
  tabIndex?: number;
};

/*
 * ── DESKTOP RELIABILITY FIX ───────────────────────────────────────
 * Root cause: NavOverlay (z-50) and NewsletterModal (z-60/61) render
 * full-screen fixed elements even when closed, relying on
 * pointer-events:none. On desktop, mouse hit-testing through 5+
 * stacked pointer-events:none layers is unreliable — clicks silently
 * fail. Mobile touch is unaffected because touch target resolution
 * happens at touchstart before hit-testing the layer stack.
 *
 * Fix: explicit pointer-events:auto + relative positioning + z-index
 * on the toggle group and every button, so they assertively capture
 * clicks regardless of what sits above or below in the stacking order.
 * ──────────────────────────────────────────────────────────────────
 *
 * ── TEST CHECKLIST ───────────────────────────────────────────────
 * 1. /about  → E black+bullet, ਪ gray. Click ਪ → /pa/about.
 * 2. /pa/about → ਪ black+bullet, E gray. Click E → /about.
 * 3. / → click ਪ → /pa. Click E → /.
 * 4. Desktop: click each letter 10× rapidly — every click navigates.
 * 5. Mobile: tap each letter — every tap navigates.
 * 6. ?foo=bar#s in URL → toggle preserves params and hash.
 * 7. Rapid toggle → never produces /pa/pa.
 * ─────────────────────────────────────────────────────────────────
 */

export default function LanguageToggle({ tabIndex = 0 }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const isPa = pathname === "/pa" || pathname.startsWith("/pa/");

  const switchTo = (lang: "en" | "pa") => {
    const suffix =
      typeof window !== "undefined"
        ? window.location.search + window.location.hash
        : "";

    let next: string;

    if (lang === "en") {
      if (!isPa) return;
      next = pathname.slice(3) || "/";
    } else {
      if (isPa) return;
      next = "/pa" + (pathname === "/" ? "" : pathname);
    }

    router.push(next + suffix);
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className="relative z-10 flex items-center gap-1.5"
      style={{ pointerEvents: "auto" }}
    >
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
      className="relative flex flex-col items-center justify-center min-h-[36px] min-w-[36px] rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60 focus-visible:ring-offset-2"
      style={{ pointerEvents: "auto" }}
    >
      <span
        className="select-none leading-none transition-opacity duration-150"
        style={{
          ...fontStyle,
          color: active ? "var(--foreground)" : "rgba(0,0,0,0.35)",
          transition: "color 150ms ease-out, opacity 150ms ease-out",
        }}
      >
        {label}
      </span>

      {/* Bullet — always in DOM for stable layout, transparent when inactive */}
      <span
        aria-hidden="true"
        className="block w-[5px] h-[5px] rounded-full mt-[3px]"
        style={{
          backgroundColor: active ? "var(--foreground)" : "transparent",
          transition: "background-color 150ms ease-out",
        }}
      />
    </button>
  );
}
