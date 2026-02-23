/**
 * Placeholder data — used as fallbacks when Sanity returns null
 * (e.g. before content is populated in the CMS).
 * Also exports shared TypeScript types used across components.
 */

import type { SanityImageAsset } from "@/lib/sanityImage";

/** Image field from Sanity can be a full asset object or a plain URL string. */
export type SanityImage = SanityImageAsset | string;

// --------------- Types ---------------

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  order?: number;
};

export type HeroSlide = {
  _id: string;
  heading?: string;
  subheading?: string;
  image: SanityImage;
  imageAlt?: string;
  caption?: string;
  internalLink?: string;
  externalLink?: string;
};

export type ProjectCategory = {
  _id: string;
  slug: string;
  title: string;
  order: number;
  thumbnail?: SanityImage | null;
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

// --------------- Content Section Types ---------------

export type TextSectionBlock = {
  _type: "textSection";
  _key: string;
  heading?: string;
  body: PortableTextBlock[];
};

export type ImageSingleBlock = {
  _type: "imageSingle";
  _key: string;
  image: SanityImageAsset;
  caption?: string;
  size: "full" | "large" | "medium";
};

export type ImagePairBlock = {
  _type: "imagePair";
  _key: string;
  images: SanityImageAsset[];
  layout: "sideBySide" | "stacked";
};

export type ImageGridBlock = {
  _type: "imageGrid";
  _key: string;
  images: SanityImageAsset[];
  layout: "2col" | "3col";
};

export type StickyChapterBlock = {
  _type: "stickyChapter";
  _key: string;
  stickyText: PortableTextBlock[];
  images: SanityImageAsset[];
  layoutPreset: "heroThenGrid" | "gridThenHero" | "allSingles";
};

export type ContentSection =
  | TextSectionBlock
  | ImageSingleBlock
  | ImagePairBlock
  | ImageGridBlock
  | StickyChapterBlock;

export type ProjectDetail = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
  shortIntro?: string;
  coverImage?: SanityImageAsset | null;
  contentSections?: ContentSection[];
};

export type JournalEntry = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  coverImage?: SanityImage;
};

export type SpotlightProject = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  image: SanityImage;
};

export type SiteSettings = {
  siteTitle: string;
  tagline: string;
  footerText: string;
  spotifyPlaylistUrl?: string;
};

export type AboutMilestone = {
  year: string;
  title: string;
  text: string;
  image: SanityImage | null;
};

export type AboutTestimonial = {
  quote: string;
  name: string;
  role?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PortableTextBlock = any;

export type HomeAboutData = {
  homeAboutImage: SanityImage | null;
  homeAboutRoles: string[] | null;
  homeAboutBio: string | null;
  homeAboutQuote: string | null;
};

export type AboutPageData = {
  introQuote: string | null;
  founderName: string;
  founderRoles: string[] | null;
  founderBio: PortableTextBlock[] | null;
  portrait: SanityImage | null;
  monikerLogo: SanityImage | null;
  monikerText: PortableTextBlock[] | null;
  milestones: AboutMilestone[] | null;
  testimonials: AboutTestimonial[] | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

// --------------- Fallback Navigation ---------------

export const fallbackNavItems: NavItem[] = [
  { label: "Home", href: "/", order: 1 },
  { label: "About", href: "/about", order: 2 },
  { label: "Projects", href: "/projects", order: 3 },
  { label: "Journal", href: "/journal", order: 4 },
  {
    label: "Studio",
    href: "https://studios.houseofsingh.com",
    external: true,
    order: 5,
  },
  { label: "Contact", href: "/contact", order: 6 },
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

// --------------- Fallback Homepage About ---------------

export const fallbackHomeAbout: HomeAboutData = {
  homeAboutImage: "/images/hero-placeholder-1.svg",
  homeAboutRoles: [
    "Creative Director",
    "Multidisciplinary Designer",
    "Photographer",
  ],
  homeAboutBio:
    "Based in Toronto, Maninder Singh blends design and photography to craft stories that feel both visually refined and emotionally resonant. His practice spans brand identities, editorial work, and fine art — always grounded in intention and detail.",
  homeAboutQuote:
    "Guided by a deep curiosity for life's quiet wonders, creating work that reflects the rhythm of nature and human connection.",
};

// --------------- Fallback About Page ---------------

export const fallbackAboutPage: AboutPageData = {
  introQuote:
    "The world is filled with beauty, waiting to be seen, felt, and celebrated.",
  founderName: "Maninder Singh",
  founderRoles: [
    "Creative Director",
    "Multidisciplinary Designer",
    "Photographer",
  ],
  founderBio: null,
  portrait: "/images/hero-placeholder-1.svg",
  monikerLogo: null,
  monikerText: null,
  milestones: [
    {
      year: "2014",
      title: "Founded House of Singh",
      text: "Began the journey in New Delhi.",
      image: null,
    },
    {
      year: "2016",
      title: "First Brand Identity",
      text: "Delivered a full visual system for a heritage label.",
      image: null,
    },
    {
      year: "2018",
      title: "The Sikh Turban",
      text: "A personal project celebrating Sikh identity.",
      image: null,
    },
    {
      year: "2020",
      title: "Editorial & Print",
      text: "Expanded into editorial design and print storytelling.",
      image: null,
    },
    {
      year: "2021",
      title: "Relocation to Canada",
      text: "A new chapter rooted in Toronto.",
      image: null,
    },
    {
      year: "2024",
      title: "A Decade of Craft",
      text: "Ten years of evolving practice and perspective.",
      image: null,
    },
  ],
  testimonials: [
    {
      quote:
        "Working with Maninder felt less like a transaction and more like a conversation — one that left our brand feeling truly seen.",
      name: "Placeholder Name",
      role: "Creative Lead",
    },
    {
      quote:
        "He has a rare ability to listen deeply and translate feeling into form. The work speaks quietly but stays with you.",
      name: "Placeholder Name",
      role: "Brand Director",
    },
    {
      quote:
        "Every detail was intentional. The result was not just beautiful — it was meaningful.",
      name: "Placeholder Name",
      role: "Founder & CEO",
    },
  ],
  seoTitle: null,
  seoDescription: null,
};
