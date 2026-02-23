import type { Metadata } from "next";
import { sanityFetch } from "@/sanity/fetch";
import { projectsListQuery } from "@/sanity/queries";
import { fallbackProjects } from "@/lib/placeholder-data";
import type { ProjectSummary, SanityImage } from "@/lib/placeholder-data";
import ProjectsFilteredGrid from "@/components/projects/ProjectsFilteredGrid";

export const metadata: Metadata = {
  title: "Projects",
};

type SanityProject = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  thumbnail: SanityImage | null;
  thumbnailAlt: string;
  excerpt: string;
};

export default async function ProjectsPage() {
  const data = await sanityFetch<SanityProject[] | null>({
    query: projectsListQuery,
  });

  const projects: ProjectSummary[] =
    data && data.length > 0
      ? data.map((p) => ({
          _id: p._id,
          title: p.title,
          slug: p.slug,
          category: p.category ?? "",
          thumbnailSrc:
            typeof p.thumbnail === "string"
              ? p.thumbnail
              : p.thumbnail?.url ?? "/images/project-placeholder-1.svg",
          thumbnailAlt: p.thumbnailAlt,
          excerpt: p.excerpt ?? "",
        }))
      : fallbackProjects;

  return (
    <div className="overflow-hidden">
      <section className="mx-auto max-w-7xl px-6 md:px-16 page-top-offset pb-20">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
          Portfolio
        </p>
        <div className="w-full h-px bg-border mb-8 md:mb-10" />
        <h1 className="font-editorial text-3xl md:text-5xl lg:text-6xl font-light text-foreground leading-none">
          Projects
        </h1>
      </section>

      <section className="mx-auto max-w-7xl px-6 md:px-16 pb-24 md:pb-36">
        <ProjectsFilteredGrid projects={projects} />
      </section>
    </div>
  );
}
