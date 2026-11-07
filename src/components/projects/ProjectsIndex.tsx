import { sanityFetch } from "@/sanity/fetch";
import { projectsListQuery } from "@/sanity/queries";
import { fallbackProjects } from "@/lib/placeholder-data";
import { devPlaceholder } from "@/lib/placeholders";
import type { ProjectSummary, SanityImage } from "@/lib/types";
import ProjectsFilteredGrid from "./ProjectsFilteredGrid";

type SanityProject = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  thumbnail: SanityImage | null;
  thumbnailAlt: string;
  excerpt: string;
  isUpcoming?: boolean;
};

/** Every project, as the projects page lists them. */
export async function loadProjects(): Promise<ProjectSummary[]> {
  const data = await sanityFetch<SanityProject[] | null>({
    query: projectsListQuery,
  });

  return data && data.length > 0
      ? data.map((p) => ({
          _id: p._id,
          title: p.title,
          slug: p.slug,
          category: p.category ?? "",
          thumbnailSrc:
            typeof p.thumbnail === "string"
              ? p.thumbnail
              : (p.thumbnail?.url ??
                // Placeholder art only in local development; otherwise the
                // card shows its calm empty frame.
                devPlaceholder("/images/project-placeholder-1.svg", "")),
          thumbnailAlt: p.thumbnailAlt,
          thumbnailLqip:
            typeof p.thumbnail === "object" ? p.thumbnail?.lqip : null,
          excerpt: p.excerpt ?? "",
          isUpcoming: p.isUpcoming ?? false,
        }))
      : devPlaceholder(fallbackProjects, []);
}

/**
 * The projects page: header, filter rail and grid. Shared by /projects (all
 * projects) and /projects/category/<slug> (one category), so each view is a
 * cached page of its own rather than one page rendered on every visit.
 */
export default async function ProjectsIndex({ initialFilter }: { initialFilter?: string }) {
  const projects = await loadProjects();
  return (
    <div className="overflow-hidden">
      <section className="mx-auto max-w-7xl px-6 md:px-16 page-top-offset page-top-offset-tight pb-20">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
          Portfolio
        </p>
        <div className="w-full h-px bg-border mb-8 md:mb-10" />
        <h1 className="font-editorial text-3xl md:text-5xl lg:text-6xl font-light text-foreground leading-none">
          Projects
        </h1>
      </section>

      {/* Filter rail + grid — same max-width and padding as header */}
      <section className="mx-auto max-w-7xl px-6 md:px-16 section-pb-lg">
        <ProjectsFilteredGrid
          projects={projects}
          initialFilter={initialFilter}
        />
      </section>
    </div>
  );
}
