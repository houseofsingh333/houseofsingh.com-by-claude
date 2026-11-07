/** The localStorage key for the visitor's last view on the Projects page. */
export const VIEW_STORAGE_KEY = "hos_projects_view";

export type MonographView = "one" | "glance";

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
  nextPrefix: string;
  pause: string;
  play: string;
  previousProject: string;
  nextProject: string;
  goTo: string;
  upcoming: string;
};
