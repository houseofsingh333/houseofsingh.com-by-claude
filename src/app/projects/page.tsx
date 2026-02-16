import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { fallbackProjects as projects } from "@/lib/placeholder-data";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
      <p className="mt-4 text-neutral-600">
        A filterable grid of our work. Category filtering will be added once
        Sanity is wired.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project._id}
            href={`/projects/${project.slug}`}
            className="group"
          >
            <article>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-200">
                <Image
                  src={project.thumbnailSrc}
                  alt={project.thumbnailAlt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <h2 className="mt-4 text-lg font-medium">{project.title}</h2>
              <p className="mt-1 text-sm text-neutral-500">
                {project.category}
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                {project.excerpt}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
