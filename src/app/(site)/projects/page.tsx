import type { Metadata, ResolvingMetadata } from "next";
import { fullTitle } from "@/lib/page-title";
import { shareCard } from "@/lib/share-metadata";
import ProjectsMonograph from "@/components/projects/monograph/ProjectsMonograph";
import { PROJECTS_DESCRIPTION, PROJECTS_TITLE } from "@/lib/pageDescriptions";

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
    ...(await shareCard(parent, fullTitle(TITLE), DESCRIPTION)),
  };
}

/**
 * The Projects page, the monograph. A cached page: each project's address
 * (/projects?p=slug) is served by view/[slug], each category by
 * category/[category], both cached too.
 */
export default function ProjectsPage() {
  return <ProjectsMonograph />;
}
