import type { SiteCopy } from "@/lib/siteCopy";
import Link from "@/components/Link";
import SanityImage from "@/components/SanityImage";
import { hasImageAsset } from "@/lib/sanityImage";
import { hotspotPosition } from "@/lib/projectHero";
import ChapterMark from "@/components/ChapterMark";
import TextLink from "@/components/TextLink";
import type { HomepageProject } from "@/lib/types";
import ScrollProgress from "../ScrollProgress";

/** Chapter III shows exactly three projects (Site Settings, Homepage projects). */
const ROOMS = 3;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Chapter III, the exhibition: three projects (Site Settings, Homepage
 * projects; else the first three in homepage order) as rooms. The chapter
 * mark, "III The work", appears once as the chapter opens; each room
 * carries only its counter, "01 / 03", in the label token. On desktop with motion allowed each room pins for about one screen
 * of scrolling: the framed print on the canvas wall grows to fill the
 * screen while its wall label gives way to a small canvas plate with
 * "Enter the project", then the next room. One progress value per room
 * (--p, 0 to 1) drives it: CSS scroll driven animation where supported,
 * ScrollProgress elsewhere; transforms and opacity only (see
 * "Exhibition" in styles/home.css).
 *
 * Phones, tablets and reduced motion get the framed prints with their
 * labels in sequence, unpinned. The wall label's title is always a link.
 */
export default function Exhibition({ projects, copy }: { projects: HomepageProject[]; copy: SiteCopy }) {
  const rooms = projects.slice(0, ROOMS);
  const n = rooms.length;
  return (
    <section aria-labelledby="chapter-work" className="exhibition" style={{ "--n": n } as React.CSSProperties}>
      <ScrollProgress
        selector=".exhibition-room"
        media="(min-width: 1024px) and (prefers-reduced-motion: no-preference)"
      />
      {rooms.map((project, i) => {
        const image = hasImageAsset(project.coverImage) ? project.coverImage : project.thumbnail;
        const href = `/projects/${project.slug}`;
        const meta = [project.category?.trim(), project.year ? String(project.year) : null].filter(Boolean).join(", ");
        const count = `${pad(i + 1)} / ${pad(n)}`;
        return (
          <div
            key={project._id}
            className="exhibition-room"
            data-side={i % 2 ? "left" : "right"}
            style={{ "--i": i } as React.CSSProperties}
          >
            <div className="exhibition-stage">
              {i === 0 && (
                <div className="exhibition-head px-6 md:px-16">
                  <ChapterMark numeral="III" label={copy.workHeading} headingId="chapter-work" />
                </div>
              )}

              {/* One skip link, at the start of the exhibition: a keyboard
                  user meets it once, not in every room (audit P3). */}
              {i === 0 && (
                <a href="#journal-strip-title" className="exhibition-skip">
                  {copy.workSkipLink}
                </a>
              )}

              <div className="exhibition-print">
                <div className="exhibition-photo">
                  {image && (
                    <SanityImage
                      image={image}
                      context="hero"
                      alt={project.thumbnailAlt || project.title}
                      fill
                      sizes="100vw"
                      className="object-cover"
                      objectPosition={typeof image === "object" ? hotspotPosition(image) : undefined}
                    />
                  )}
                </div>
                <span className="exhibition-wall exhibition-wall-l" aria-hidden="true" />
                <span className="exhibition-wall exhibition-wall-r" aria-hidden="true" />
                <span className="exhibition-wall exhibition-wall-t" aria-hidden="true" />
                <span className="exhibition-wall exhibition-wall-b" aria-hidden="true" />
                <span className="exhibition-frame" aria-hidden="true" />
              </div>

              <div className="exhibition-label">
                <span className="exhibition-count type-label text-muted-foreground">{count}</span>
                <h3 className="font-editorial font-normal text-display-s leading-[1.2] text-foreground">
                  <Link href={href} className="hairline">
                    {project.title}
                  </Link>
                </h3>
                {meta && <p className="type-label text-muted-foreground">{meta}</p>}
                {project.excerpt && (
                  <p className="mt-2 text-small leading-[1.6] text-foreground">{project.excerpt}</p>
                )}
                <TextLink href={href} className="exhibition-label-enter mt-2">
                  {copy.workEnterLink}
                </TextLink>
              </div>

              <div className="exhibition-plate" aria-hidden="true">
                <span className="type-label text-muted-foreground">{count}</span>
                <p className="font-editorial text-display-l leading-[1.05] text-foreground">{project.title}</p>
                {project.excerpt && <p className="text-small leading-[1.6] text-foreground">{project.excerpt}</p>}
                <TextLink href={href} tabIndex={-1} className="self-start">
                  {copy.workEnterLink}
                </TextLink>
              </div>

              <div className="exhibition-bar px-6 md:px-16" aria-hidden="true">
                <span className="type-label whitespace-nowrap text-muted-foreground">{count}</span>
                <span className="exhibition-line"><span className="exhibition-line-fill" /></span>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
