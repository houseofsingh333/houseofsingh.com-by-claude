import type { Metadata, ResolvingMetadata } from "next";
import { pagePhoto } from "@/lib/pagePhotos";
import { fullTitle } from "@/lib/page-title";
import { shareCard, withSharePhoto } from "@/lib/share-metadata";
import ProjectsMonograph from "@/components/projects/monograph/ProjectsMonograph";
import { PROJECTS_DESCRIPTION, PROJECTS_TITLE } from "@/lib/pageDescriptions";
import JsonLd from "@/components/JsonLd";
import { loadMonographProjects } from "@/lib/projectsData";
import { buildProjectsJsonLd } from "@/lib/structured-data";

const TITLE = PROJECTS_TITLE;
const DESCRIPTION = PROJECTS_DESCRIPTION;

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical: "/projects",
    },
    ...withSharePhoto(await shareCard(parent, fullTitle(TITLE), DESCRIPTION), await pagePhoto("projects"), TITLE),
  };
}

/**
 * The Projects page, the monograph. A cached page: each project's address
 * (/projects?p=slug) is served by view/[slug], each category by
 * category/[category], both cached too.
 */
export default async function ProjectsPage() {
  // The same list the page shows, in the same order (shared, cached fetch).
  const projects = await loadMonographProjects();
  return (
    <>
      <JsonLd data={buildProjectsJsonLd(projects, { title: TITLE, description: DESCRIPTION })} />
      <ProjectsMonograph />
    </>
  );
}
