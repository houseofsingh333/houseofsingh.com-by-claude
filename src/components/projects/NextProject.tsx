import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { hasImageAsset } from "@/lib/sanityImage";
import { hotspotPosition } from "@/lib/projectHero";
import type { ProjectLink } from "@/lib/types";
import { PAGE_COLUMN } from "./story";

/**
 * The quiet close of a project page: a hairline, a small "Next project"
 * label, the next project's photograph (its thumbnail, else its cover; a
 * canvas frame when it has neither) and its title. The order is the projects
 * page's, wrapping from the last project to the first.
 */
export default function NextProject({ project }: { project: ProjectLink }) {
  const image = hasImageAsset(project.thumbnail)
    ? project.thumbnail
    : hasImageAsset(project.coverImage)
      ? project.coverImage
      : null;
  return (
    <nav aria-label="Next project" className={`${PAGE_COLUMN} pt-(--section-space-lg)`}>
      <div className="h-px w-full bg-border mb-10 md:mb-12" />
      <Link
        href={`/projects/${project.slug}`}
        className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-end"
      >
        <div className="relative md:col-span-6 aspect-[3/2] overflow-hidden bg-secondary">
          {image && (
            <SanityImage
              image={image}
              context="body"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover motion-safe:transition-transform motion-safe:duration-(--dur-image) motion-safe:ease-(--ease-slow) motion-safe:group-hover:scale-[1.02] motion-safe:group-focus-visible:scale-[1.02]"
              objectPosition={hotspotPosition(image)}
            />
          )}
        </div>
        <div className="md:col-span-6 md:pb-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Next project
          </p>
          <p className="font-editorial text-[28px] md:text-[40px] font-light leading-[1.15] text-foreground text-balance transition-colors duration-(--dur-hover) ease-(--ease-soft-out) group-hover:text-muted-foreground group-focus-visible:text-muted-foreground">
            {project.title}
          </p>
        </div>
      </Link>
    </nav>
  );
}
