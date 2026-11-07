"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import type { JournalEntry } from "@/lib/types";
import { formatDayOfMonth, formatShortMonthYear } from "@/lib/dates";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

/* ── Stack constants ── */

const HEADER_PX = 68;
const STACK_GAP = 8; // breathing room below global header
const STACK_TOP = HEADER_PX + STACK_GAP; // 76px — where journal header sticks
const HEADER_ROW_H = 44; // height of the sticky JOURNAL header row
const CARD_TOP = STACK_TOP + HEADER_ROW_H; // 120px — where cards start sticking
const CARD_VH = 39;
const PEEK_VH = 15; // ~39% of card height
const WIDTH_STEP = 4; // px narrower per layer (2px per side)

/**
 * The home page journal on phones and tablets (below 1024px): sticky stacked
 * image cards. Stays a client component for the scroll linked "stacked"
 * state. Entries arrive sorted and capped by JournalPreview.
 */
export default function JournalStack({ displayed }: { displayed: JournalEntry[] }) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reducedMotion = usePrefersReducedMotion();

  /* ── Mobile: scroll-linked stacked-state detection ── */
  useEffect(() => {
    if (isDesktop || reducedMotion) return;
    const cards = cardRefs.current;

    let ticking = false;

    const update = () => {
      const vh = window.innerHeight / 100;
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const stickyTop = CARD_TOP + i * PEEK_VH * vh;
        const isStuck = Math.abs(rect.top - stickyTop) < 4;
        el.classList.toggle("journal-card-stacked", isStuck);
      });
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    requestAnimationFrame(update);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cards.forEach((el) => el?.classList.remove("journal-card-stacked"));
    };
  }, [displayed.length, isDesktop, reducedMotion]);

  // ═══ MOBILE / TABLET (<lg): sticky stacked image cards ═══
  return (
    <div className="lg:hidden">
      {displayed.map((entry, i) => (
        <div
          key={entry._id}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className="journal-stack-card"
          style={{
            position: "sticky",
            top: `calc(${CARD_TOP}px + ${i * PEEK_VH}vh)`,
            zIndex: displayed.length - i,
            height: `${CARD_VH}vh`,
            width: `calc(100% - ${i * WIDTH_STEP}px)`,
            marginInline: "auto",
            marginBottom: i < displayed.length - 1 ? 14 : undefined,
          }}
        >
          <Link
            href={`/journal/${entry.slug}`}
            className="journal-stack-link block relative w-full h-full overflow-hidden"
          >
            {/* Cover image — full bleed */}
            {entry.coverImage ? (
              <SanityImage
                image={entry.coverImage}
                context="hero"
                alt={entry.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-secondary" />
            )}

            {/* Bottom gradient — text readability over color images */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />

            {/* Card text — bottom bar: title+read left, date right */}
            <div className="journal-card-text absolute inset-x-0 bottom-0 p-6 z-10 flex items-end justify-between gap-4">
              {/* Left: title + read more */}
              <div className="flex flex-col items-start min-w-0">
                <h3 className="font-editorial text-[15px] font-light text-white leading-snug line-clamp-2">
                  {entry.title}
                </h3>
                <span className="mt-2 text-[10px] tracking-[0.2em] uppercase text-white/70 underline underline-offset-4 decoration-white/40">
                  Read more
                </span>
              </div>

              {/* Right: date */}
              <time className="flex flex-col items-end text-right shrink-0 text-white">
                <span className="block text-3xl font-bold leading-none tracking-tight">
                  {formatDayOfMonth(entry.date)}
                </span>
                <span className="block text-[10px] tracking-widest uppercase mt-1 text-white/80">
                  {formatShortMonthYear(entry.date)}
                </span>
              </time>
            </div>
          </Link>
        </div>
      ))}

      {/* Scroll runway — ensures all 4 cards reach their sticky position */}
      <div className="h-[35vh]" aria-hidden="true" />
    </div>
  );
}
