import Image from "next/image";
import Link from "next/link";
import type { ProjectSummary } from "@/lib/placeholder-data";

type Props = {
  projects: ProjectSummary[];
};

export default function ProjectsPreview({ projects }: Props) {
  return (
    <section className="bg-neutral-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-semibold tracking-tight">
            Selected Projects
          </h2>
          <Link
            href="/projects"
            className="text-sm font-medium text-neutral-600 underline underline-offset-4 hover:text-neutral-900"
          >
            View all
          </Link>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                <h3 className="mt-4 text-lg font-medium">{project.title}</h3>
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
      </div>
    </section>
  );
}
