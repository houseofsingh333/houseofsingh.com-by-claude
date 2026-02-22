import { aboutPage } from "./aboutPage";
import { contactPage } from "./contactPage";
import { contactSubmission } from "./contactSubmission";
import { heroSlide } from "./heroSlide";
import { journalEntry } from "./journalEntry";
import { navigation } from "./navigation";
import { newsletterSubscriber } from "./newsletterSubscriber";
import { project } from "./project";
import { projectCategory } from "./projectCategory";
import {
  textSection,
  imageSingle,
  imagePair,
  imageGrid,
  stickyChapter,
} from "./sections";
import { siteSettings } from "./siteSettings";

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
  projectCategory,
  siteSettings,
  // Section block types (used inside project.contentSections)
  textSection,
  imageSingle,
  imagePair,
  imageGrid,
  stickyChapter,
];
