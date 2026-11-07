import type { Metadata, ResolvingMetadata } from "next";
import { fullTitle } from "@/lib/page-title";
import { shareCard } from "@/lib/share-metadata";
import ProjectsIndex from "@/components/projects/ProjectsIndex";
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

/** All projects. Each category has its own cached page (category/[category]). */
export default function ProjectsPage() {
  return <ProjectsIndex />;
}
