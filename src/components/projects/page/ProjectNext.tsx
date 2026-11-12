import { ViewTransition } from "react";
import Link from "@/components/Link";
import SanityImage from "@/components/SanityImage";
import TextLink from "@/components/TextLink";
import { hasImageAsset } from "@/lib/sanityImage";
import { hotspotPosition } from "@/lib/projectHero";
import type { ProjectLink } from "@/lib/types";

type Props = {
  next: ProjectLink;
  label: string;
  allProjectsHref: string;
  allProjectsLabel: string;
  startLabel: string;
};

/**
 * The ending of a project page (frame "Zamana, refined"): the next project
 * as a large 4:5 plate with its title in Playfair beside it; pointing at
 * either eases the photograph to 1.03 and draws the title's hairline. The
 * plate is the start of the next project's hero (the same view transition
 * name), so it grows into it. "All projects" and "Start a project" beneath.
 */
export default function ProjectNext({ next, label, allProjectsHref, allProjectsLabel, startLabel }: Props) {
  const image = hasImageAsset(next.coverImage) ? next.coverImage : hasImageAsset(next.photo) ? next.photo : hasImageAsset(next.thumbnail) ? next.thumbnail : null;
  const href = `/projects/${next.slug}`;
  return (
    <nav aria-label={label} className="pp-col pp-next">
      <ViewTransition name={`project-${next.slug}`} share="project-plate" default="none">
        <Link href={href} className="pp-next-plate" tabIndex={-1} aria-hidden="true">
          {image && typeof image !== "string" && (
            <SanityImage image={image} context="body" alt="" fill sizes="(min-width: 1024px) 480px, calc(100vw - 48px)" className="object-cover" objectPosition={hotspotPosition(image)} />
          )}
        </Link>
      </ViewTransition>
      <div className="pp-next-text">
        <span className="pp-next-label">{label}</span>
        <Link href={href} className="pp-next-title hairline">
          {next.title}
        </Link>
        {next.category && <span className="pp-next-meta">{next.category}</span>}
        <div className="pp-next-links">
          <TextLink href={allProjectsHref}>{allProjectsLabel}</TextLink>
          <TextLink href="/contact">{startLabel}</TextLink>
        </div>
      </div>
    </nav>
  );
}
