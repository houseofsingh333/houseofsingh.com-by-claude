"use client";

import { usePathname, useRouter } from "next/navigation";

type Props = {
  tabIndex?: number;
};

/**
 * Segmented language toggle — E · ਪ
 *
 * A single black dot slides behind the active glyph (200ms ease-out).
 * Active glyph is white; inactive is foreground colour.
 * No icons, no dividers, no button chrome — matches the dot-menu aesthetic.
 */
export default function LanguageToggle({ tabIndex = 0 }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const isPa = pathname.startsWith("/pa");

  const handleToggle = () => {
    if (isPa) {
      // Strip /pa prefix — preserve rest of path
      const next = pathname.slice(3) || "/";
      router.push(next);
    } else {
      // Add /pa prefix — preserve rest of path
      const next = "/pa" + (pathname === "/" ? "" : pathname);
      router.push(next);
    }
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={
        isPa
          ? "Switch to English"
          : "ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲੋ (Switch to Punjabi)"
      }
      tabIndex={tabIndex}
      className="relative flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 rounded-full"
      style={{ width: 56, height: 28 }}
    >
      {/* Sliding circle indicator */}
      <span
        aria-hidden="true"
        className="absolute w-7 h-7 rounded-full bg-foreground pointer-events-none"
        style={{
          transform: isPa ? "translateX(28px)" : "translateX(0)",
          transition: "transform 200ms ease-out",
        }}
      />

      {/* E glyph */}
      <span
        aria-hidden="true"
        className="lang-toggle-glyph relative z-10 w-7 h-7 flex items-center justify-center text-[11px] font-medium tracking-wider select-none"
        style={{
          color: isPa ? "var(--foreground)" : "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        E
      </span>

      {/* ਪ glyph */}
      <span
        aria-hidden="true"
        className="lang-toggle-glyph relative z-10 w-7 h-7 flex items-center justify-center text-sm select-none"
        style={{
          color: isPa ? "white" : "var(--foreground)",
          fontFamily: "var(--font-pa)",
        }}
      >
        ਪ
      </span>
    </button>
  );
}
