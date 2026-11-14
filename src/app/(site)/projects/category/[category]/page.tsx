import type { Metadata, ResolvingMetadata } from "next";
import { permanentRedirect } from "next/navigation";
import { fullTitle } from "@/lib/page-title";
import { shareCard } from "@/lib/share-metadata";
import ProjectsMonograph from "@/components/projects/monograph/ProjectsMonograph";
import NotFoundResponse from "@/components/NotFoundResponse";
import { categoriesOf, loadMonographProjects } from "@/lib/projectsData";
import { categorySlug, legacyCategorySlug } from "@/lib/projectCategories";
import { PROJECTS_DESCRIPTION, PROJECTS_SEARCH_TITLE } from "@/lib/pageDescriptions";
// This area's own styles, loaded with its pages alone (globals.css).
import "@/app/styles/projects.css";

/*
 * One category of projects at its own cached address: the Projects page At
 * a glance, filtered to that category. Categories are split, so a project
 * filed under "Photography, Collaborations" appears in both. The canonical
 * stays /projects.
 */

type Params = { category: string };

export async function generateStaticParams(): Promise<Params[]> {
  return categoriesOf(await loadMonographProjects()).map((c) => ({ category: c.slug }));
}

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: PROJECTS_SEARCH_TITLE,
    description: PROJECTS_DESCRIPTION,
    alternates: { canonical: "/projects" },
    ...(await shareCard(parent, fullTitle(PROJECTS_SEARCH_TITLE), PROJECTS_DESCRIPTION, "/projects")),
  };
}

export default async function ProjectCategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  const wanted = decodeURIComponent(category).toLowerCase();
  const projects = await loadMonographProjects();
  const match = categoriesOf(projects).find((c) => c.slug === wanted);
  if (match) return <ProjectsMonograph initialCategory={match.slug} />;
  // Older addresses: a category's old form (?filter=, spaces as hyphens) goes
  // on to the new one; a combined category ("photography-collaborations")
  // to all work, since categories are now split (in any of its old forms).
  const single = categoriesOf(projects).find(
    (c) => legacyCategorySlug(c.label) === wanted || c.label.toLowerCase() === wanted,
  );
  if (single) permanentRedirect(`/projects/category/${single.slug}`);
  const combined = projects.some((p) => {
    if (p.categories.length < 2) return false;
    const whole = p.categories.join(", ");
    return [categorySlug(whole), legacyCategorySlug(whole), whole.toLowerCase()].includes(wanted);
  });
  if (combined) permanentRedirect("/projects");
  return <NotFoundResponse />;
}
