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

  const visible = active === "All"
    ? projects
    : projects.filter((p) => p.category === active);

  const visibleIds = new Set(visible.map((p) => p._id));

  return (
    <div className="flex flex-col md:flex-row md:gap-16 lg:gap-20">
      {/* Filter index */}
      <nav
        className="flex flex-row md:flex-col gap-x-6 gap-y-0 md:gap-y-3 mb-10 md:mb-0 md:w-44 md:shrink-0 flex-wrap"
        aria-label="Filter projects by category"
      >
        {FILTERS.map((label) => {
          const isActive = active === label;
          return (
            <button
              key={label}
              onClick={() => handleFilter(label)}
              className={`
                project-filter-item
                text-left text-[11px] tracking-[0.12em] uppercase py-1
                transition-opacity duration-200
                ${isActive
                  ? "text-foreground"
                  : "text-muted-foreground/50 hover:text-muted-foreground/80"
                }
              `}
              aria-current={isActive ? "true" : undefined}
            >
              <span className="relative inline-flex items-center gap-2">
                <span
                  className={`
                    inline-block w-[3px] h-[3px] rounded-full bg-foreground
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

      {/* Project grid — all cards stay mounted, filtered cards fade via opacity */}
      <div className="flex-1 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
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
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary mb-5 shadow-sm project-card-image-wrap">
                  <Image
                    src={project.thumbnailSrc}
                    alt={project.thumbnailAlt}
                    fill
                    className="object-cover project-card-img"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
                  {project.category}
                </p>
                <h2 className="text-[11px] md:text-xs uppercase tracking-[0.15em] text-foreground font-normal leading-[1.6] mb-3 project-card-title">
                  {project.title}
                </h2>
                <p className="text-xs text-muted-foreground leading-[1.6] line-clamp-2">
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
