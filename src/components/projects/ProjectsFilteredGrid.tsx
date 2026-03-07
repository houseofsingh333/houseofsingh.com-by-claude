"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";
import ProjectsFiltersHorizontal from "./ProjectsFiltersHorizontal";
import type { ProjectSummary } from "@/lib/placeholder-data";

const DEFAULT_CATEGORIES = [
  "Visual Identity",
  "Editorial Storytelling",
  "Art Direction",
  "Photography",
];

/** Lowercase slug-like form for matching: "Visual Identity" → "visual-identity" */
function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-");
}

type Props = {
  projects: ProjectSummary[];
  initialFilter?: string;
};

export default function ProjectsFilteredGrid({
  projects,
  initialFilter,
}: Props) {
  // Derive unique categories from project data, fall back to defaults
  const categories = useMemo(() => {
    const fromData = Array.from(
      new Set(projects.map((p) => p.category).filter(Boolean)),
    );
    return fromData.length > 0 ? fromData : DEFAULT_CATEGORIES;
  }, [projects]);

  // Resolve initialFilter (slug from URL) → matching category name
  const [active, setActive] = useState(() => {
    if (!initialFilter) return "All";
    const param = initialFilter.toLowerCase();
    const match = categories.find(
      (cat) => cat.toLowerCase() === param || slugify(cat) === param,
    );
    return match ?? "All";
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const filterRowRef = useRef<HTMLDivElement>(null);
  const [fadingOut, setFadingOut] = useState(false);

  const handleFilter = useCallback((category: string) => {
    if (category === active) return;

    // Step 1: fade out current cards
    setFadingOut(true);

    // Step 2: after fade-out, swap filter, scroll to grid, fade in
    setTimeout(() => {
      setActive(category);

      // Keep URL in sync so filter state is shareable and survives refresh
      const url = new URL(window.location.href);
      if (category === "All") {
        url.searchParams.delete("filter");
      } else {
        url.searchParams.set("filter", slugify(category));
      }
      window.history.replaceState({}, "", url.toString());

      // Scroll so the filter row sits at the top of the viewport,
      // just below any fixed header.
      if (filterRowRef.current) {
        const headerOffset = 80; // accounts for fixed header height
        const top =
          filterRowRef.current.getBoundingClientRect().top +
          window.scrollY -
          headerOffset;
        window.scrollTo({ top, behavior: "smooth" });
      }

      // Allow a frame for DOM update, then fade in
      requestAnimationFrame(() => {
        setFadingOut(false);
      });
    }, 200);
  }, [active]);

  const filteredProjects = useMemo(() => {
    if (active === "All") return projects;
    return projects.filter((p) => p.category === active);
  }, [active, projects]);

  const hasInitialFilter = !!initialFilter;

  return (
    <div>
      {/* ——— Horizontal filter rail ——— */}
      <div ref={filterRowRef} className="mb-10 md:mb-14">
        <ProjectsFiltersHorizontal
          categories={categories}
          active={active}
          onFilter={handleFilter}
        />
      </div>

      {/* ——— Project grid ——— */}
      <div
        ref={gridRef}
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14 md:gap-y-16 lg:gap-y-20${hasInitialFilter ? " projects-grid-reveal" : ""}${fadingOut ? " projects-grid-fade-out" : ""}`}
      >
        {filteredProjects.map((project, index) => (
          <ScrollReveal
            key={project._id}
            as="article"
            offset={14}
            duration={0.8}
            delay={(index % 3) * 0.1}
            threshold={0.1}
            className={`
              transition-[opacity,transform,visibility] duration-300
              ${!fadingOut ? "projects-card-fade-in" : ""}
            `}
            style={!fadingOut ? { animationDelay: `${index * 50}ms` } as React.CSSProperties : undefined}
          >
            <Link
              href={`/projects/${project.slug}`}
              className="project-card group block"
            >
              {/* Cover image — 4:5 portrait ratio */}
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary mb-5">
                <Image
                  src={project.thumbnailSrc}
                  alt={project.thumbnailAlt}
                  fill
                  className="object-cover project-card-img"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              </div>

              {/* Card text */}
              <p className="text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground/50 mb-1.5">
                {project.category}
              </p>
              <h2 className="text-[11.5px] md:text-xs uppercase tracking-[0.14em] text-foreground font-normal leading-[1.6] mb-2 project-card-title">
                {project.title}
              </h2>
              {project.excerpt && (
                <p className="text-[11px] text-muted-foreground/60 leading-[1.65] line-clamp-2">
                  {project.excerpt}
                </p>
              )}
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
