"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import ScrollReveal from "@/components/ScrollReveal";
import type { JournalEntry } from "@/lib/placeholder-data";

type Props = {
  entries: JournalEntry[];
};

/* ── Date formatters ── */

const fmtDay = (d: string) => new Date(d).getDate().toString();

const fmtMonthYear = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/* ── Stack constants ── */

const HEADER_PX = 68;
const STACK_GAP = 8; // breathing room below global header
const STACK_TOP = HEADER_PX + STACK_GAP; // 76px — where journal header sticks
const HEADER_ROW_H = 44; // height of the sticky JOURNAL header row
const CARD_TOP = STACK_TOP + HEADER_ROW_H; // 120px — where cards start sticking
const CARD_VH = 39;
const PEEK_VH = 15; // ~39% of card height
const MAX_CARDS = 4;
const WIDTH_STEP = 4; // px narrower per layer (2px per side)

export default function JournalPreview({ entries }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Sort newest-first and cap at 4 */
  const displayed = entries
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, MAX_CARDS);

  /* ── Desktop: cursor-follow handler ── */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  }, []);

  /* ── Mobile: scroll-linked stacked-state detection ── */
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (isDesktop.matches || reducedMotion.matches) return;

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
    };
  }, [displayed.length]);

  return (
    <section className="px-6 md:px-16 section-py">
      {/* ── Section header — desktop: with scroll reveal ── */}
      <ScrollReveal className="hidden lg:block">
        <div className="flex items-baseline justify-between mb-14">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground">
            Journal
          </h2>
          <Link
            href="/journal"
            className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            Browse all
          </Link>
        </div>
      </ScrollReveal>

      {/* ── Section header — mobile/tablet: sticky, no ScrollReveal ── */}
      <div className="lg:hidden journal-section-header">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground">
            Journal
          </h2>
          <Link
            href="/journal"
            className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            Browse all
          </Link>
        </div>
      </div>

      {/* ═══ DESKTOP (lg+): text-row list — unchanged ═══ */}
      <div className="hidden lg:block relative">
        {displayed.map((entry, index) => (
          <Link
            key={entry._id}
            href={`/journal/${entry.slug}`}
            className="group relative block border-t border-border py-8 md:py-10"
            onMouseEnter={() => setHoveredId(entry._id)}
            onMouseLeave={() => setHoveredId(null)}
            onMouseMove={handleMouseMove}
          >
            <div className="flex items-baseline justify-between gap-4 md:gap-8">
              {/* Index number */}
              <span className="hidden md:block text-xs tracking-widest text-muted-foreground w-12 shrink-0 transition-colors duration-300 group-hover:text-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Title / excerpt */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-3xl lg:text-4xl font-normal text-foreground leading-tight">
                  {entry.title || entry.excerpt}
                </h3>
              </div>

              {/* Date + arrow */}
              <div className="hidden md:flex items-center gap-6 shrink-0">
                <time className="text-xs tracking-widest text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                  {fmtDate(entry.date)}
                </time>
                <span className="text-foreground/0 group-hover:text-foreground transition-[color,transform] duration-500 translate-x-[-8px] group-hover:translate-x-0">
                  →
                </span>
              </div>
            </div>

            {/* Excerpt — hover reveal on desktop */}
            <div className="hidden md:block transition-[opacity,transform] duration-500 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
              <p className="text-sm text-muted-foreground mt-3 ml-12 max-w-lg leading-relaxed">
                {entry.excerpt}
              </p>
            </div>

            {/* Floating cover image that follows cursor */}
            {hoveredId === entry._id && entry.coverImage && (
              <div
                className="hidden md:block absolute z-20 w-48 h-32 overflow-hidden pointer-events-none animate-fade-in"
                style={{
                  left: mousePos.x + 20,
                  top: mousePos.y - 60,
                }}
              >
                <SanityImage
                  image={entry.coverImage}
                  context="thumbnail"
                  alt=""
                  fill
                  className="object-cover grayscale"
                />
              </div>
            )}
          </Link>
        ))}

        {/* Bottom border */}
        <div className="border-t border-border" />
      </div>

      {/* ═══ MOBILE / TABLET (<lg): sticky stacked image cards ═══ */}
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
                  <h3 className="text-[15px] font-light text-white leading-snug line-clamp-2">
                    {entry.title}
                  </h3>
                  <span className="mt-2 text-[10px] tracking-[0.2em] uppercase text-white/70 underline underline-offset-4 decoration-white/40">
                    Read more
                  </span>
                </div>

                {/* Right: date */}
                <time className="flex flex-col items-end text-right shrink-0 text-white">
                  <span className="block text-3xl font-bold leading-none tracking-tight">
                    {fmtDay(entry.date)}
                  </span>
                  <span className="block text-[10px] tracking-widest uppercase mt-1 text-white/80">
                    {fmtMonthYear(entry.date)}
                  </span>
                </time>
              </div>
            </Link>
          </div>
        ))}

        {/* Scroll runway — ensures all 4 cards reach their sticky position */}
        <div className="h-[35vh]" aria-hidden="true" />
      </div>
    </section>
  );
}
