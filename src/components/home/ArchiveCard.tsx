import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import type { HomepageProject } from "@/lib/types";

/**
 * One project in the home page archive strip. The card in focus (nearest
 * the centre, or hovered or keyboard focused) loses its grain, brightens and
 * underlines its title.
 */
export default function ArchiveCard({
  project,
  isFocused,
  prefersReducedMotion,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}: {
  project: HomepageProject;
  isFocused: boolean;
  prefersReducedMotion: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      data-archive-card
      className="archive-card group flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
      style={{ scrollSnapAlign: "start" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {/* Image — 3:4 portrait ratio, capped so heading + image + text fit in viewport */}
      <div className="relative aspect-[3/4] max-h-[60vh] overflow-hidden mb-4 md:mb-5">
        {/* Grain overlay */}
        <div
          className={`archive-grain absolute inset-0 z-10 pointer-events-none transition-opacity duration-(--dur-hover) ease-(--ease-soft-out) ${
            isFocused ? "opacity-0" : "opacity-100"
          }`}
        />

        <div
          className={`archive-img-wrap w-full h-full ${prefersReducedMotion ? "archive-img-reduced" : ""}`}
          style={
            prefersReducedMotion
              ? undefined
              : {
                  filter: isFocused
                    ? "brightness(1)"
                    : "brightness(0.95)",
                  transition: "filter var(--dur-image) var(--ease-soft-out)",
                }
          }
        >
          <SanityImage
            image={project.thumbnail}
            context="thumbnail"
            alt={project.thumbnailAlt}
            fill
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Category */}
      <p
        // Was opacity 0.35 / 0.7 on --muted-foreground, which blended toward the
        // background and failed WCAG AA. The focus shift is now a colour change
        // at full opacity: both states pass, and focus still visibly lifts it.
        className="text-[10px] tracking-[0.2em] uppercase mb-2 transition-colors duration-(--dur-hover) ease-(--ease-soft-out)"
        style={{
          color: isFocused
            ? "var(--foreground)"
            : "var(--muted-foreground)",
        }}
      >
        {project.category}
      </p>

      {/* Title */}
      <h3 className="archive-card-title font-editorial text-lg md:text-xl font-light text-foreground leading-snug">
        <span className="archive-title-text relative inline">
          {project.title}
          <span
            className="absolute left-0 right-0 bottom-[-3px] h-px bg-foreground/30 origin-left transition-transform duration-(--dur-hover) ease-(--ease-soft-out)"
            style={{
              transform: isFocused ? "scaleX(1)" : "scaleX(0)",
            }}
          />
        </span>
      </h3>
    </Link>
  );
}
