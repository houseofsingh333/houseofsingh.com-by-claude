"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import SanityImage from "@/components/SanityImage";
import type { AboutMilestone } from "@/lib/types";

const CARD_W = 280;
const CARD_W_MOBILE = 240;
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
  mobile:  null, // no focus effect
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
      const cardW = cat === "mobile" ? CARD_W_MOBILE : CARD_W;
      // On mobile, no centering padding needed — just small inset
      if (cat === "mobile") {
        container.style.paddingLeft = "16px";
        container.style.paddingRight = "16px";
      } else {
        const pad = Math.max(0, container.clientWidth / 2 - cardW / 2);
        container.style.paddingLeft = `${pad}px`;
        container.style.paddingRight = `${pad}px`;
      }
      applyFocus();
    };

    updatePadding();
    window.addEventListener("resize", updatePadding);

    const onScroll = () => {
      // Skip scroll-based focus calculation on mobile
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
        className="flex select-none overflow-x-auto"
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
            className="film-card flex-shrink-0"
            style={{
              width: isMobile ? CARD_W_MOBILE : CARD_W,
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
        @media (prefers-reduced-motion: reduce) {
          .film-card {
            transition: opacity 0.15s ease !important;
            filter: sepia(var(--sepia, 0)) saturate(0.8) !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
