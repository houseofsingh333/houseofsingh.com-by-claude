"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { categoryHref } from "@/lib/projectCategories";
import type { MonographCategory, MonographProject } from "@/lib/projectsData";
import { durationMs } from "./motion";
import OneByOne from "./OneByOne";
import AtAGlance from "./AtAGlance";
import FilterVeil from "./FilterVeil";
import { VIEW_STORAGE_KEY, type MonographView, type ProjectsCopy } from "./types";

type Props = {
  projects: MonographProject[];
  categories: MonographCategory[];
  copy: ProjectsCopy;
  /** The project One by one opens on. */
  startIndex: number;
  /** A category slug to filter At a glance by (category addresses). */
  initialFilter: string | null;
  /** The view this address opens in, whatever the visitor last chose. */
  forcedView: MonographView | null;
};

const noop = () => () => {};

/** The view the visitor last chose, from localStorage (null if none or unreadable). */
function readStoredView(): MonographView | null {
  try {
    const v = localStorage.getItem(VIEW_STORAGE_KEY);
    return v === "glance" || v === "one" ? v : null;
  } catch {
    return null;
  }
}

function storeView(view: MonographView) {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, view);
  } catch {
    // Storage unavailable (private mode, blocked): the choice lasts this visit.
  }
  document.documentElement.setAttribute("data-projects-view", view);
}

/** How long the arrival choreography may run before it is switched off. */
const ARRIVAL_MS = 3200;

/**
 * The Projects page in the browser. Both views are always in the page;
 * the one in use shows (see "Monograph" in styles/projects.css). Before
 * this hydrates, a script has put the remembered view on <html>, so the
 * page paints in the right view; after, this component owns it.
 */
export default function Monograph({ projects, categories, copy, startIndex, initialFilter, forcedView }: Props) {
  const reduced = usePrefersReducedMotion();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const stored = useSyncExternalStore(noop, readStoredView, () => null);
  const [chosen, setChosen] = useState<MonographView | null>(null);
  const view: MonographView = chosen ?? forcedView ?? stored ?? "one";

  const [index, setIndex] = useState(startIndex);
  const [filter, setFilter] = useState<string | null>(initialFilter);
  const [filterOpen, setFilterOpen] = useState(false);
  const [arriving, setArriving] = useState(true);
  const [fading, setFading] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // The arrival plays once, for the view shown on load.
  useEffect(() => {
    const t = window.setTimeout(() => setArriving(false), ARRIVAL_MS);
    return () => window.clearTimeout(t);
  }, []);

  /** Show one address for what is on screen, without loading a page. */
  const showAddress = useCallback((href: string) => {
    window.history.replaceState(window.history.state, "", href);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      setArriving(false);
      setIndex(i);
      showAddress(`/projects?p=${projects[i].slug}`);
    },
    [projects, showAddress],
  );

  /** Switch views: the old one fades out, the new one fades in (--dur-page). */
  const switchView = useCallback(
    (next: MonographView, openAt?: number) => {
      setArriving(false);
      setFilterOpen(false);
      const apply = () => {
        setChosen(next);
        storeView(next);
        if (openAt !== undefined) setIndex(openAt);
        const i = openAt ?? index;
        showAddress(next === "one" ? `/projects?p=${projects[i].slug}` : categoryHref(filterLabel(categories, filter)));
        setFading(false);
        if (openAt !== undefined) rootRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
      };
      if (next === view && openAt === undefined) return;
      if (reduced) return apply();
      setFading(true);
      const half = durationMs("--dur-page", 600) / 2;
      window.setTimeout(apply, half);
    },
    [categories, filter, index, projects, reduced, showAddress, view],
  );

  const chooseFilter = useCallback(
    (slug: string | null) => {
      setFilterOpen(false);
      setFilter(slug);
      showAddress(categoryHref(filterLabel(categories, slug)));
    },
    [categories, showAddress],
  );

  const current = categories.find((c) => c.slug === filter) ?? null;

  return (
    <section
      ref={rootRef}
      aria-labelledby="projects-title"
      className="mono"
      data-view={view}
      data-hydrated={hydrated ? "" : undefined}
      data-forced={forcedView ? "" : undefined}
      data-switched={chosen ? "" : undefined}
      data-arrive={arriving && !reduced ? "" : undefined}
      data-fading={fading ? "" : undefined}
    >
      <header className="mono-head">
        <h1 id="projects-title" className="mono-heading">
          {copy.heading}
        </h1>
        <div className="mono-controls">
          <button
            ref={triggerRef}
            type="button"
            className="mono-filter-trigger"
            aria-expanded={filterOpen}
            aria-controls="projects-filter"
            onClick={() => setFilterOpen((o) => !o)}
          >
            <span>{current?.label ?? copy.allWork}</span>
            <svg width="9" height="6" viewBox="0 0 9 6" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
              <path d="M.5.5l4 4 4-4" />
            </svg>
          </button>
          <FilterVeil
            open={filterOpen}
            triggerRef={triggerRef}
            categories={categories}
            current={filter}
            allWork={copy.allWork}
            onChoose={chooseFilter}
            onClose={() => setFilterOpen(false)}
          />
          <div className="mono-views" role="group" aria-label={`${copy.viewOne}, ${copy.viewGlance}`}>
            <button type="button" data-v="one" aria-pressed={view === "one"} onClick={() => switchView("one")}>
              {copy.viewOne}
            </button>
            <button type="button" data-v="glance" aria-pressed={view === "glance"} onClick={() => switchView("glance")}>
              {copy.viewGlance}
            </button>
          </div>
          <button
            type="button"
            className="mono-icon"
            aria-label={view === "one" ? copy.iconGlance : copy.iconOne}
            onClick={() => switchView(view === "one" ? "glance" : "one")}
          >
            {/* Both drawn; the stylesheet shows the one for the view on screen,
                so it is right from the first frame. */}
            <svg className="mono-icon-grid" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
              <rect x=".5" y=".5" width="6.5" height="6.5" />
              <rect x="9" y=".5" width="6.5" height="6.5" />
              <rect x=".5" y="9" width="6.5" height="6.5" />
              <rect x="9" y="9" width="6.5" height="6.5" />
            </svg>
            <svg className="mono-icon-single" width="12" height="16" viewBox="0 0 12 16" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
              <rect x=".5" y=".5" width="11" height="15" />
            </svg>
          </button>
        </div>
      </header>

      <div className="mono-one" inert={hydrated && view !== "one"}>
        <OneByOne
          projects={projects}
          index={index}
          onGo={goTo}
          copy={copy}
          active={view === "one"}
          arriving={arriving}
          reduced={reduced}
          firstIndex={startIndex}
        />
      </div>
      <div className="mono-glance" inert={hydrated && view !== "glance"}>
        <AtAGlance
          projects={projects}
          filter={filter}
          reduced={reduced}
          onOpen={(i) => switchView("one", i)}
        />
      </div>
    </section>
  );
}

/** A filter slug's label, for its address (null: all work). */
function filterLabel(categories: MonographCategory[], slug: string | null): string | null {
  return slug ? (categories.find((c) => c.slug === slug)?.label ?? null) : null;
}
