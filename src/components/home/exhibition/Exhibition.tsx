import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { hasImageAsset } from "@/lib/sanityImage";
import { hotspotPosition } from "@/lib/projectHero";
import { roman } from "@/lib/roman";
import type { HomepageProject } from "@/lib/types";
import ExhibitionProgress from "./ExhibitionProgress";

const ROOMS = 4;

/**
 * Chapter III, the exhibition: the homepage projects (in homepageOrder) as
 * rooms. On desktop with motion allowed each room pins for about one screen
 * of scrolling: the framed print on the canvas wall grows to fill the
 * screen while its wall label gives way to a small canvas plate with
 * "Enter the project", then the next room. One progress value per room
 * (--p, 0 to 1) drives it: CSS scroll driven animation where supported,
 * ExhibitionProgress elsewhere; transforms and opacity only (see
 * "Exhibition" in styles/home.css).
 *
 * Phones, tablets and reduced motion get the framed prints with their
 * labels in sequence, unpinned. The wall label's title is always a link.
 */
export default function Exhibition({ projects }: { projects: HomepageProject[] }) {
  const rooms = projects.slice(0, ROOMS);
  const n = rooms.length;
  return (
    <section aria-labelledby="chapter-work" className="exhibition" style={{ "--n": n } as React.CSSProperties}>
      <ExhibitionProgress />
      {rooms.map((project, i) => {
        const image = hasImageAsset(project.coverImage) ? project.coverImage : project.thumbnail;
        const href = `/projects/${project.slug}`;
        const meta = [project.category?.trim(), project.year ? String(project.year) : null].filter(Boolean).join(", ");
        const count = `${roman(i + 1)} / ${roman(n)}`;
        return (
          <div
            key={project._id}
            className="exhibition-room"
            data-side={i % 2 ? "left" : "right"}
            style={{ "--i": i } as React.CSSProperties}
          >
            <div className="exhibition-stage">
              <div className="exhibition-head px-6 md:px-16" aria-hidden={i > 0 ? true : undefined}>
                <span className="font-editorial italic text-[30px] leading-none text-accent">III</span>
                <h2 id={i === 0 ? "chapter-work" : undefined} className="font-editorial font-normal text-[30px] md:text-[36px] leading-[1.1] text-foreground">
                  The work
                </h2>
              </div>

              <a href="#journal-strip-title" className="exhibition-skip">
                Skip to journal
              </a>

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
                <h3 className="font-editorial font-normal text-[24px] leading-[1.2] text-foreground">
                  <Link href={href} className="hover:text-muted-foreground transition-colors duration-(--dur-hover) ease-(--ease-soft-out)">
                    {project.title}
                  </Link>
                </h3>
                {meta && <p className="text-[13px] text-muted-foreground">{meta}</p>}
                {project.excerpt && (
                  <p className="mt-2 text-[14px] leading-[1.6] text-foreground">{project.excerpt}</p>
                )}
                <Link href={href} className="exhibition-label-enter mt-3 self-start text-[12px] tracking-[0.12em] uppercase text-foreground border-b border-foreground pb-1">
                  Enter the project
                </Link>
              </div>

              <div className="exhibition-plate" aria-hidden="true">
                <span className="text-[12px] tracking-[0.12em] uppercase text-muted-foreground">{count}</span>
                <p className="font-editorial text-[44px] leading-[1.05] text-foreground">{project.title}</p>
                {project.excerpt && <p className="text-[15px] leading-[1.6] text-foreground">{project.excerpt}</p>}
                <Link href={href} tabIndex={-1} className="self-start mt-1.5 text-[12px] tracking-[0.12em] uppercase text-foreground border-b border-foreground pb-1">
                  Enter the project
                </Link>
              </div>

              <div className="exhibition-bar px-6 md:px-16" aria-hidden="true">
                <span className="font-editorial text-[18px] whitespace-nowrap text-foreground">
                  {roman(i + 1)} <span className="text-muted-foreground">/ {roman(n)}</span>
                </span>
                <span className="exhibition-line"><span className="exhibition-line-fill" /></span>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
