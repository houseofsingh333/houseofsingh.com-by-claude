"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import SanityImage from "@/components/SanityImage";
import { useDragToScroll } from "@/hooks/useDragToScroll";
import type { AboutMilestone } from "@/lib/types";

const CARD_W = 280;
// Height of the 3:4 image frame. The edge fades stop here so they only ever
// soften photographs, never the year and title underneath.
const FRAME_H = Math.round((CARD_W * 4) / 3);
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
  desktop: { maxBlur: 4, maxGrayscale: 1.0, minOpacity: 0.4, minScale: 0.95 },
  tablet:  { maxBlur: 2, maxGrayscale: 0.6, minOpacity: 0.5, minScale: 0.95 },
  mobile:  null, // no JS focus effect — handled by CSS scroll-driven animations
} as const;

export default function Timeline({ milestones }: { milestones: AboutMilestone[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  // The focus effect (blur, grayscale, fade) is applied to the image frames
  // only, so the milestone text stays readable at every scroll position.
  const framesRef = useRef<(HTMLDivElement | null)[]>([]);
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

    const centerX = container.scrollLeft + container.clientWidth / 2;

    // The milestone closest to the centre is the active one: its text is
    // charcoal, every other milestone's text is muted grey. This runs on all
    // devices, including mobile where the image effect is pure CSS.
    let activeIdx = -1;
    let bestDist = Infinity;
    cardsRef.current.forEach((card, idx) => {
      if (!card) return;
      const d = Math.abs(centerX - (card.offsetLeft + card.offsetWidth / 2));
      if (d < bestDist) {
        bestDist = d;
        activeIdx = idx;
      }
    });
    cardsRef.current.forEach((card, idx) => {
      if (!card) return;
      if (idx === activeIdx) card.dataset.active = "";
      else delete card.dataset.active;
    });

    const params = FOCUS_PARAMS[deviceRef.current];

    // On mobile, clear any leftover inline styles and skip
    if (!params) {
      cardsRef.current.forEach((card, idx) => {
        if (card) card.style.transform = "";
        const frame = framesRef.current[idx];
        if (frame) {
          frame.style.filter = "";
          frame.style.opacity = "";
        }
      });
      return;
    }

    const { maxBlur, maxGrayscale, minOpacity, minScale } = params;

    cardsRef.current.forEach((card, idx) => {
      const frame = framesRef.current[idx];
      if (!card || !frame) return;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(centerX - cardCenter);
      const maxDist = container.clientWidth / 2;
      const t = Math.min(dist / maxDist, 1); // 0 = center, 1 = edge

      const blur = t * maxBlur;
      const grayscale = t * maxGrayscale;
      const opacity = 1 - t * (1 - minOpacity);
      const scale = 1 - t * (1 - minScale);

      frame.style.filter = `blur(${blur}px) grayscale(${grayscale})`;
      frame.style.opacity = String(opacity);
      card.style.transform = `scale(${scale})`;
    });
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updatePadding = () => {
      // Center-snap padding: first and last card can snap/scroll to center
      const pad = Math.max(0, container.clientWidth / 2 - CARD_W / 2);
      container.style.paddingLeft = `${pad}px`;
      container.style.paddingRight = `${pad}px`;
      applyFocus();
    };

    updatePadding();
    window.addEventListener("resize", updatePadding);

    // On mobile this only moves the active marker; the image effect there
    // is CSS driven.
    const onScroll = () => applyFocus();
    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", updatePadding);
      container.removeEventListener("scroll", onScroll);
    };
  }, [applyFocus]);

  // Re-run when the layout switches device category, so the active marker
  // and inline image styles match the new mode.
  useEffect(() => {
    applyFocus();
  }, [device, applyFocus]);

  const isMobile = device === "mobile";

  // Desktop click-and-drag, shared with ProjectsArchive. Touch layouts already
  // scroll natively, so the mouse path is skipped there.
  useDragToScroll(scrollRef, !isMobile);

  return (
    <div className="relative">
      {/* Edge fades — hidden on mobile */}
      {!isMobile && (
        <>
          <div
            className="edge-fade absolute left-0 top-0 z-10 pointer-events-none"
            style={{
              height: FRAME_H,
              background: "linear-gradient(to right, var(--background) 0%, color-mix(in srgb, var(--background) 70%, transparent) 30%, color-mix(in srgb, var(--background) 30%, transparent) 60%, transparent 100%)",
            }}
          />
          <div
            className="edge-fade absolute right-0 top-0 z-10 pointer-events-none"
            style={{
              height: FRAME_H,
              background: "linear-gradient(to left, var(--background) 0%, color-mix(in srgb, var(--background) 70%, transparent) 30%, color-mix(in srgb, var(--background) 30%, transparent) 60%, transparent 100%)",
            }}
          />
        </>
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className={`timeline-scroll flex overflow-x-auto${isMobile ? " timeline-scroll--mobile" : ""}`}
        style={{
          gap: isMobile ? GAP_MOBILE : GAP,
          scrollbarWidth: "none",
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
                    willChange: "transform",
                    transition: "transform 0.15s ease",
                  }),
            }}
          >
            {/* Image frame: carries the focus fade */}
            <div
              ref={(el) => { framesRef.current[idx] = el; }}
              className="film-frame relative w-full overflow-hidden"
              style={{
                aspectRatio: "3 / 4",
                border: "1px solid rgba(0,0,0,0.06)",
                ...(isMobile
                  ? {}
                  : {
                      willChange: "filter, opacity",
                      transition: "filter 0.15s ease, opacity 0.15s ease",
                    }),
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
                className="film-text font-editorial font-light leading-none"
                style={{ fontSize: 36 }}
              >
                {m.year}
              </p>
              <p
                className="film-text mt-1 uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.18em",
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

        /* Milestone text never fades: muted grey (4.57:1) when inactive,
           charcoal on the milestone in focus. */
        .film-text {
          color: var(--muted-foreground);
          transition: color 0.3s ease;
        }
        .film-card[data-active] .film-text {
          color: var(--foreground);
        }
        @media (max-width: 1023px) {
          .edge-fade {
            width: 60px;
          }
        }

        /* ─── Mobile: scroll-snap + CSS scroll-driven animations ─── */
        @media (max-width: 767px) {
          .timeline-scroll--mobile {
            scroll-snap-type: x mandatory;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .film-card--mobile {
            scroll-snap-align: center;
          }
          .film-card--mobile .film-frame {
            will-change: filter, opacity;
          }
        }

        /*
         * CSS Scroll-Driven Animation (mobile only)
         *
         * Uses animation-timeline: view(inline) to track each card's
         * horizontal position within the scroll container's viewport.
         * As a card enters from either side, it starts grayscale/faded/scaled-down
         * and transitions to full color/opacity/scale at the center,
         * then fades back out as it exits the other side.
         *
         * Browser support: Chrome 115+, Edge 115+. For unsupported browsers
         * (Safari, Firefox as of early 2026), the @supports fallback shows
         * all cards at full color/scale with no animation.
         */
        @media (max-width: 767px) {
          @keyframes grayscale-to-color {
            0% {
              filter: grayscale(1);
              opacity: 0.6;
            }
            50% {
              filter: grayscale(0);
              opacity: 1;
            }
            100% {
              filter: grayscale(1);
              opacity: 0.6;
            }
          }

          @supports (animation-timeline: view()) {
            .film-card--mobile .film-frame {
              animation: grayscale-to-color linear both;
              animation-timeline: view(inline);
              animation-range: contain 0% contain 100%;
            }
          }

          @supports not (animation-timeline: view()) {
            .film-card--mobile .film-frame {
              filter: grayscale(0);
              opacity: 1;
            }
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .film-card {
            transform: none !important;
            transition: none !important;
          }
          .film-frame {
            transition: opacity 0.15s ease !important;
            filter: none !important;
          }
          .film-text {
            transition: none;
          }
          .film-card--mobile .film-frame {
            animation: none !important;
            filter: grayscale(0) !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
