"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import { useDragToScroll } from "@/hooks/useDragToScroll";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import ArchiveCard from "./ArchiveCard";
import { useCentredCard, useScrollHint } from "./useArchiveStrip";
import type { HomepageProject } from "@/lib/types";

type Props = {
  projects: HomepageProject[];
};

export default function ProjectsArchive({ projects }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  // Shared hook: reads the setting and follows live changes, like the old
  // listener did, without setting state inside an effect.
  const prefersReducedMotion = usePrefersReducedMotion();
  const activeIndex = useCentredCard(scrollRef, thumbRef);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const focusedIndex = hoveredIndex ?? activeIndex;
  useScrollHint(scrollRef, prefersReducedMotion);

  // Drag-to-scroll — desktop click-and-drag affordance.
  // Shared with the About Journey timeline via useDragToScroll so the two
  // cannot drift apart.
  useDragToScroll(scrollRef);

  return (
    <section className="section-py section-archive">
      {/* Section header */}
      <ScrollReveal>
        <div className="px-6 md:px-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-editorial text-2xl md:text-3xl font-light text-foreground">
              Projects
            </h2>
            <Link
              href="/projects"
              aria-label="See all projects"
              className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-(--dur-hover) ease-(--ease-soft-out) border-b border-foreground/30 pb-0.5"
            >
              See all
            </Link>
          </div>
          <div className="w-full h-px bg-border" />
        </div>
      </ScrollReveal>

      {/* Scroll strip */}
      <div
        ref={scrollRef}
        className="archive-scroll flex overflow-x-auto pt-10 md:pt-14 pb-4"
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
        }}
      >
        {projects.map((project, i) => (
          <ArchiveCard
            key={project._id}
            project={project}
            isFocused={focusedIndex === i}
            prefersReducedMotion={prefersReducedMotion}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onFocus={() => setHoveredIndex(i)}
            onBlur={() => setHoveredIndex(null)}
          />
        ))}
      </div>

      {/* Custom micro scrollbar — desktop only (hidden below 1024px via CSS) */}
      <div className="archive-scrollbar-track mx-6 md:mx-16 mt-4">
        <div ref={thumbRef} className="archive-scrollbar-thumb" />
      </div>
    </section>
  );
}
