/*
 * Every visitor facing text added on the chapters branch, editable in Sanity
 * Site Settings. Each entry is one optional field: its name, its title in
 * the Studio, where it sits (group and fieldset), and today's text, which
 * is shown in the Studio description and used whenever the field is empty.
 * The Studio fields are generated from this list (schemas/siteSettings.ts),
 * so the description and the default can never drift apart.
 */

export type CopyGroup = "homepage" | "menu" | "notFound" | "newsletter" | "legal" | "projects";

type CopyField = {
  name: string;
  title: string;
  group: CopyGroup;
  fieldset?: string;
  /** Today's text: shown in the Studio and used when the field is empty. */
  text: string;
  /** A longer text: a multi line box in the Studio. */
  multiline?: boolean;
};

export const SITE_COPY_FIELDS = [
  // ——— Homepage chapters ———
  { name: "heroPreviousLabel", title: "Previous slide button", group: "homepage", fieldset: "chapter1", text: "Previous slide" },
  { name: "heroNextLabel", title: "Next slide button", group: "homepage", fieldset: "chapter1", text: "Next slide" },

  { name: "artistHeading", title: "Heading (read by screen readers)", group: "homepage", fieldset: "chapter2", text: "The artist" },
  { name: "artistLink", title: "Link text", group: "homepage", fieldset: "chapter2", text: "More about Maninder" },
  { name: "artistCaption", title: "Portrait caption", group: "homepage", fieldset: "chapter2", text: "Maninder Singh, Toronto" },

  { name: "workHeading", title: "Heading", group: "homepage", fieldset: "chapter3", text: "The work" },
  { name: "workSkipLink", title: "Skip link", group: "homepage", fieldset: "chapter3", text: "Skip to journal" },
  { name: "workEnterLink", title: "Project link text", group: "homepage", fieldset: "chapter3", text: "Enter the project" },

  { name: "studioNowLabel", title: "Label", group: "homepage", fieldset: "chapter4", text: "In the studio now" },
  { name: "studioNowHint", title: "Scroll hint", group: "homepage", fieldset: "chapter4", text: "Scroll to open" },

  { name: "notebookLabel", title: "Label", group: "homepage", fieldset: "chapter5", text: "Notebook" },

  { name: "listeningLabel", title: "Label", group: "homepage", fieldset: "chapter6", text: "Listening" },
  { name: "listeningHeading", title: "Heading", group: "homepage", fieldset: "chapter6", text: "On my turntable" },
  {
    name: "listeningNote",
    title: "Playlist note (italic)",
    group: "homepage",
    fieldset: "chapter6",
    text: "This playlist showcases the music that keeps me inspired and in sync with my work.",
    multiline: true,
  },
  {
    name: "listeningIntro",
    title: "Line",
    group: "homepage",
    fieldset: "chapter6",
    text: "What plays in my studio while I work. Press play and listen along; the record turns while the music plays.",
    multiline: true,
  },
  { name: "listeningTag", title: "Sleeve tag", group: "homepage", fieldset: "chapter6", text: "From Maninder's shelf" },
  { name: "listeningPlayerLabel", title: "Player label", group: "homepage", fieldset: "chapter6", text: "Maninder's studio playlist, on Spotify" },

  { name: "practiceLabel", title: "Label", group: "homepage", fieldset: "chapter7", text: "The practice" },
  {
    name: "practiceLine",
    title: "Studio line (Playfair)",
    group: "homepage",
    fieldset: "chapter7",
    text: "A design studio specializing in brand identities, graphic design, and creative direction for SMEs.",
    multiline: true,
  },
  { name: "practiceLinkText", title: "Link text", group: "homepage", fieldset: "chapter7", text: "Visit House of Singh Studios" },
  {
    name: "practiceLeavingNote",
    title: "Leaving note",
    group: "homepage",
    fieldset: "chapter7",
    text: "You are leaving this site. Opens studios.houseofsingh.com in a new tab.",
  },
  { name: "practiceWorkLabel", title: "Recent work label", group: "homepage", fieldset: "chapter7", text: "Recent studio work" },

  { name: "codaCta", title: "Large link", group: "homepage", fieldset: "coda", text: "Start a project" },
  {
    name: "codaLine",
    title: "Line beneath",
    group: "homepage",
    fieldset: "coda",
    text: "Let’s talk about a project, collaboration or an idea you may have",
  },
  { name: "codaTimeLabel", title: "Time label", group: "homepage", fieldset: "coda", text: "In Toronto it is" },

  // ——— Projects page ———
  { name: "projectsHeading", title: "Heading", group: "projects", text: "Projects" },
  { name: "projectsViewOne", title: "View: one by one", group: "projects", text: "One by one" },
  { name: "projectsViewGlance", title: "View: at a glance", group: "projects", text: "At a glance" },
  { name: "projectsIconOne", title: "Phone view icon, to one by one (read by screen readers)", group: "projects", text: "View one by one" },
  { name: "projectsIconGlance", title: "Phone view icon, to at a glance (read by screen readers)", group: "projects", text: "View all at a glance" },
  { name: "projectsAllWork", title: "Filter: all work", group: "projects", text: "All work" },
  { name: "projectsEnter", title: "Project link", group: "projects", text: "Enter the project" },
  { name: "projectAllProjects", title: "Project page: link back to the Projects page", group: "projects", text: "All projects" },
  { name: "projectNextLabel", title: "Project page: label above the next project", group: "projects", text: "Next project" },
  { name: "projectStartLabel", title: "Project page: link to the contact page", group: "projects", text: "Start a project" },
  { name: "projectsPrevious", title: "Previous", group: "projects", text: "Previous" },
  { name: "projectsNext", title: "Next", group: "projects", text: "Next" },
  { name: "projectsPause", title: "Pause", group: "projects", text: "Pause" },
  { name: "projectsPlay", title: "Play", group: "projects", text: "Play" },
  { name: "projectsPreviousProject", title: "Phone arrow, previous (read by screen readers)", group: "projects", text: "Previous project" },
  { name: "projectsNextProject", title: "Phone arrow, next (read by screen readers)", group: "projects", text: "Next project" },
  { name: "projectsUpcoming", title: "Upcoming label", group: "projects", text: "Upcoming" },

  // ——— Menu ———
  { name: "menuClose", title: "Close button", group: "menu", text: "Close" },
  { name: "menuInstagram", title: "Instagram link", group: "menu", text: "Instagram" },
  { name: "menuNewsletter", title: "Newsletter link", group: "menu", text: "Newsletter" },
  { name: "menuTimeLabel", title: "Time label", group: "menu", text: "Toronto" },

  // ——— 404 page ———
  { name: "notFoundLabel", title: "Label", group: "notFound", text: "404" },
  { name: "notFoundHeading", title: "Heading", group: "notFound", text: "This page has wandered off." },
  {
    name: "notFoundLine",
    title: "Line",
    group: "notFound",
    text: "The page you were looking for has moved or no longer exists.",
  },
  { name: "notFoundLatest", title: "Latest entry link", group: "notFound", text: "The latest entry" },
  { name: "notFoundJournal", title: "Journal link (when there is no entry)", group: "notFound", text: "The journal" },
  { name: "notFoundWork", title: "Work link", group: "notFound", text: "The work" },
  { name: "notFoundHome", title: "Home link", group: "notFound", text: "Home" },
  { name: "notFoundHomeNote", title: "Home link note", group: "notFound", text: "Start again" },

  // ——— Newsletter card ———
  { name: "newsletterHeading", title: "Heading", group: "newsletter", text: "Stay in touch" },
  {
    name: "newsletterText",
    title: "Text",
    group: "newsletter",
    text: "Subscribe for updates on new work, journal entries, and studio news.",
    multiline: true,
  },
  { name: "newsletterPlaceholder", title: "Email field placeholder", group: "newsletter", text: "your@email.com" },
  { name: "newsletterSubscribe", title: "Subscribe button", group: "newsletter", text: "Subscribe" },
  { name: "newsletterNotNow", title: "Not now button", group: "newsletter", text: "Not now" },
  { name: "newsletterThanksHeading", title: "Thank you heading", group: "newsletter", text: "Thank you" },
  {
    name: "newsletterThanksText",
    title: "Thank you text",
    group: "newsletter",
    text: "You've been added to our mailing list. We'll be in touch.",
    multiline: true,
  },

  // ——— Privacy and Terms ———
  { name: "legalContentsLabel", title: "Contents label", group: "legal", text: "Contents" },
  { name: "legalShortPrefix", title: "In short label", group: "legal", text: "In short:" },
  { name: "privacyShortOverview", title: "Privacy: Overview", group: "legal", fieldset: "privacy", text: "this page explains what the site collects, where it is kept, and how it is used.", multiline: true },
  { name: "privacyShortCollect", title: "Privacy: Information we collect", group: "legal", fieldset: "privacy", text: "what you send through the contact form, the project interest form and the newsletter signup is saved in Sanity. Abuse protection counts submissions in memory only, and page speed is measured without cookies.", multiline: true },
  { name: "privacyShortProgress", title: "Privacy: Saved progress", group: "legal", fieldset: "privacy", text: "your contact form draft stays in your own browser until you send it, and is deleted when you do.", multiline: true },
  { name: "privacyShortUse", title: "Privacy: How we use your information", group: "legal", fieldset: "privacy", text: "to reply to you, to send the newsletter you signed up for, and to make pages load faster. It is never sold, rented or shared for marketing.", multiline: true },
  { name: "privacyShortNewsletter", title: "Privacy: Leaving the newsletter", group: "legal", fieldset: "privacy", text: "ask through the contact page and you will be removed.", multiline: true },
  { name: "privacyShortCookies", title: "Privacy: Cookies and browser storage", group: "legal", fieldset: "privacy", text: "no cookies of our own and no tracking. Two small notes sit in session storage, one in local storage remembers your Projects view, and the Spotify player may set its own cookies.", multiline: true },
  { name: "privacyShortThirdParties", title: "Privacy: Third party services", group: "legal", fieldset: "privacy", text: "Vercel hosts the site, Sanity stores its content and your submissions, and Spotify plays the playlist. Each has its own privacy policy.", multiline: true },
  { name: "privacyShortContact", title: "Privacy: Contact", group: "legal", fieldset: "privacy", text: "questions about this policy go through the contact page.", multiline: true },
  { name: "termsShortUse", title: "Terms: Use of this website", group: "legal", fieldset: "terms", text: "the site is for information and portfolio purposes. Browse freely, but do not scrape or copy it with automated tools.", multiline: true },
  { name: "termsShortProperty", title: "Terms: Intellectual property", group: "legal", fieldset: "terms", text: "the work on this site belongs to Maninder Singh / House of Singh. Ask before using any of it commercially.", multiline: true },
  { name: "termsShortLiability", title: "Terms: Limitation of liability", group: "legal", fieldset: "terms", text: "the site is provided as is, without guarantees.", multiline: true },
  { name: "termsShortLinks", title: "Terms: External links", group: "legal", fieldset: "terms", text: "links to other sites are not endorsements, and their content is their own.", multiline: true },
  { name: "termsShortLaw", title: "Terms: Governing law", group: "legal", fieldset: "terms", text: "these terms follow the laws of Ontario, Canada.", multiline: true },
  { name: "termsShortChanges", title: "Terms: Changes to these terms", group: "legal", fieldset: "terms", text: "these terms may change, and using the site after a change means accepting it.", multiline: true },
] as const satisfies readonly CopyField[];

export type CopyKey = (typeof SITE_COPY_FIELDS)[number]["name"];
export type SiteCopy = Record<CopyKey, string>;

/** Today's text for every field. */
export const DEFAULT_COPY = Object.fromEntries(
  SITE_COPY_FIELDS.map((f) => [f.name, f.text]),
) as SiteCopy;

/**
 * The site's text: each field from Site Settings when filled, otherwise
 * today's text.
 */
export function siteCopy(settings: object | null | undefined): SiteCopy {
  const s = (settings ?? {}) as Record<string, unknown>;
  const out = { ...DEFAULT_COPY };
  for (const key of Object.keys(out) as CopyKey[]) {
    const value = s[key];
    if (typeof value === "string" && value.trim()) out[key] = value.trim();
  }
  return out;
}

// ——— About page chapter headings (About Page document) ———

export const ABOUT_COPY_FIELDS = [
  { name: "aboutStoryLabel", title: "Chapter II label", text: "The story" },
  { name: "aboutPrintHeading", title: "Chapter IV heading", text: "In print" },
  { name: "aboutJourneyLabel", title: "Chapter V label", text: "Journey" },
  { name: "aboutJourneyHeading", title: "Chapter V heading", text: "A walk through the years" },
  { name: "aboutJourneyHint", title: "Chapter V scroll hint", text: "Scroll to walk on" },
  { name: "aboutConversationLabel", title: "Chapter VI label", text: "Rapid fire" },
  { name: "aboutConversationHeading", title: "Chapter VI heading", text: "In conversation" },
  { name: "aboutReplyName", title: "Name on each reply", text: "Maninder" },
] as const;

export type AboutCopyKey = (typeof ABOUT_COPY_FIELDS)[number]["name"];
export type AboutCopy = Record<AboutCopyKey, string>;

export function aboutCopy(about: object | null | undefined): AboutCopy {
  const s = (about ?? {}) as Record<string, unknown>;
  return Object.fromEntries(
    ABOUT_COPY_FIELDS.map((f) => {
      const value = s[f.name];
      return [f.name, typeof value === "string" && value.trim() ? value.trim() : f.text];
    }),
  ) as AboutCopy;
}
