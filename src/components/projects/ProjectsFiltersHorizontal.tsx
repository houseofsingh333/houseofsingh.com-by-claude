"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Props = {
  categories: string[];
  active: string;
  onFilter: (category: string) => void;
};

const BTN_BASE =
  "whitespace-nowrap text-xs tracking-[0.15em] uppercase pb-1 cursor-pointer select-none shrink-0 transition-[color,opacity] duration-200 outline-none focus-visible:underline focus-visible:underline-offset-4";

const BTN_ACTIVE = "text-foreground border-b border-foreground";
const BTN_INACTIVE =
  "text-muted-foreground/40 hover:text-muted-foreground border-b border-transparent";

/**
 * Horizontal editorial filter rail.
 *
 * Desktop: single-line rail. If categories overflow, a "More" text item
 *          opens a minimal multi-column panel listing all categories.
 * Mobile:  horizontal scrollable row of all categories (swipeable).
 *
 * Typography-only active state: darker text + subtle underline.
 */
export default function ProjectsFiltersHorizontal({
  categories,
  active,
  onFilter,
}: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mobileRailRef = useRef<HTMLDivElement>(null);

  // ——— Overflow detection (desktop) ———
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const check = () => {
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
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [panelOpen]);

  // ——— Scroll active filter into view on mobile ———
  useEffect(() => {
    const rail = mobileRailRef.current;
    if (!rail) return;
    const activeBtn = rail.querySelector(
      "[aria-current='true']",
    ) as HTMLElement;
    if (activeBtn) {
      activeBtn.scrollIntoView({
        inline: "center",
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [active]);

  const select = useCallback(
    (cat: string) => {
      onFilter(cat);
      setPanelOpen(false);
    },
    [onFilter],
  );

  const allCategories = ["All", ...categories];

  return (
    <nav
      className="relative"
      aria-label="Filter projects by category"
      ref={wrapperRef}
    >
      {/* ——— Desktop rail ——— */}
      <div className="hidden md:block">
        <div className="flex items-center gap-6 lg:gap-8">
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
                  className={`${BTN_BASE} ${isActive ? BTN_ACTIVE : BTN_INACTIVE}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {overflowing && (
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className={`${BTN_BASE} text-muted-foreground/40 hover:text-muted-foreground border-b border-transparent`}
              aria-expanded={panelOpen}
            >
              {panelOpen ? "Less" : "More"}
            </button>
          )}
        </div>
      </div>

      {/* ——— Mobile: horizontal scrollable row ——— */}
      <div
        ref={mobileRailRef}
        className="md:hidden flex items-center gap-5 overflow-x-auto scrollbar-hide -mx-6 px-6"
      >
        {allCategories.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              onClick={() => select(cat)}
              className={`${BTN_BASE} ${isActive ? BTN_ACTIVE : BTN_INACTIVE}`}
              aria-current={isActive ? "true" : undefined}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ——— Desktop overflow panel ——— */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out hidden md:block ${panelOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}
        role="region"
        aria-label="All category filters"
      >
        <div className="pt-6 pb-2 grid grid-cols-4 gap-x-8 gap-y-3">
          {allCategories.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => select(cat)}
                tabIndex={panelOpen ? 0 : -1}
                className={`text-left text-xs tracking-[0.15em] uppercase py-1 cursor-pointer select-none transition-[color,opacity] duration-200 outline-none focus-visible:underline focus-visible:underline-offset-4 ${isActive ? "text-foreground" : "text-muted-foreground/40 hover:text-muted-foreground"}`}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`w-[3px] h-[3px] rounded-full bg-foreground shrink-0 transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-0"}`}
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
