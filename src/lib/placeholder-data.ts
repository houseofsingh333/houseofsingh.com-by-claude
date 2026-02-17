/**
 * Placeholder data — used as fallbacks when Sanity returns null
 * (e.g. before content is populated in the CMS).
 * Also exports shared TypeScript types used across components.
 */

// --------------- Types ---------------

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  order?: number;
};

export type HeroSlide = {
  _id: string;
  image: string;
  caption?: string;
  internalLink?: string;
  externalLink?: string;
};

export type ProjectCategory = {
  _id: string;
  slug: string;
  title: string;
  order: number;
};

export type ProjectSummary = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  thumbnailSrc: string;
  thumbnailAlt: string;
  excerpt: string;
};

export type JournalEntry = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  coverImage?: string;
};

export type SpotlightProject = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
};

export type SiteSettings = {
  siteTitle: string;
  tagline: string;
  footerText: string;
  spotifyPlaylistUrl?: string;
};

export type AboutPageHighlight = {
  label: string;
  value: string;
};

export type PortableTextBlock = {
  _type: "block";
  _key: string;
  children: { _type: string; text: string }[];
  style?: string;
};

export type AboutPageData = {
  title: string;
  intro: PortableTextBlock[] | null;
  portrait: string | null;
  body: PortableTextBlock[] | null;
  highlights: AboutPageHighlight[] | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

// --------------- Fallback Navigation ---------------

export const fallbackNavItems: NavItem[] = [
  { label: "Home", href: "/", order: 1 },
  { label: "About", href: "/about", order: 2 },
  { label: "Projects", href: "/projects", order: 3 },
  { label: "Journal", href: "/journal", order: 4 },
  { label: "Contact", href: "/contact", order: 5 },
  {
    label: "Studio",
    href: "https://studios.houseofsingh.com",
    external: true,
    order: 6,
  },
];

// --------------- Fallback Hero Slides ---------------

export const fallbackHeroSlides: HeroSlide[] = [
  {
    _id: "hero-1",
    image: "/images/hero-placeholder-1.svg",
    caption: "House of Singh — Design Studio",
    internalLink: "/about",
  },
  {
    _id: "hero-2",
    image: "/images/hero-placeholder-2.svg",
    caption: "Crafted Spaces — Where vision meets execution",
    internalLink: "/projects",
  },
  {
    _id: "hero-3",
    image: "/images/hero-placeholder-3.svg",
    caption: "Timeless Interiors — Built to inspire and endure",
    internalLink: "/journal",
  },
];

// --------------- Fallback Project Categories ---------------

export const fallbackProjectCategories: ProjectCategory[] = [
  { _id: "cat-1", slug: "photography", title: "Photography", order: 1 },
  { _id: "cat-2", slug: "design", title: "Design", order: 2 },
  {
    _id: "cat-3",
    slug: "collaborations",
    title: "Collaborations",
    order: 3,
  },
];

// --------------- Fallback Projects ---------------

export const fallbackProjects: ProjectSummary[] = [
  {
    _id: "proj-1",
    title: "The Parkview Residence",
    slug: "parkview-residence",
    category: "Residential",
    thumbnailSrc: "/images/project-placeholder-1.svg",
    thumbnailAlt: "Parkview Residence exterior",
    excerpt: "A contemporary family home blending indoor and outdoor living.",
  },
  {
    _id: "proj-2",
    title: "Ember Restaurant",
    slug: "ember-restaurant",
    category: "Commercial",
    thumbnailSrc: "/images/project-placeholder-2.svg",
    thumbnailAlt: "Ember Restaurant interior",
    excerpt: "An intimate dining experience rooted in natural materials.",
  },
  {
    _id: "proj-3",
    title: "Loft on Fifth",
    slug: "loft-on-fifth",
    category: "Residential",
    thumbnailSrc: "/images/project-placeholder-3.svg",
    thumbnailAlt: "Loft on Fifth living area",
    excerpt:
      "Industrial loft converted into a bright, open-plan living space.",
  },
];

// --------------- Fallback Journal ---------------

export const fallbackJournalEntries: JournalEntry[] = [
  {
    _id: "journal-1",
    title: "Why We Start With Materials",
    slug: "why-we-start-with-materials",
    date: "2025-12-01",
    excerpt:
      "Every project begins with touch. We share our process for selecting materials before sketching a single line.",
    coverImage: "/images/project-placeholder-1.svg",
  },
  {
    _id: "journal-2",
    title: "Behind the Build: Parkview",
    slug: "behind-the-build-parkview",
    date: "2025-11-15",
    excerpt:
      "A look at the challenges and breakthroughs during the Parkview Residence project.",
    coverImage: "/images/project-placeholder-2.svg",
  },
  {
    _id: "journal-3",
    title: "Light as a Material",
    slug: "light-as-a-material",
    date: "2025-10-28",
    excerpt:
      "How natural light shapes our approach to every residential project we take on.",
    coverImage: "/images/project-placeholder-3.svg",
  },
  {
    _id: "journal-4",
    title: "The Art of Restraint",
    slug: "the-art-of-restraint",
    date: "2025-10-10",
    excerpt:
      "Exploring the power of simplicity and negative space in modern design.",
    coverImage: "/images/project-placeholder-1.svg",
  },
];

// --------------- Fallback Spotlight ---------------

export const fallbackSpotlightProject: SpotlightProject = {
  _id: "spotlight-1",
  slug: "parkview-residence",
  title: "The Parkview Residence",
  description:
    "A contemporary family home blending indoor and outdoor living, designed with intention and restraint.",
  image: "/images/project-placeholder-1.svg",
};

// --------------- Fallback Site Settings ---------------

export const fallbackSiteSettings: SiteSettings = {
  siteTitle: "House of Singh",
  tagline: "Design. Build. Create.",
  footerText: "\u00A9 2026 House of Singh Studios Inc.",
  spotifyPlaylistUrl:
    "https://open.spotify.com/embed/playlist/5siljeAcGgaINDEqVRBsAg?utm_source=generator",
};

// --------------- Fallback About Page ---------------

export const fallbackAboutPage: AboutPageData = {
  title: "About",
  intro: null,
  portrait: "/images/hero-placeholder-1.svg",
  body: null,
  highlights: [
    { label: "Based in", value: "Toronto, Canada" },
    { label: "Disciplines", value: "Design, Photography, Direction" },
    { label: "Experience", value: "10+ Years" },
  ],
  seoTitle: null,
  seoDescription: null,
};
