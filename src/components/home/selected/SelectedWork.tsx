import ChapterMark from "@/components/ChapterMark";
import SanityImage from "@/components/SanityImage";
import TextLink from "@/components/TextLink";
import { hotspotPosition } from "@/lib/projectHero";
import type { SanityImageAsset } from "@/lib/sanityImage";
import type { SiteCopy } from "@/lib/siteCopy";

export type SelectedProject = {
  _id: string;
  title: string;
  slug: string;
  category: string | null;
  image: SanityImageAsset | null;
  line: string | null;
};

type Props = {
  project: SelectedProject;
  copy: Pick<SiteCopy, "selectedWorkLabel" | "allProjectsLink" | "viewProjectLink">;
  numeral: string;
};

/**
 * Chapter II, Selected work (approved 14 Nov; canvas "Home hero, proposal",
 * artboard "In continuation"): one project, chosen in Site Settings ("The
 * selected project"), at full width but calm: its photograph, then its
 * title and category on the left, its line and "View the project" on the
 * right. "All projects" sits on the label's line, right aligned.
 */
export default function SelectedWork({ project, copy, numeral }: Props) {
  const href = `/projects/${project.slug}`;
  return (
    <section aria-labelledby="chapter-selected" className="selected px-6 md:px-16 section-py">
      <div className="selected-head">
        <ChapterMark numeral={numeral} label={copy.selectedWorkLabel} headingId="chapter-selected" />
        <TextLink href="/projects" className="selected-all">
          {copy.allProjectsLink}
        </TextLink>
      </div>
      {project.image && (
        <div className="selected-photo">
          <SanityImage
            image={project.image}
            context="hero"
            alt={project.image.alt ?? project.title}
            fill
            sizes="(min-width: 768px) calc(100vw - 128px), calc(100vw - 48px)"
            objectPosition={hotspotPosition(project.image)}
            className="object-cover"
          />
        </div>
      )}
      <div className="selected-meta">
        <div className="selected-name">
          <h3 className="selected-title">{project.title}</h3>
          {project.category && <p className="selected-category">{project.category}</p>}
        </div>
        <div className="selected-about">
          {project.line && <p className="selected-line">{project.line}</p>}
          <TextLink href={href}>{copy.viewProjectLink}</TextLink>
        </div>
      </div>
    </section>
  );
}
