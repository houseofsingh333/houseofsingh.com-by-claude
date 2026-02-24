"use client";

import { useState, useEffect, useRef } from "react";
import SanityImage from "@/components/SanityImage";
import type { AboutMilestone } from "@/lib/types";

/* ── Repeated sub-elements ── */

const GRAYSCALE_IMG_CLASS =
  "object-cover grayscale scale-105 hover:grayscale-0 hover:scale-100 hover:brightness-110 transition-all duration-700 ease-out";

function MilestoneContent({ m, compact }: { m: AboutMilestone; compact?: boolean }) {
  return (
    <>
      <p className={`timeline-year font-editorial ${compact ? "text-4xl" : "text-5xl"} font-light text-foreground leading-none mb-2`}>
        {m.year}
      </p>
      <p className="text-[11px] tracking-[0.15em] uppercase text-foreground mb-1">
        {m.title}
      </p>
      <p className={`text-xs text-muted-foreground leading-[1.6]${compact ? " mb-3" : ""}`}>
        {m.text}
      </p>
    </>
  );
}

function MilestoneImage({ image, alt }: { image: AboutMilestone["image"]; alt: string }) {
  return (
    <SanityImage
      image={image}
      context="thumbnail"
      alt={alt}
      fill
      className={GRAYSCALE_IMG_CLASS}
    />
  );
}

/* ── Single milestone row ── */

function TimelineMilestone({ m, idx }: { m: AboutMilestone; idx: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const isEven = idx % 2 === 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const slideFrom = isEven ? "md:-translate-x-8" : "md:translate-x-8";
  const fadeClass = (translate: string) =>
    visible ? "opacity-100 translate-x-0" : `opacity-0 ${translate}`;

  return (
    <div
      ref={ref}
      className="timeline-milestone relative mb-14 last:mb-0 md:mb-0 md:min-h-[160px] group"
      tabIndex={0}
    >
      {/* Dot */}
      <div className="absolute left-6 md:left-1/2 top-3 -translate-x-1/2 z-10">
        <div
          className={`timeline-dot w-2 h-2 rounded-full transition-all duration-500 group-hover:bg-foreground/60 group-focus-within:bg-foreground/60 ${
            visible ? "bg-foreground/25 scale-100" : "bg-foreground/0 scale-0"
          }`}
        />
      </div>

      {/* Desktop: two-column grid */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-0">
        {/* Left column */}
        <div
          className={`flex ${isEven ? "justify-end pr-12" : "justify-start pl-12"} ${!isEven ? "order-2" : "order-1"}`}
        >
          {isEven ? (
            <div
              className={`timeline-content text-right max-w-[280px] py-4 transition-all duration-700 ease-out ${fadeClass(slideFrom)}`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <MilestoneContent m={m} />
            </div>
          ) : (
            <div
              className={`timeline-image relative w-[220px] aspect-[4/3] overflow-hidden bg-secondary py-4 transition-all duration-700 ease-out ${fadeClass("md:-translate-x-8")}`}
              style={{ transitionDelay: `${idx * 100 + 150}ms` }}
            >
              <MilestoneImage image={m.image} alt={m.title} />
            </div>
          )}
        </div>

        {/* Right column */}
        <div
          className={`flex ${!isEven ? "justify-end pr-12" : "justify-start pl-12"} ${!isEven ? "order-1" : "order-2"}`}
        >
          {isEven ? (
            <div
              className={`timeline-image relative w-[220px] aspect-[4/3] overflow-hidden bg-secondary py-4 transition-all duration-700 ease-out ${fadeClass("md:translate-x-8")}`}
              style={{ transitionDelay: `${idx * 100 + 150}ms` }}
            >
              <MilestoneImage image={m.image} alt={m.title} />
            </div>
          ) : (
            <div
              className={`timeline-content-reverse text-left max-w-[280px] py-4 transition-all duration-700 ease-out ${fadeClass(slideFrom)}`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <MilestoneContent m={m} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile: single column */}
      <div
        className={`md:hidden pl-14 transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{ transitionDelay: `${idx * 100}ms` }}
      >
        <MilestoneContent m={m} compact />
        <div className="relative w-[180px] aspect-[4/3] overflow-hidden bg-secondary">
          <MilestoneImage image={m.image} alt={m.title} />
        </div>
      </div>
    </div>
  );
}

export default function Timeline({ milestones }: { milestones: AboutMilestone[] }) {
  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Center line */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

      {milestones.map((m, idx) => (
        <TimelineMilestone key={m.year} m={m} idx={idx} />
      ))}
    </div>
  );
}
