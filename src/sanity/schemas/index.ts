import { aboutPage } from "./aboutPage";
import { contactPage } from "./contactPage";
import { contactSubmission } from "./contactSubmission";
import { heroSlide } from "./heroSlide";
import { journalEntry } from "./journalEntry";
import { navigation } from "./navigation";
import { newsletterSubscriber } from "./newsletterSubscriber";
import { project } from "./project";
import { projectInterest } from "./projectInterest";
import { redirect } from "./redirect";
import {
  textSection,
  fullWidthImage,
  fullBleedImage,
  imagePair,
  imageRow3,
  offsetImage,
  textWithImage,
  horizontalGallery,
  pullQuote,
  imageSingle,
  imageGrid,
  stickyChapter,
} from "./sections";
import { seo } from "./seo";
import {
  editionsCollection,
  editionsCategory,
  editionsPiece,
  editionsCollaborator,
  editionsShipping,
  editionsSettings,
  editionsNotify,
  editionsProposal,
  editionsOrder,
  editionsCollector,
} from "./editions";
import { siteSettings } from "./siteSettings";
import { spotlight } from "./spotlight";

export const schemaTypes = [
  // Document types
  aboutPage,
  contactPage,
  contactSubmission,
  heroSlide,
  journalEntry,
  navigation,
  newsletterSubscriber,
  project,
  redirect,
  projectInterest,
  siteSettings,
  spotlight,
  // House of Singh Editions (the Shop): content, then private records
  editionsCollection,
  editionsCategory,
  editionsPiece,
  editionsCollaborator,
  editionsShipping,
  editionsSettings,
  editionsNotify,
  editionsProposal,
  editionsOrder,
  editionsCollector,
  // Section block types (used inside project.contentSections)
  textSection,
  fullWidthImage,
  fullBleedImage,
  imagePair,
  imageRow3,
  offsetImage,
  textWithImage,
  horizontalGallery,
  pullQuote,
  // Legacy section blocks — retained for existing published projects
  imageSingle,
  imageGrid,
  stickyChapter,
  // Shared object types
  seo,
];
