"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import SanityImage from "@/components/SanityImage";
import type { AboutMilestone } from "@/lib/types";

const CARD_W = 280;
const GAP = 24;
const GAP_MOBILE = 16;

type DeviceCategory = "mobile" | "tablet" | "desktop";

function getDeviceCategory(): DeviceCategory {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

// Focus-effect parameters per device category
const FOCUS_PARAMS = {
  desktop: { maxBlur: 4, maxSepia: 1.0, minOpacity: 0.4, minScale: 0.95 },
  tablet:  { maxBlur: 2, maxSepia: 0.6, minOpacity: 0.5, minScale: 0.95 },
  mobile:  null, // no JS focus effect — handled by CSS scroll-driven animations
} as const;

export default function Timeline({ milestones }: { milestones: AboutMilestone[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const deviceRef = useRef<DeviceCategory>("desktop");
  const [device, setDevice] = useState<DeviceCategory>("desktop");

  // Keep device category in sync on mount + resize
  useEffect(() => {
    const update = () => {
      const cat = getDeviceCategory();
      deviceRef.current = cat;
      setDevice(cat);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const applyFocus = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const params = FOCUS_PARAMS[deviceRef.current];

    // On mobile, clear any leftover inline styles and skip
    if (!params) {
      for (const card of cardsRef.current) {
        if (!card) continue;
        card.style.filter = "";
        card.style.opacity = "";
        card.style.transform = "";
        card.style.removeProperty("--sepia");
      }
      return;
    }

    const centerX = container.scrollLeft + container.clientWidth / 2;
    const { maxBlur, maxSepia, minOpacity, minScale } = params;

    for (const card of cardsRef.current) {
      if (!card) continue;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(centerX - cardCenter);
      const maxDist = container.clientWidth / 2;
      const t = Math.min(dist / maxDist, 1); // 0 = center, 1 = edge

      const blur = t * maxBlur;
      const sepia = t * maxSepia;
      const opacity = 1 - t * (1 - minOpacity);
      const scale = 1 - t * (1 - minScale);

      card.style.setProperty("--sepia", String(sepia));
      card.style.filter = `blur(${blur}px) sepia(${sepia}) saturate(0.8)`;
      card.style.opacity = String(opacity);
      card.style.transform = `scale(${scale})`;
    }
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updatePadding = () => {
      const cat = deviceRef.current;
      if (cat === "mobile") {
        // Center-snap padding: first and last card can snap to center
        const pad = Math.max(0, container.clientWidth / 2 - CARD_W / 2);
        container.style.paddingLeft = `${pad}px`;
        container.style.paddingRight = `${pad}px`;
      } else {
        const pad = Math.max(0, container.clientWidth / 2 - CARD_W / 2);
        container.style.paddingLeft = `${pad}px`;
        container.style.paddingRight = `${pad}px`;
      }
      applyFocus();
    };

    updatePadding();
    window.addEventListener("resize", updatePadding);

    // Only attach scroll listener for focus calculation on non-mobile
    const onScroll = () => {
      if (deviceRef.current !== "mobile") {
        applyFocus();
      }
    };
    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", updatePadding);
      container.removeEventListener("scroll", onScroll);
    };
  }, [applyFocus]);

  // Drag-to-scroll (desktop only)
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

  const isMobile = device === "mobile";

  return (
    <div className="relative">
      {/* Edge fades — hidden on mobile */}
      {!isMobile && (
        <>
          <div
            className="edge-fade absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to right, var(--background), transparent)",
            }}
          />
          <div
            className="edge-fade absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to left, var(--background), transparent)",
            }}
          />
        </>
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`timeline-scroll flex select-none overflow-x-auto${isMobile ? " timeline-scroll--mobile" : ""}`}
        style={{
          gap: isMobile ? GAP_MOBILE : GAP,
          scrollbarWidth: "none",
          cursor: isMobile ? "default" : "grab",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {milestones.map((m, idx) => (
          <div
            key={m.year + idx}
            ref={(el) => { cardsRef.current[idx] = el; }}
            className={`film-card flex-shrink-0${isMobile ? " film-card--mobile" : ""}`}
            style={{
              width: CARD_W,
              ...(isMobile
                ? {}
                : {
                    willChange: "filter, opacity, transform",
                    transition: "filter 0.15s ease, opacity 0.15s ease, transform 0.15s ease",
                  }),
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
        .edge-fade {
          width: 120px;
        }
        @media (max-width: 1023px) {
          .edge-fade {
            width: 60px;
          }
        }

        /* ─── Mobile: scroll-snap + CSS scroll-driven animations ─── */
        @media (max-width: 767px) {
          /* Scroll-snap on the container for frame-by-frame film feel */
          .timeline-scroll--mobile {
            scroll-snap-type: x mandatory;
            overflow-x: auto;
          }

          /* Each card snaps to center */
          .film-card--mobile {
            scroll-snap-align: center;
          }
        }

        /*
         * CSS Scroll-Driven Animation (mobile only)
         *
         * Uses animation-timeline: view(inline) to track each card's
         * horizontal position within the scroll container's viewport.
         * As a card enters from either side, it starts sepia/faded/scaled-down
         * and transitions to full color/opacity/scale at the center snap point,
         * then fades back out as it exits the other side.
         *
         * Browser support: Chrome 115+, Edge 115+. For unsupported browsers
         * (Safari, Firefox as of early 2026), the @supports fallback shows
         * all cards at full color/scale with no animation.
         */
        @media (max-width: 767px) {
          /* Scroll-driven animation keyframes */
          @keyframes sepia-to-color {
            0% {
              filter: sepia(0.8);
              opacity: 0.6;
              transform: scale(0.88);
            }
            50% {
              filter: sepia(0);
              opacity: 1;
              transform: scale(1);
            }
            100% {
              filter: sepia(0.8);
              opacity: 0.6;
              transform: scale(0.88);
            }
          }

          /* Apply scroll-driven animation when supported */
          @supports (animation-timeline: view()) {
            .film-card--mobile {
              animation: sepia-to-color linear both;
              animation-timeline: view(inline);
              /* Start the effect a bit before the card enters and end a bit after it exits */
              animation-range: entry 0% exit 100%;
            }
          }

          /*
           * Fallback: if scroll-driven animations are NOT supported,
           * show all cards at full color, full opacity, full scale.
           * Scroll-snap still works regardless.
           */
          @supports not (animation-timeline: view()) {
            .film-card--mobile {
              filter: none;
              opacity: 1;
              transform: scale(1);
            }
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .film-card {
            transition: opacity 0.15s ease !important;
            filter: sepia(var(--sepia, 0)) saturate(0.8) !important;
            transform: none !important;
          }
          /* Disable scroll-driven animation for reduced motion */
          .film-card--mobile {
            animation: none !important;
            filter: none !important;
            opacity: 1 !important;
            transform: scale(1) !important;
          }
        }
      `}</style>
    </div>
  );
}
