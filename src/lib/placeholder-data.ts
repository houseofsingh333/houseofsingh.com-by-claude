/**
 * Placeholder data used until Sanity CMS is wired up.
 * Each array mirrors the shape of the future Sanity schema.
 * Replace with real GROQ queries when ready.
 */

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type HeroSlide = {
  _id: string;
  heading: string;
  subheading: string;
  imageSrc: string;
  imageAlt: string;
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
};

export type SiteSettings = {
  siteTitle: string;
  tagline: string;
  footerText: string;
};

// --------------- Navigation ---------------

export const navigationItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
  { label: "Studio", href: "/studio", external: true },
];

// --------------- Hero Slides ---------------

export const heroSlides: HeroSlide[] = [
  {
    _id: "hero-1",
    heading: "House of Singh",
    subheading: "Design. Build. Create.",
    imageSrc: "/images/hero-placeholder-1.svg",
    imageAlt: "A modern architectural space with warm lighting",
  },
  {
    _id: "hero-2",
    heading: "Crafted Spaces",
    subheading: "Where vision meets execution.",
    imageSrc: "/images/hero-placeholder-2.svg",
    imageAlt: "Interior design detail shot",
  },
];

// --------------- Projects ---------------

export const projects: ProjectSummary[] = [
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
    excerpt: "Industrial loft converted into a bright, open-plan living space.",
  },
];

// --------------- Journal ---------------

export const journalEntries: JournalEntry[] = [
  {
    _id: "journal-1",
    title: "Why We Start With Materials",
    slug: "why-we-start-with-materials",
    date: "2025-12-01",
    excerpt:
      "Every project begins with touch. We share our process for selecting materials before sketching a single line.",
  },
  {
    _id: "journal-2",
    title: "Behind the Build: Parkview",
    slug: "behind-the-build-parkview",
    date: "2025-11-15",
    excerpt:
      "A look at the challenges and breakthroughs during the Parkview Residence project.",
  },
];

// --------------- Site Settings ---------------

export const siteSettings: SiteSettings = {
  siteTitle: "House of Singh",
  tagline: "Design. Build. Create.",
  footerText: "\u00A9 2025 House of Singh. All rights reserved.",
};
