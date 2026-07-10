/**
 * Placeholder / fallback data — used when Sanity returns null
 * (e.g. before content is populated in the CMS).
 *
 * Types live in ./types.ts and are re-exported here for
 * backward compatibility with existing import sites.
 */

export type {
  SanityImage,
  NavItem,
  HeroSlide,
  ProjectSummary,
  HomepageProject,
  TextSectionBlock,
  FullWidthImageBlock,
  FullBleedImageBlock,
  ImageRow3Block,
  OffsetImageBlock,
  TextWithImageBlock,
  HorizontalGalleryBlock,
  PullQuoteBlock,
  ImageSingleBlock,
  ImagePairBlock,
  ImageGridBlock,
  StickyChapterBlock,
  ContentSection,
  ProjectDetail,
  JournalEntry,
  SiteSettings,
  AboutMilestone,
  FeaturedOutlet,
  RapidFireItem,
  PortableTextBlock,
  AboutPageData,
  HomeIntroData,
} from "./types";

import type {
  NavItem,
  HeroSlide,
  ProjectSummary,
  HomepageProject,
  JournalEntry,
  SiteSettings,
  AboutPageData,
  HomeIntroData,
} from "./types";

import type { InstagramPhoto } from "@/components/contact/InstagramPhotoPlate";

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

// --------------- Fallback Homepage Projects ---------------

export const fallbackHomepageProjects: HomepageProject[] = [
  {
    _id: "proj-1",
    title: "The Parkview Residence",
    slug: "parkview-residence",
    category: "Residential",
    thumbnail: "/images/project-placeholder-1.svg",
    thumbnailAlt: "Parkview Residence exterior",
    excerpt: "A contemporary family home blending indoor and outdoor living.",
  },
  {
    _id: "proj-2",
    title: "Ember Restaurant",
    slug: "ember-restaurant",
    category: "Commercial",
    thumbnail: "/images/project-placeholder-2.svg",
    thumbnailAlt: "Ember Restaurant interior",
    excerpt: "An intimate dining experience rooted in natural materials.",
  },
  {
    _id: "proj-3",
    title: "Loft on Fifth",
    slug: "loft-on-fifth",
    category: "Residential",
    thumbnail: "/images/project-placeholder-3.svg",
    thumbnailAlt: "Loft on Fifth living area",
    excerpt:
      "Industrial loft converted into a bright, open-plan living space.",
  },
  {
    _id: "proj-4",
    title: "Solace — A Visual Study",
    slug: "solace-visual-study",
    category: "Photography",
    thumbnail: "/images/hero-placeholder-1.svg",
    thumbnailAlt: "Solace visual study composition",
    excerpt:
      "A photographic exploration of stillness and light in everyday spaces.",
  },
  {
    _id: "proj-5",
    title: "Grain & Thread Identity",
    slug: "grain-and-thread-identity",
    category: "Design",
    thumbnail: "/images/hero-placeholder-2.svg",
    thumbnailAlt: "Grain & Thread brand identity",
    excerpt:
      "Complete visual identity for an artisan textile studio rooted in craft.",
  },
  {
    _id: "proj-6",
    title: "Folio 2024 — Singh x Atelier",
    slug: "folio-2024-singh-atelier",
    category: "Collaborations",
    thumbnail: "/images/hero-placeholder-3.svg",
    thumbnailAlt: "Folio 2024 collaboration spread",
    excerpt:
      "A limited-edition print collaboration merging photography and type.",
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

// --------------- Fallback Site Settings ---------------

export const fallbackSiteSettings: SiteSettings = {
  siteTitle: "House of Singh",
  tagline: "Design. Build. Create.",
  footerText: "\u00A9 2026 House of Singh Studios Inc.",
  spotifyPlaylistUrl:
    "https://open.spotify.com/embed/playlist/5siljeAcGgaINDEqVRBsAg?utm_source=generator",
};

// --------------- Fallback Instagram Photos ---------------

export const fallbackInstagramPhotos: InstagramPhoto[] = [
  {
    id: "ig-1",
    url: "/images/instagram-placeholder-1.svg",
    permalink: "https://instagram.com/houseofsingh",
    alt: "Light study — concentric circles and intersecting lines on dark background",
  },
  {
    id: "ig-2",
    url: "/images/instagram-placeholder-2.svg",
    permalink: "https://instagram.com/houseofsingh",
    alt: "Stillness — minimal landscape with warm earth tones",
  },
  {
    id: "ig-3",
    url: "/images/instagram-placeholder-3.svg",
    permalink: "https://instagram.com/houseofsingh",
    alt: "Texture and form — grid composition with warm dark tones",
  },
  {
    id: "ig-4",
    url: "/images/instagram-placeholder-4.svg",
    permalink: "https://instagram.com/houseofsingh",
    alt: "Craft and type — architectural lines with typography element",
  },
];

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
  featuredOn: [],
  milestones: [],
  rapidFire: [],
  seoTitle: null,
  seoDescription: null,
};

// --------------- Fallback Home Intro ---------------

export const fallbackHomeIntro: HomeIntroData = {
  founderName: "Maninder Singh",
  founderRoles: [
    "Creative Director",
    "Multidisciplinary Designer",
    "Photographer",
  ],
  founderBio: null,
  portrait: "/images/hero-placeholder-1.svg",
  introQuote:
    "Guided by a deep curiosity for life\u2019s quiet wonders, creating work that reflects the rhythm of nature and human connection.",
};
