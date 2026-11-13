import type { Metadata, ResolvingMetadata } from "next";
import { fullTitle } from "@/lib/page-title";
import { shareCard } from "@/lib/share-metadata";
import ProjectsMonograph from "@/components/projects/monograph/ProjectsMonograph";
import { loadMonographProjects } from "@/lib/projectsData";
import { PROJECTS_DESCRIPTION, PROJECTS_TITLE } from "@/lib/pageDescriptions";
// This area's own styles, loaded with its pages alone (globals.css).
import "@/app/styles/projects.css";

/*
 * The Projects page opened on one project, One by one. Visitors reach it as
 * /projects?p=<slug> (next.config.ts rewrites that address here, so the
 * address bar keeps it): a cached page per project, so a shared link opens
 * on that plate from the first paint. Its canonical is /projects.
 */

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return (await loadMonographProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: PROJECTS_TITLE,
    description: PROJECTS_DESCRIPTION,
    alternates: { canonical: "/projects" },
    ...(await shareCard(parent, fullTitle(PROJECTS_TITLE), PROJECTS_DESCRIPTION)),
  };
}

export default async function ProjectsAtProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const known = (await loadMonographProjects()).some((p) => p.slug === slug);
  // An unknown project opens the page as usual rather than a dead end.
  return <ProjectsMonograph initialSlug={known ? slug : undefined} />;
}
