"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProjectSummary } from "@/lib/placeholder-data";

const FILTERS = [
  "All",
  "Visual Identity",
  "Editorial Storytelling",
  "Art Direction",
  "Photography",
] as const;

type FilterLabel = (typeof FILTERS)[number];

type Props = {
  projects: ProjectSummary[];
};

export default function ProjectsFilteredGrid({ projects }: Props) {
  const [active, setActive] = useState<FilterLabel>("All");

  const handleFilter = useCallback((label: FilterLabel) => {
    setActive(label);
  }, []);

  const visibleIds = new Set(
    active === "All"
      ? projects.map((p) => p._id)
      : projects.filter((p) => p.category === active).map((p) => p._id)
  );

  return (
    <div className="flex flex-col md:flex-row md:gap-12 lg:gap-14 items-start">
      {/* ——— Filter index ——— */}
      <nav
        className="
          flex flex-row flex-wrap md:flex-col
          gap-x-5 gap-y-0 md:gap-y-2
          mb-9 md:mb-0
          md:w-40 md:shrink-0
          md:sticky md:top-24
        "
        aria-label="Filter projects by category"
      >
        {FILTERS.map((label) => {
          const isActive = active === label;
          return (
            <button
              key={label}
              onClick={() => handleFilter(label)}
              className={`
                text-left text-[10.5px] tracking-[0.13em] uppercase
                py-[3px] md:py-0.5
                cursor-pointer select-none
                outline-none focus-visible:underline focus-visible:underline-offset-2
                transition-opacity duration-200
                ${isActive
                  ? "text-foreground opacity-100"
                  : "text-foreground opacity-30 hover:opacity-60"
                }
              `}
              aria-current={isActive ? "true" : undefined}
            >
              <span className="relative inline-flex items-center gap-[7px]">
                {/* Dot indicator — desktop only, left of active item */}
                <span
                  className={`
                    hidden md:inline-block
                    w-[3px] h-[3px] rounded-full bg-foreground shrink-0
                    transition-opacity duration-200
                    ${isActive ? "opacity-100" : "opacity-0"}
                  `}
                  aria-hidden="true"
                />
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ——— Project grid — all cards stay mounted; filter via opacity ——— */}
      <div className="flex-1 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const show = visibleIds.has(project._id);
          return (
            <Link
              key={project._id}
              href={`/projects/${project.slug}`}
              className={`
                project-card group block
                transition-opacity duration-300
                ${show ? "opacity-100" : "opacity-0 pointer-events-none"}
              `}
              aria-hidden={!show}
              tabIndex={show ? undefined : -1}
            >
              <article>
                {/* Image container — aspect ratio prevents CLS */}
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary mb-6 project-card-image-wrap">
                  <Image
                    src={project.thumbnailSrc}
                    alt={project.thumbnailAlt}
                    fill
                    className="object-cover project-card-img"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>

                {/* Text — tight relationship between label and title */}
                <p className="text-[9.5px] uppercase tracking-[0.16em] text-foreground/40 mb-1">
                  {project.category}
                </p>
                <h2 className="text-[11px] md:text-[11.5px] uppercase tracking-[0.14em] text-foreground font-normal leading-[1.65] mb-3 project-card-title">
                  {project.title}
                </h2>
                <p className="text-[11px] text-muted-foreground leading-[1.65] line-clamp-2">
                  {project.excerpt}
                </p>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
