/** The localStorage key for the visitor's last view on the Projects page. */
export const VIEW_STORAGE_KEY = "hos_projects_view";

export type MonographView = "one" | "glance";

/** sessionStorage: the way back to At a glance after opening a project from it. */
export const RETURN_STORAGE_KEY = "hos_projects_return";

/** Left when a project page is opened on a path that began in At a glance. */
export type ReturnTrail = {
  /** The project opened. */
  slug: string;
  /** At a glance's scroll position at the time. */
  scroll: number;
  /** The filter in use. */
  filter: string | null;
  /** The Projects address the reader left from (the way back lands there). */
  href: string;
  /** When (a trail goes stale after half an hour). */
  at: number;
};

/** The Projects page's texts, from Site Settings (Projects page tab). */
export type ProjectsCopy = {
  heading: string;
  viewOne: string;
  viewGlance: string;
  iconOne: string;
  iconGlance: string;
  allWork: string;
  enter: string;
  previous: string;
  next: string;
  pause: string;
  play: string;
  previousProject: string;
  nextProject: string;
  upcoming: string;
};
