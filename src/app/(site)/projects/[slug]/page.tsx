import type { Metadata } from "next";
import { projectFallbackDescription } from "@/lib/pageDescriptions";
import { pageShareImages, routeShareImages } from "@/lib/share-metadata";
import { alt as projectShareAlt } from "@/app/projects/[slug]/opengraph-image";
import NotFoundResponse from "@/components/NotFoundResponse";
import { followRedirect } from "@/lib/redirects";
import { toIsoTimestamp } from "@/lib/dates";
import { sanityFetch } from "@/sanity/fetch";
import { devPlaceholder } from "@/lib/placeholders";
import {
  projectBySlugQuery,
  projectLinksQuery,
  projectsListQuery,
  siteSettingsQuery,
  spotlightQuery,
} from "@/sanity/queries";
import { fallbackProjects as projects } from "@/lib/placeholder-data";
import type {
  ProjectDetail,
  ProjectLink,
  SiteSettings,
  SpotlightLink,
} from "@/lib/types";
import { projectHeroImage } from "@/lib/projectHero";
import ProjectHero from "@/components/projects/ProjectHero";
import ProjectTitle from "@/components/projects/ProjectTitle";
import ProjectHead from "@/components/projects/page/ProjectHead";
import ProjectFlow from "@/components/projects/page/ProjectFlow";
import ProjectNext from "@/components/projects/page/ProjectNext";
import { PortableText } from "@portabletext/react";
import { storyProseComponents } from "@/components/proseComponents";
import { siteCopy } from "@/lib/siteCopy";
import { splitCategories } from "@/lib/projectsData";
import {
  PAGE_COLUMN,
  STORY_TEXT,
} from "@/components/projects/story";
import ReadingProgress from "@/components/ReadingProgress";
import ContentSections from "@/components/projects/ContentSections";
import ProjectInterestForm from "@/components/projects/ProjectInterestForm";
import JsonLd from "@/components/JsonLd";
import { normalizeTitle, pageTitle } from "@/lib/page-title";
import { linkStudio } from "@/components/StudioLink";
import {
  buildCreativeWorkJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/structured-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const sanityProjects = await sanityFetch<{ slug: string }[]>({
    query: projectsListQuery,
  });

  if (sanityProjects && sanityProjects.length > 0) {
    return sanityProjects.map((project) => ({ slug: project.slug }));
  }

  return devPlaceholder(projects, []).map((project) => ({ slug: project.slug }));
}


/** The homepage spotlight, which an upcoming project may use as its hero. */
function getSpotlight() {
  return sanityFetch<SpotlightLink | null>({ query: spotlightQuery });
}

// Share images: the page's hero photo from the Sanity CDN (1200x630 JPEG)
// when there is one, otherwise the generated branded card from the
// opengraph-image and twitter-image routes in src/app/projects/[slug]/. Those
// routes sit outside the (site) route group so their URLs carry no hash
// suffix, and pageShareImages links them explicitly.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [project, spotlight] = await Promise.all([
    sanityFetch<ProjectDetail>({
      query: projectBySlugQuery,
      params: { slug },
    }),
    getSpotlight(),
  ]);

  if (project) {
    const title = normalizeTitle(project.seo?.metaTitle || project.title);
    const share = pageShareImages({
      path: `/projects/${slug}`,
      cover: projectHeroImage(project, spotlight).image,
      pageTitle: title,
      cardAlt: projectShareAlt,
    });
    const description =
      project.seo?.metaDescription || project.excerpt || projectFallbackDescription(project.title);
    const canonical = project.seo?.canonicalUrl || `/projects/${slug}`;
    const noIndex = project.seo?.noIndex === true;
    const author = project.author || "Maninder Singh";

    const publishedTime = project.publishedAt
      ? toIsoTimestamp(project.publishedAt)
      : undefined;
    const modifiedTime = project.updatedAt
      ? toIsoTimestamp(project.updatedAt)
      : undefined;

    return {
      title: pageTitle(title),
      description,
      alternates: { canonical },
      ...(noIndex ? { robots: { index: false, follow: true } } : {}),
      openGraph: {
        type: "article",
        title,
        description,
        url: `/projects/${slug}`,
        images: share.openGraph,
        ...(publishedTime ? { publishedTime } : {}),
        ...(modifiedTime ? { modifiedTime } : {}),
        authors: [author],
      },
      twitter: {
        card: "summary_large_image",
        images: share.twitter,
        title,
        description,
      },
    };
  }

  const fallback = devPlaceholder(projects, []).find((p) => p.slug === slug);
  if (!fallback) return { title: "Not Found" };
  // Placeholder projects have no cover on the Sanity CDN: generated card.
  const share = routeShareImages(`/projects/${slug}`, projectShareAlt);
  return {
    title: fallback.title,
    description: fallback.excerpt || projectFallbackDescription(fallback.title),
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      type: "article",
      title: fallback.title,
      description: fallback.excerpt || projectFallbackDescription(fallback.title),
      url: `/projects/${slug}`,
        images: share.openGraph,
    },
    twitter: {
      card: "summary_large_image",
        images: share.twitter,
      title: fallback.title,
      description: fallback.excerpt || projectFallbackDescription(fallback.title),
    },
  };
}

/** The project after this one in the projects page's order, wrapping round. */
function nextProject(links: ProjectLink[] | null, slug: string): ProjectLink | null {
  if (!links || links.length < 2) return null;
  const i = links.findIndex((p) => p.slug === slug);
  return i === -1 ? null : links[(i + 1) % links.length];
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;

  const [project, settings, spotlight, links] = await Promise.all([
    sanityFetch<ProjectDetail>({
      query: projectBySlugQuery,
      params: { slug },
    }),
    sanityFetch<SiteSettings | null>({ query: siteSettingsQuery }),
    getSpotlight(),
    sanityFetch<ProjectLink[] | null>({ query: projectLinksQuery }),
  ]);

  // Sanity data available — render full project
  if (project) {
    const hero = projectHeroImage(project, spotlight);
    const creativeWorkJsonLd = buildCreativeWorkJsonLd(project, settings, hero.image);
    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Projects", path: "/projects" },
      { name: project.title, path: `/projects/${project.slug}` },
    ]);
    const next = nextProject(links, project.slug);
    const intro = project.shortIntro?.trim();
    const copy = siteCopy(settings);
    const at = links?.findIndex((l) => l.slug === project.slug) ?? -1;
    const pad = (n: number) => String(n).padStart(2, "0");
    const counter = links && at >= 0 ? `${pad(at + 1)} / ${pad(links.length)}` : null;
    const meta = [
      ...splitCategories(project.category),
      project.year ? String(project.year) : null,
      project.role?.trim() || null,
    ].filter((m): m is string => !!m);
    // The Projects page opened at this project (its plate is where the hero
    // shrinks back to). The internal address, because a link inside the site
    // does not translate ?p= (next.config.ts rewrites only full loads);
    // the page then shows /projects?p=<slug> in the address bar.
    const allProjectsHref = `/projects/view/${project.slug}`;
    const photographs = project.photographs?.filter((p) => p?.url) ?? [];

    return (
      <article className="pp section-pb-lg">
        <JsonLd data={creativeWorkJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />
        <ReadingProgress />

        {/* 1. Hero: cover, else the first photograph, else the thumbnail; upcoming: the spotlight image. */}
        <ProjectHero image={hero.image} slug={project.slug} />

        {/* 2. All projects, and the title block (like the One by one caption). */}
        <ProjectHead
          title={project.title}
          counter={counter}
          meta={meta}
          isUpcoming={project.isUpcoming}
          excerpt={project.excerpt}
          allProjectsHref={allProjectsHref}
          allProjectsLabel={copy.projectAllProjects}
        />

        {/* 3. The story: the intro, then the Photographs with the story text
            placed between them automatically, then any content sections. */}
        {intro && (
          <div className="pp-col pp-item">
            <p className={`pp-story ${STORY_TEXT}`}>{linkStudio(intro)}</p>
          </div>
        )}
        {photographs.length > 0 ? (
          <ProjectFlow title={project.title} photographs={photographs} story={project.story} />
        ) : (
          project.story && project.story.length > 0 ? (
            <div className="pp-col pp-item">
              <div className="pp-story pp-text">
                <PortableText value={project.story} components={storyProseComponents} />
              </div>
            </div>
          ) : null
        )}
        {project.contentSections && project.contentSections.length > 0 && (
          <div className="pt-(--section-space-md)">
            <ContentSections sections={project.contentSections} />
          </div>
        )}

        {/* 4. Upcoming projects: the interest form, after the story. */}
        {project.showInterestForm && (
          <ProjectInterestForm projectTitle={project.title} />
        )}

        {/* 5. Next project, wrapping from the last to the first. */}
        {next && (
          <ProjectNext
            next={next}
            label={copy.projectNextLabel}
            allProjectsHref={allProjectsHref}
            allProjectsLabel={copy.projectAllProjects}
            startLabel={copy.projectStartLabel}
          />
        )}
      </article>
    );
  }

  // Placeholder data is local development only. A Sanity failure has already
  // thrown above (ISR keeps the last good page), so reaching this point means
  // Sanity answered and the slug does not exist.
  const fallback = devPlaceholder(projects, []).find((p) => p.slug === slug);
  if (!fallback) {
    await followRedirect(`/projects/${slug}`);
    return <NotFoundResponse />;
  }

  const fallbackCreativeWorkJsonLd = buildCreativeWorkJsonLd(fallback, settings);
  const fallbackBreadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: fallback.title, path: `/projects/${fallback.slug}` },
  ]);

  return (
    <article className="section-pb-lg">
      <JsonLd data={fallbackCreativeWorkJsonLd} />
      <JsonLd data={fallbackBreadcrumbJsonLd} />
      <ProjectHero image={null} />
      <ProjectTitle title={fallback.title} category={fallback.category} />
      <div className={`${PAGE_COLUMN} pt-12`}>
        <p className="text-small text-muted-foreground">
          Full project detail with content sections will render here once Sanity
          is connected.
        </p>
      </div>
    </article>
  );
}
