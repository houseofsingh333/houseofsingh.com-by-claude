"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { categoryHref } from "@/lib/projectCategories";
import type { MonographCategory, MonographProject } from "@/lib/projectsData";
import { durationMs } from "./motion";
import OneByOne from "./OneByOne";
import AtAGlance from "./AtAGlance";
import FilterVeil from "./FilterVeil";
import { RETURN_STORAGE_KEY, VIEW_STORAGE_KEY, type MonographView, type ProjectsCopy, type ReturnTrail } from "./types";

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
/** How long the brass line under a returned to project stays (it fades in CSS). */
const RETURN_MARK_MS = 4000;
/** A return trail older than this is not a return. */
const RETURN_FRESH_MS = 30 * 60 * 1000;
const DESKTOP = "(min-width: 1024px)";
/** The name the plate carries while it moves between the views. */
const SHARED = "mono-shared";

/** The trail left on the way to a project from At a glance, if this visit is the way back. */
function readReturn(): ReturnTrail | null {
  try {
    const t = JSON.parse(sessionStorage.getItem(RETURN_STORAGE_KEY) ?? "null") as ReturnTrail | null;
    if (!t || Date.now() - t.at > RETURN_FRESH_MS || t.href !== location.pathname + location.search) return null;
    return t;
  } catch {
    return null;
  }
}

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
  const [arrival, setArrival] = useState(0);
  const [sharedSlug, setSharedSlug] = useState<string | null>(null);
  const [returnSlug, setReturnSlug] = useState<string | null>(null);
  const [vt, setVt] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  /** At a glance's scroll when a photograph there opened One by one. */
  const fromGlance = useRef<number | null>(null);

  // Arriving at the internal address of a project (/projects/view/<slug>,
  // the "All projects" link on a project page): show its public address.
  useEffect(() => {
    if (location.pathname.startsWith("/projects/view/")) {
      window.history.replaceState(window.history.state, "", `/projects?p=${projects[startIndex]?.slug ?? ""}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back from a project reached from At a glance: At a glance again, where
  // the reader was, and a brass line under that project's title. The trail
  // is in sessionStorage, which the server cannot see, so it is read once
  // the page is in the browser (before it paints; the pre paint script has
  // already shown At a glance for a full page load).
  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    const trail = readReturn();
    if (!trail) return;
    try {
      sessionStorage.removeItem(RETURN_STORAGE_KEY);
    } catch {}
    setChosen("glance");
    storeView("glance");
    setFilter(trail.filter);
    setReturnSlug(trail.slug);
    setArrival((a) => a + 1);
    window.history.replaceState(window.history.state, "", categoryHref(filterLabel(categories, trail.filter)));
    document.documentElement.removeAttribute("data-projects-return");
    requestAnimationFrame(() => {
      window.scrollTo({ top: trail.scroll, behavior: "instant" });
      const card = document.querySelector<HTMLElement>(`.mono-card[data-slug="${CSS.escape(trail.slug)}"]`);
      const r = card?.getBoundingClientRect();
      if (r && (r.bottom < 0 || r.top > window.innerHeight)) card!.scrollIntoView({ block: "center", behavior: "instant" });
    });
    const t = window.setTimeout(() => setReturnSlug(null), RETURN_MARK_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Leaving for a project page: if the way here began in At a glance, leave a trail back. */
  const onLeave = useCallback(
    (slug: string) => {
      if (fromGlance.current === null) return;
      const trail: ReturnTrail = { slug, scroll: fromGlance.current, filter, href: location.pathname + location.search, at: Date.now() };
      try {
        sessionStorage.setItem(RETURN_STORAGE_KEY, JSON.stringify(trail));
      } catch {}
    },
    [filter],
  );

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

  /**
   * Switch views. Desktop: the current plate shrinks into its place in the
   * grid (or a grid photograph grows into the One by one plate) as a shared
   * element, while the rest of the page crossfades (View Transitions; the
   * grid's plates then arrive). Phone, reduced motion or no View
   * Transitions: the old view fades out, the new one fades in (--dur-page).
   */
  const switchView = useCallback(
    (next: MonographView, openAt?: number, card?: HTMLElement) => {
      setArriving(false);
      setFilterOpen(false);
      if (next === view && openAt === undefined) return;
      const i = openAt ?? index;
      const slug = projects[i].slug;
      if (next === "one") fromGlance.current = card ? window.scrollY : null;
      const apply = () => {
        setChosen(next);
        storeView(next);
        if (openAt !== undefined) setIndex(openAt);
        showAddress(next === "one" ? `/projects?p=${slug}` : categoryHref(filterLabel(categories, filter)));
        setFading(false);
        if (next === "glance") {
          setSharedSlug(slug);
          setArrival((a) => a + 1);
        }
        if (openAt !== undefined) rootRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
      };
      const plateOf = (s: string) => document.querySelector<HTMLElement>(`.mono-slide[data-slug="${CSS.escape(s)}"] .mono-plate-frame`);
      const cardOf = (s: string) => document.querySelector<HTMLElement>(`.mono-card[data-slug="${CSS.escape(s)}"] .mono-card-plate`);
      const from = next === "one" ? card?.querySelector<HTMLElement>(".mono-card-plate") : plateOf(slug);
      const canShare = !reduced && !!document.startViewTransition && window.matchMedia(DESKTOP).matches && !!from;
      if (canShare) {
        from!.style.viewTransitionName = SHARED;
        setVt(true);
        const t = document.startViewTransition(() => {
          flushSync(apply);
          from!.style.viewTransitionName = "";
          const to = next === "one" ? plateOf(slug) : cardOf(slug);
          if (to && to.offsetParent !== null) to.style.viewTransitionName = SHARED;
        });
        void t.finished.finally(() => {
          document.querySelectorAll<HTMLElement>(".mono-plate-frame, .mono-card-plate").forEach((el) => (el.style.viewTransitionName = ""));
          setVt(false);
        });
        return;
      }
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
      data-vt={vt ? "" : undefined}
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
            <button type="button" className="hairline" data-v="one" aria-pressed={view === "one"} onClick={() => switchView("one")}>
              {copy.viewOne}
            </button>
            <button type="button" className="hairline" data-v="glance" aria-pressed={view === "glance"} onClick={() => switchView("glance")}>
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
          onLeave={onLeave}
        />
      </div>
      <div className="mono-glance" inert={hydrated && view !== "glance"}>
        <AtAGlance
          projects={projects}
          filter={filter}
          reduced={reduced}
          onOpen={(i, card) => switchView("one", i, card)}
          arrival={arrival}
          sharedSlug={sharedSlug}
          returnSlug={returnSlug}
        />
      </div>
    </section>
  );
}

/** A filter slug's label, for its address (null: all work). */
function filterLabel(categories: MonographCategory[], slug: string | null): string | null {
  return slug ? (categories.find((c) => c.slug === slug)?.label ?? null) : null;
}
