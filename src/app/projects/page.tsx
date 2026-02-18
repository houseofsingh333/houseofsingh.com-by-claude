import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";
import { projectsListQuery } from "@/sanity/queries";
import { fallbackProjects } from "@/lib/placeholder-data";
import type { ProjectSummary, SanityImage } from "@/lib/placeholder-data";

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

  /* Map Sanity projects to the same shape as fallbacks */
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
          thumbnailAlt: p.thumbnailAlt ?? p.title,
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
        <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project._id}
              href={`/projects/${project.slug}`}
              className="group block"
            >
              <article>
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary mb-5 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  <Image
                    src={project.thumbnailSrc}
                    alt={project.thumbnailAlt}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-[1.03] grayscale group-hover:grayscale-0"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
                  {project.category}
                </p>
                <h2 className="text-[11px] md:text-xs uppercase tracking-[0.15em] text-foreground font-normal leading-[1.6] mb-3">
                  {project.title}
                </h2>
                <p className="text-xs text-muted-foreground leading-[1.6] line-clamp-2">
                  {project.excerpt}
                </p>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
