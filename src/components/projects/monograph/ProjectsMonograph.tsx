import { sanityFetch } from "@/sanity/fetch";
import { siteSettingsQuery } from "@/sanity/queries";
import { siteCopy } from "@/lib/siteCopy";
import { categoriesOf, loadMonographProjects } from "@/lib/projectsData";
import type { SiteSettings } from "@/lib/types";
import Monograph from "./Monograph";
import { VIEW_STORAGE_KEY, type ProjectsCopy } from "./types";

/*
 * The Projects page, the monograph: two views of the same work, One by one
 * and At a glance (frames V1a, G2 and FINAL). Rendered on the server with
 * every project in both views, so all project links are in the HTML; a
 * cached page for /projects, for each project's address (/projects?p=slug,
 * served by projects/view/[slug]) and for each category
 * (/projects/category/slug, which opens At a glance with that filter).
 */

/**
 * Before the page paints, the view the visitor last chose (kept in
 * localStorage) is put on <html>, so the right view shows from the first
 * frame and nothing moves when the page comes to life.
 */
const VIEW_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(VIEW_STORAGE_KEY)})==="glance"){document.documentElement.setAttribute("data-projects-view","glance")}else{document.documentElement.removeAttribute("data-projects-view")}}catch(e){}`;

export default async function ProjectsMonograph({
  initialSlug,
  initialCategory,
}: {
  /** A project's address (?p=slug): open One by one on that project. */
  initialSlug?: string;
  /** A category's address: open At a glance with that filter. */
  initialCategory?: string;
}) {
  const [projects, settings] = await Promise.all([
    loadMonographProjects(),
    sanityFetch<SiteSettings | null>({ query: siteSettingsQuery }),
  ]);
  const copy = siteCopy(settings);
  const projectsCopy: ProjectsCopy = {
    heading: copy.projectsHeading,
    viewOne: copy.projectsViewOne,
    viewGlance: copy.projectsViewGlance,
    iconOne: copy.projectsIconOne,
    iconGlance: copy.projectsIconGlance,
    allWork: copy.projectsAllWork,
    enter: copy.projectsEnter,
    previous: copy.projectsPrevious,
    next: copy.projectsNext,
    nextPrefix: copy.projectsNextPrefix,
    pause: copy.projectsPause,
    play: copy.projectsPlay,
    previousProject: copy.projectsPreviousProject,
    nextProject: copy.projectsNextProject,
    goTo: copy.projectsGoTo,
    upcoming: copy.projectsUpcoming,
  };
  const startIndex = Math.max(0, initialSlug ? projects.findIndex((p) => p.slug === initialSlug) : 0);
  const forcedView = initialCategory ? "glance" : initialSlug ? "one" : null;

  return (
    <>
      {/* A shared project link opens One by one, a category At a glance,
          whatever the visitor last chose; otherwise their choice applies. */}
      {!forcedView && <script dangerouslySetInnerHTML={{ __html: VIEW_SCRIPT }} />}
      <Monograph
        projects={projects}
        categories={categoriesOf(projects)}
        copy={projectsCopy}
        startIndex={startIndex}
        initialFilter={initialCategory ?? null}
        forcedView={forcedView}
      />
    </>
  );
}
