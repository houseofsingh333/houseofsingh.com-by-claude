/**
 * Shared TypeScript types used across components.
 * Extracted from placeholder-data.ts for clean separation of
 * type definitions from fallback data.
 */

import type { SanityImageAsset } from "@/lib/sanityImage";

/** Image field from Sanity can be a full asset object or a plain URL string. */
export type SanityImage = SanityImageAsset | string;

/** Reusable SEO override object attached to indexable documents. */
export type Seo = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  noIndex?: boolean | null;
  canonicalUrl?: string | null;
};

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

export type ProjectSummary = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  thumbnailSrc: string;
  thumbnailAlt: string;
  excerpt: string;
  isUpcoming?: boolean;
};

export type HomepageProject = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  thumbnail: SanityImage;
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
  isUpcoming?: boolean;
  showInterestForm?: boolean;
  author?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  seo?: Seo | null;
};

export type JournalEntry = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  coverImage?: SanityImage;
  body?: PortableTextBlock[];
  author?: string | null;
  seo?: Seo | null;
  /** @deprecated superseded by `seo` — read as fallback only. */
  seoTitle?: string | null;
  /** @deprecated superseded by `seo` — read as fallback only. */
  seoDescription?: string | null;
};

export type SpotlightData = {
  enabled: boolean;
  label: string;
  title: string;
  teaser: string;
  linkText: string;
  linkUrl: string;
  category?: string;
  image: SanityImage;
};

export type SiteSettings = {
  siteTitle: string;
  tagline: string;
  footerText: string;
  spotifyPlaylistUrl?: string;
  defaultMetaDescription?: string | null;
  organizationName?: string | null;
  founderName?: string | null;
  sameAs?: string[] | null;
  googleVerification?: string | null;
};

export type AboutMilestone = {
  year: string;
  title: string;
  text: string;
  image: SanityImage | null;
};

export type FeaturedOutlet = {
  name: string;
  url?: string;
  logo?: SanityImage | null;
  title?: string;
  date?: string;
  description?: string;
  image?: SanityImage | null;
};

export type RapidFireItem = {
  question: string;
  answer: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PortableTextBlock = any;

export type AboutPageData = {
  introQuote: string | null;
  founderName: string;
  founderRoles: string[] | null;
  founderBio: PortableTextBlock[] | null;
  portrait: SanityImage | null;
  monikerLogo: SanityImage | null;
  monikerText: PortableTextBlock[] | null;
  featuredOn: FeaturedOutlet[] | null;
  milestones: AboutMilestone[] | null;
  rapidFire: RapidFireItem[] | null;
  seo?: Seo | null;
  /** @deprecated superseded by `seo` — read as fallback only. */
  seoTitle: string | null;
  /** @deprecated superseded by `seo` — read as fallback only. */
  seoDescription: string | null;
};

export type HomeIntroData = {
  founderName: string;
  founderRoles: string[] | null;
  founderBio: PortableTextBlock[] | null;
  portrait: SanityImage | null;
  introQuote: string | null;
};
