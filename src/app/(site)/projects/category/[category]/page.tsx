import type { Metadata, ResolvingMetadata } from "next";
import { permanentRedirect } from "next/navigation";
import { fullTitle } from "@/lib/page-title";
import { shareCard } from "@/lib/share-metadata";
import ProjectsIndex, { loadProjects } from "@/components/projects/ProjectsIndex";
import NotFoundResponse from "@/components/NotFoundResponse";
import { categorySlug, legacyCategorySlug } from "@/lib/projectCategories";
import { PROJECTS_DESCRIPTION, PROJECTS_TITLE } from "@/lib/pageDescriptions";

/*
 * One category of projects, at its own cached address (built ahead for
 * every category, refreshed like the rest of the content). The page is the
 * same as /projects with that filter chosen; its canonical stays /projects,
 * as the filtered view was before.
 */

type Params = { category: string };

export async function generateStaticParams(): Promise<Params[]> {
  const projects = await loadProjects();
  const slugs = new Set(projects.map((p) => p.category).filter(Boolean).map(categorySlug));
  return [...slugs].map((category) => ({ category }));
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

export default async function ProjectCategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  const wanted = decodeURIComponent(category).toLowerCase();
  const categories = [...new Set((await loadProjects()).map((p) => p.category).filter(Boolean))];
  const match = categories.find((c) => categorySlug(c) === wanted);
  if (match) return <ProjectsIndex initialFilter={categorySlug(match)} />;
  // An old filter address (?filter=…, redirected here) goes on to the new one.
  const legacy = categories.find((c) => legacyCategorySlug(c) === wanted || c.toLowerCase() === wanted);
  if (legacy) permanentRedirect(`/projects/category/${categorySlug(legacy)}`);
  return <NotFoundResponse />;
}
