"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Props = {
  categories: string[];
  active: string;
  onFilter: (category: string) => void;
};

/**
 * Horizontal editorial filter rail with overflow support.
 *
 * Desktop: single-line rail. If categories overflow, a "More" text item
 *          opens a minimal multi-column panel listing all categories.
 * Mobile:  "All" + "Filters" text item → tapping opens a toggleable panel.
 *
 * Typography-only active state: darker text + subtle underline.
 * No pills, chips, buttons, icons, or dropdowns.
 */
export default function ProjectsFiltersHorizontal({
  categories,
  active,
  onFilter,
}: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ——— Overflow detection (desktop) ———
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const check = () => {
      // Compare scroll width vs visible width
      setOverflowing(rail.scrollWidth > rail.clientWidth + 2);
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(rail);
    return () => ro.disconnect();
  }, [categories]);

  // ——— Close panel on ESC ———
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [panelOpen]);

  // ——— Close panel on click outside ———
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [panelOpen]);

  const select = useCallback(
    (cat: string) => {
      onFilter(cat);
      setPanelOpen(false);
    },
    [onFilter],
  );

  const allCategories = ["All", ...categories];

  return (
    <nav className="relative" aria-label="Filter projects by category" ref={panelRef}>
      {/* ——— Desktop rail ——— */}
      <div className="hidden md:block">
        <div className="flex items-center gap-6 lg:gap-8">
          {/* Scrollable rail — no visible scrollbar, overflow hidden */}
          <div
            ref={railRef}
            className="flex items-center gap-6 lg:gap-8 overflow-hidden flex-1"
          >
            {allCategories.map((cat) => {
              const isActive = active === cat;
              return (
                <button
                  key={cat}
                  onClick={() => select(cat)}
                  className={`
                    whitespace-nowrap text-xs tracking-[0.15em] uppercase
                    pb-1 cursor-pointer select-none shrink-0
                    transition-[color,opacity] duration-200
                    outline-none focus-visible:underline focus-visible:underline-offset-4
                    ${isActive
                      ? "text-foreground border-b border-foreground"
                      : "text-muted-foreground/40 hover:text-muted-foreground border-b border-transparent"
                    }
                  `}
                  aria-current={isActive ? "true" : undefined}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* "More" trigger — only when overflowing */}
          {overflowing && (
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className={`
                whitespace-nowrap text-xs tracking-[0.15em] uppercase
                pb-1 cursor-pointer select-none shrink-0
                transition-[color,opacity] duration-200
                outline-none focus-visible:underline focus-visible:underline-offset-4
                text-muted-foreground/40 hover:text-muted-foreground
                border-b border-transparent
              `}
              aria-expanded={panelOpen}
            >
              {panelOpen ? "Less" : "More"}
            </button>
          )}
        </div>
      </div>

      {/* ——— Mobile rail ——— */}
      <div className="md:hidden flex items-center gap-6">
        <button
          onClick={() => select("All")}
          className={`
            text-xs tracking-[0.15em] uppercase pb-1 cursor-pointer select-none
            transition-[color,opacity] duration-200
            outline-none focus-visible:underline focus-visible:underline-offset-4
            ${active === "All"
              ? "text-foreground border-b border-foreground"
              : "text-muted-foreground/40 hover:text-muted-foreground border-b border-transparent"
            }
          `}
          aria-current={active === "All" ? "true" : undefined}
        >
          All
        </button>
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className={`
            text-xs tracking-[0.15em] uppercase pb-1 cursor-pointer select-none
            transition-[color,opacity] duration-200
            outline-none focus-visible:underline focus-visible:underline-offset-4
            ${active !== "All"
              ? "text-foreground border-b border-foreground"
              : "text-muted-foreground/40 hover:text-muted-foreground border-b border-transparent"
            }
          `}
          aria-expanded={panelOpen}
        >
          {panelOpen ? "Close" : "Filters"}
        </button>
      </div>

      {/* ——— Overflow panel (shared desktop + mobile) ——— */}
      <div
        className={`
          overflow-hidden transition-[max-height,opacity] duration-300 ease-out
          ${panelOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}
        `}
        role="region"
        aria-label="All category filters"
      >
        <div className="pt-6 pb-2 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3">
          {allCategories.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => select(cat)}
                tabIndex={panelOpen ? 0 : -1}
                className={`
                  text-left text-xs tracking-[0.15em] uppercase
                  py-1 cursor-pointer select-none
                  transition-[color,opacity] duration-200
                  outline-none focus-visible:underline focus-visible:underline-offset-4
                  ${isActive
                    ? "text-foreground"
                    : "text-muted-foreground/40 hover:text-muted-foreground"
                  }
                `}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`
                      w-[3px] h-[3px] rounded-full bg-foreground shrink-0
                      transition-opacity duration-200
                      ${isActive ? "opacity-100" : "opacity-0"}
                    `}
                    aria-hidden="true"
                  />
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
