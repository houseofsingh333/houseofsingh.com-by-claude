"use client";

import { useRef, useEffect, useCallback } from "react";
import SanityImage from "@/components/SanityImage";
import type { AboutMilestone } from "@/lib/types";

const CARD_W = 280;
const CARD_W_MOBILE = 240;
const GAP = 24;
const GAP_MOBILE = 16;
const MAX_BLUR = 4;
const MIN_OPACITY = 0.4;
const MIN_SCALE = 0.95;
const FADE_W = 120;

export default function Timeline({ milestones }: { milestones: AboutMilestone[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const applyFocus = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const centerX = container.scrollLeft + container.clientWidth / 2;

    for (const card of cardsRef.current) {
      if (!card) continue;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(centerX - cardCenter);
      const maxDist = container.clientWidth / 2;
      const t = Math.min(dist / maxDist, 1); // 0 = center, 1 = edge

      const blur = t * MAX_BLUR;
      const opacity = 1 - t * (1 - MIN_OPACITY);
      const scale = 1 - t * (1 - MIN_SCALE);

      card.style.filter = `blur(${blur}px) saturate(0.8)`;
      card.style.opacity = String(opacity);
      card.style.transform = `scale(${scale})`;
    }
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Set dynamic padding so first/last card can reach center
    const updatePadding = () => {
      const isMobile = window.innerWidth < 768;
      const cardW = isMobile ? CARD_W_MOBILE : CARD_W;
      const pad = Math.max(0, container.clientWidth / 2 - cardW / 2);
      container.style.paddingLeft = `${pad}px`;
      container.style.paddingRight = `${pad}px`;
      applyFocus();
    };

    updatePadding();
    window.addEventListener("resize", updatePadding);
    container.addEventListener("scroll", applyFocus, { passive: true });

    return () => {
      window.removeEventListener("resize", updatePadding);
      container.removeEventListener("scroll", applyFocus);
    };
  }, [applyFocus]);

  // Drag-to-scroll (desktop)
  const onPointerDown = (e: React.PointerEvent) => {
    const container = scrollRef.current;
    if (!container || e.pointerType === "touch") return;
    isDragging.current = true;
    startX.current = e.clientX;
    scrollLeft.current = container.scrollLeft;
    container.setPointerCapture(e.pointerId);
    container.style.cursor = "grabbing";
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - startX.current;
    scrollRef.current.scrollLeft = scrollLeft.current - dx;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    isDragging.current = false;
    scrollRef.current.releasePointerCapture(e.pointerId);
    scrollRef.current.style.cursor = "grab";
  };

  return (
    <div className="relative">
      {/* Edge fades */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width: FADE_W,
          background: "linear-gradient(to right, var(--background), transparent)",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width: FADE_W,
          background: "linear-gradient(to left, var(--background), transparent)",
        }}
      />

      {/* Scroll container */}
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="flex select-none overflow-x-auto"
        style={{
          gap: GAP,
          scrollbarWidth: "none",
          cursor: "grab",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {milestones.map((m, idx) => (
          <div
            key={m.year + idx}
            ref={(el) => { cardsRef.current[idx] = el; }}
            className="film-card flex-shrink-0"
            style={{
              width: CARD_W,
              willChange: "filter, opacity, transform",
              transition: "filter 0.15s ease, opacity 0.15s ease, transform 0.15s ease",
            }}
          >
            {/* Image frame */}
            <div
              className="relative w-full overflow-hidden"
              style={{
                aspectRatio: "3 / 4",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <SanityImage
                image={m.image}
                context="thumbnail"
                alt={m.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Text */}
            <div className="mt-3 text-center">
              <p
                className="font-editorial font-light leading-none"
                style={{
                  fontSize: 36,
                  color: "rgba(0,0,0,0.12)",
                }}
              >
                {m.year}
              </p>
              <p
                className="mt-1 uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  color: "#777",
                }}
              >
                {m.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Responsive & reduced-motion overrides */}
      <style jsx>{`
        .film-card {
          width: ${CARD_W}px;
        }
        @media (max-width: 767px) {
          .film-card {
            width: ${CARD_W_MOBILE}px;
          }
          div[style*="gap"] {
            gap: ${GAP_MOBILE}px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .film-card {
            transition: opacity 0.15s ease !important;
            filter: saturate(0.8) !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
