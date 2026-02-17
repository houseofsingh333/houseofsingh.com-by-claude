"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProjectCategory } from "@/lib/placeholder-data";

type Props = {
  categories: ProjectCategory[];
};

const categoryPreviews: Record<string, string> = {
  photography: "/images/project-placeholder-1.svg",
  design: "/images/project-placeholder-2.svg",
  collaborations: "/images/project-placeholder-3.svg",
};

export default function ProjectsPreview({ categories }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="px-6 md:px-16 py-20 md:py-36">
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="font-editorial text-2xl md:text-3xl font-light text-foreground">
          Projects
        </h2>
        <Link
          href="/projects"
          className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 border-b border-foreground/30 pb-0.5"
        >
          See all
        </Link>
      </div>
      <div className="w-full h-px bg-border mb-10 md:mb-14" />

      {/* Mobile: vertical card stack */}
      <div className="flex flex-col gap-4 md:hidden">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/projects?filter=${cat.slug}`}
            className="group relative block h-44 overflow-hidden bg-secondary"
          >
            <img
              src={
                categoryPreviews[cat.slug] ||
                "/images/project-placeholder-1.svg"
              }
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-20 transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <p className="text-[10px] tracking-widest text-muted-foreground/50 mb-2">
                {String(cat.order).padStart(2, "0")}
              </p>
              <p className="font-editorial text-lg font-light text-foreground tracking-wider uppercase">
                {cat.title}
              </p>
              <span className="mt-3 text-[11px] tracking-widest uppercase text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                View →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop: horizontal accordion strips */}
      <div className="hidden md:flex gap-px bg-border h-[520px] overflow-hidden">
        {categories.map((cat) => {
          const isHovered = hoveredId === cat._id;
          const hasHover = hoveredId !== null;

          return (
            <Link
              key={cat._id}
              href={`/projects?filter=${cat.slug}`}
              className="relative bg-background overflow-hidden group cursor-pointer"
              style={{
                flex: isHovered ? 4 : hasHover ? 0.5 : 1,
                transition: "flex 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)",
              }}
              onMouseEnter={() => setHoveredId(cat._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Background image */}
              <div
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: isHovered ? 0.2 : 0 }}
              >
                <img
                  src={
                    categoryPreviews[cat.slug] ||
                    "/images/project-placeholder-1.svg"
                  }
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-1000"
                  style={{
                    transform: isHovered ? "scale(1)" : "scale(1.1)",
                  }}
                />
              </div>

              {/* Collapsed — horizontal text at center */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8 transition-opacity duration-500"
                style={{ opacity: isHovered ? 0 : 1 }}
              >
                <p className="text-[10px] tracking-widest text-muted-foreground/50 mb-2">
                  {String(cat.order).padStart(2, "0")}
                </p>
                <p className="font-editorial text-base font-light text-foreground tracking-wider uppercase">
                  {cat.title}
                </p>
              </div>

              {/* Expanded — full info */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-10 transition-opacity duration-500"
                style={{ opacity: isHovered ? 1 : 0 }}
              >
                <p className="text-[10px] tracking-widest text-muted-foreground mb-3">
                  {String(cat.order).padStart(2, "0")}
                </p>
                <h3 className="font-editorial text-3xl font-light text-foreground mb-4">
                  {cat.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs tracking-widest uppercase text-muted-foreground">
                    View
                  </span>
                  <span className="text-muted-foreground text-xs transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
