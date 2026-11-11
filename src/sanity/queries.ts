/**
 * GROQ queries used by server components via sanityFetch().
 *
 * Image fields use the _imageAsset projection to return the CDN URL
 * along with LQIP blur hash and dimensions for responsive rendering.
 */

// Shared projection for image asset data (includes alt/caption from image fields)
export const _imageAsset = `{
  "url": asset->url,
  "lqip": asset->metadata.lqip,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  hotspot,
  crop,
  alt,
  caption,
  isDecorative
}`;

// Shared projection for the reusable SEO object
const _seo = `{
  metaTitle,
  metaDescription,
  noIndex,
  canonicalUrl
}`;

// --------------- Navigation ---------------

export const navigationQuery = `*[_type == "navigation"][0]{
  items[]{ label, href, external, order }
}`;

/**
 * The menu photographs: each page's own from Site Settings (Menu), and the
 * defaults for those left empty: the first hero slide, the About portrait,
 * the first project in homepage order, the latest journal entry and the
 * Contact portrait (else the About portrait).
 */
export const menuPhotosQuery = `{
  "set": *[_type == "siteSettings"][0]{
    "home": { "image": menuPhotoHome ${_imageAsset}, "alt": menuPhotoHome.alt },
    "about": { "image": menuPhotoAbout ${_imageAsset}, "alt": menuPhotoAbout.alt },
    "projects": { "image": menuPhotoProjects ${_imageAsset}, "alt": menuPhotoProjects.alt },
    "journal": { "image": menuPhotoJournal ${_imageAsset}, "alt": menuPhotoJournal.alt },
    "contact": { "image": menuPhotoContact ${_imageAsset}, "alt": menuPhotoContact.alt }
  },
  "home": *[_type == "heroSlide"] | order(order asc)[0]{ "image": image ${_imageAsset}, "alt": coalesce(image.alt, imageAlt), caption },
  "about": *[_type == "aboutPage"][0]{ "image": portrait ${_imageAsset}, "alt": portrait.alt },
  "projects": *[_type == "project" && featuredOnHomepage == true] | order(homepageOrder asc, title asc)[0]{ title, "image": select(defined(coverImage.asset) => coverImage, thumbnail) ${_imageAsset}, "alt": select(defined(coverImage.asset) => coverImage.alt, thumbnail.alt) },
  "journal": *[_type == "journalEntry"] | order(date desc)[0]{ title, "image": coverImage ${_imageAsset}, "alt": coverImage.alt },
  "contact": *[_type == "contactPage"][0]{ "image": portrait ${_imageAsset}, "alt": portrait.alt }
}`;

// --------------- Site Settings ---------------

/**
 * Every Site Settings field (including the optional chapter texts read by
 * lib/siteCopy.ts), with the record sleeve image resolved.
 */
export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  ...,
  "studioWorkCards": studioWorkCards[]{ _key, clientName, service, link, "image": image ${_imageAsset} }
}`;

// --------------- Page not found ---------------

/**
 * The 404 page: its photograph (Site Settings, else the cover of the Range
 * day journal entry), the latest journal entry and the number of projects.
 */
export const notFoundQuery = `{
  "image": coalesce(
    *[_type == "siteSettings"][0].notFoundImage,
    *[_type == "journalEntry" && title match "Range day"] | order(date desc)[0].coverImage
  ) ${_imageAsset},
  "latest": *[_type == "journalEntry"] | order(date desc)[0]{ title, "slug": slug.current },
  "settings": *[_type == "siteSettings"][0]
}`;

// --------------- About Page ---------------

export const aboutPageQuery = `*[_type == "aboutPage"][0]{
  introQuote,
  founderName,
  founderRoles,
  founderBio,
  bioPullQuote,
  aboutPortraitLabel,
  aboutStoryLabel,
  aboutPracticeLabel,
  aboutPrintHeading,
  aboutJourneyHeading,
  aboutConversationLabel,
  aboutConversationHeading,
  aboutReplyName,
  "portrait": portrait ${_imageAsset},
  "monikerLogo": monikerLogo.asset->url,
  monikerText,
  featuredOn[]{
    name,
    title,
    date,
    description,
    url,
    "logo": logo.asset->url,
    "image": image ${_imageAsset}
  },
  rapidFire[]{
    question,
    answer
  },
  milestones[]{
    year,
    title,
    text,
    "image": image ${_imageAsset}
  },
  "seo": seo ${_seo},
  seoTitle,
  seoDescription
}`;

// --------------- Homepage Intro (About preview) ---------------

export const homeIntroQuery = `*[_type == "aboutPage"][0]{
  founderName,
  founderRoles,
  // Short homepage bio, falling back to the full About-page bio when unset.
  "founderBio": coalesce(homeBio, founderBio),
  "portrait": coalesce(homePortrait, portrait) ${_imageAsset},
  introQuote
}`;

// --------------- Hero Slides ---------------

export const heroSlidesQuery = `*[_type == "heroSlide"] | order(order asc){
  _id,
  heading,
  subheading,
  "image": image ${_imageAsset},
  "imageAlt": coalesce(image.alt, imageAlt),
  caption,
  internalLink,
  externalLink
}`;

// --------------- Homepage Featured Projects ---------------

const _homepageProject = `{
  _id, title, "slug": slug.current, category,
  "thumbnail": thumbnail ${_imageAsset},
  "thumbnailAlt": coalesce(thumbnail.alt, title), excerpt, year,
  "coverImage": coverImage ${_imageAsset}
}`;

/**
 * Chapter III's three projects: Site Settings "Homepage projects" in its
 * order when it has any, else the first three projects shown on the
 * homepage, in homepage order.
 */
export const homepageFeaturedProjectsQuery = `select(
  count(*[_type == "siteSettings"][0].homepageProjects[defined(@->_id)]) > 0 =>
    *[_type == "siteSettings"][0].homepageProjects[]->${_homepageProject}[defined(_id)][0...3],
  *[_type == "project" && featuredOnHomepage == true] | order(homepageOrder asc, title asc)[0...3]${_homepageProject}
)`;

export const latestProjectsQuery = `*[_type == "project"] | order(_createdAt desc)[0...6]{
  _id, title, "slug": slug.current, category,
  "thumbnail": thumbnail ${_imageAsset},
  "thumbnailAlt": coalesce(thumbnail.alt, title), excerpt, year,
  "coverImage": coverImage ${_imageAsset}
}`;

// --------------- Projects ---------------

/**
 * The order of projects everywhere outside the homepage's own list: the
 * homepage's (Homepage Order, lowest first), then projects without an
 * order value, newest first (published date, else when the project was
 * created). Used by the Projects page and by "Next project".
 */
const _projectOrder = "order(defined(homepageOrder) desc, homepageOrder asc, coalesce(publishedAt, _createdAt) desc)";

/**
 * Every project for the Projects page. "plates" are the photographs that
 * take turns on its plate: the project's Plate photographs when set,
 * otherwise the cover and the first images of its content sections (the
 * page keeps the first four). "sectionImages" gathers those images in the
 * order the sections appear.
 *
 * In the projects' order (_projectOrder).
 */
export const projectsListQuery = `*[_type == "project"] | ${_projectOrder}{
  _id, title, "slug": slug.current, category, year, role,
  "thumbnail": thumbnail ${_imageAsset},
  "thumbnailAlt": coalesce(thumbnail.alt, title), excerpt,
  isUpcoming,
  "plates": plates[0...4] ${_imageAsset},
  "photos": photographs[0...4] ${_imageAsset},
  "cover": coverImage ${_imageAsset},
  "sectionImages": contentSections[]{
    "list": select(
      defined(image.asset) => [image],
      defined(images) => images[defined(asset)],
      []
    )
  }.list[][0...8] ${_imageAsset}
}`;

/** A project's Photographs with their shape and Layout (lib/projectStory.ts). */
const _storyPhoto = `{
  _key, layout, alt, caption, isDecorative, hotspot, crop,
  "url": asset->url,
  "lqip": asset->metadata.lqip,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
}`;

export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, category,
  year, role, story,
  "photographs": photographs[defined(asset)] ${_storyPhoto},
  excerpt,
  shortIntro,
  isUpcoming,
  showInterestForm,
  author,
  publishedAt,
  updatedAt,
  "seo": seo ${_seo},
  "coverImage": coverImage ${_imageAsset},
  "thumbnail": thumbnail ${_imageAsset},
  contentSections[]{
    _type,
    _key,
    // textSection
    _type == "textSection" => {
      heading,
      body
    },
    // fullWidthImage
    _type == "fullWidthImage" => {
      "image": image ${_imageAsset}
    },
    // fullBleedImage
    _type == "fullBleedImage" => {
      "image": image ${_imageAsset}
    },
    // imagePair
    _type == "imagePair" => {
      "images": images[] ${_imageAsset},
      layout
    },
    // imageRow3
    _type == "imageRow3" => {
      "images": images[] ${_imageAsset}
    },
    // offsetImage
    _type == "offsetImage" => {
      "image": image ${_imageAsset},
      side,
      text
    },
    // textWithImage
    _type == "textWithImage" => {
      body,
      "image": image ${_imageAsset},
      side
    },
    // horizontalGallery
    _type == "horizontalGallery" => {
      "images": images[] ${_imageAsset}
    },
    // pullQuote
    _type == "pullQuote" => {
      quote,
      attribution
    },
    // ── Legacy blocks (retained for existing projects) ──
    // imageSingle
    _type == "imageSingle" => {
      "image": image ${_imageAsset},
      caption,
      size
    },
    // imageGrid
    _type == "imageGrid" => {
      "images": images[] ${_imageAsset},
      layout
    },
    // stickyChapter
    _type == "stickyChapter" => {
      stickyText,
      "images": images[] ${_imageAsset},
      layoutPreset
    }
  }
}`;

// Every project in the order of the projects page, for "Next project".
export const projectLinksQuery = `*[_type == "project"] | ${_projectOrder}{
  title, "slug": slug.current, isUpcoming, category,
  "photo": photographs[0] ${_imageAsset},
  "coverImage": coverImage ${_imageAsset},
  "thumbnail": thumbnail ${_imageAsset}
}`;

// --------------- Spotlight ---------------

export const spotlightQuery = `*[_type == "spotlight"][0]{
  enabled, label, title, teaser, linkText, linkUrl, category,
  "image": spotlightImage ${_imageAsset}
}`;

// --------------- Contact Page ---------------

export const contactPageQuery = `*[_type == "contactPage"][0]{
  "portrait": coalesce(portrait, *[_type == "aboutPage"][0].portrait) ${_imageAsset},
  portraitCaption,
  form,
  "seo": seo ${_seo},
  seoTitle,
  seoDescription
}`;

// --------------- Redirects ---------------

/** An old address that leads somewhere else (checked before any 404). */
export const redirectQuery = `*[_type == "redirect" && from in $paths][0]{ to, permanent }`;

// --------------- Journal ---------------

export const journalFeedQuery = `*[_type == "journalEntry"] | order(date desc){
  _id, title, "slug": slug.current, date,
  excerpt,
  "coverImage": coverImage ${_imageAsset}
}`;

/** A journal entry in full, as the Journal page shows it (body images with their URLs). */
const _journalEntryFull = `{
  _id, title, "slug": slug.current, date, excerpt,
  "coverImage": coverImage ${_imageAsset},
  "body": body[]{
    ...,
    _type == "image" => {
      ...,
      "url": asset->url,
      "lqip": asset->metadata.lqip,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  }
}`;

/**
 * Every entry, light: what the calendar needs (date, title, address and the
 * cover for its photo circle). Newest first; entries on the same day in the
 * order they were made, newest first.
 */
export const journalIndexQuery = `*[_type == "journalEntry" && defined(date) && defined(slug.current)] | order(date desc, _createdAt desc){
  _id, title, "slug": slug.current, date,
  "thumb": coverImage{ "url": asset->url, hotspot }
}`;

/** The entries of one month, in full ($from inclusive, $to exclusive, YYYY-MM-DD). */
export const journalMonthQuery = `*[_type == "journalEntry" && defined(slug.current) && date >= $from && date < $to] | order(date desc, _createdAt desc) ${_journalEntryFull}`;

export const journalBySlugQuery = `*[_type == "journalEntry" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, date,
  "updatedAt": _updatedAt,
  excerpt,
  body,
  author,
  "coverImage": coverImage ${_imageAsset},
  "seo": seo ${_seo},
  seoTitle,
  seoDescription
}`;

// --------------- llms.txt and llms-full.txt ---------------

/**
 * The text of the site for language models (app/llms.txt, app/llms-full.txt):
 * About, every project in the Projects page's order, and the twenty most
 * recent journal entries. Pages kept out of search results are left out.
 */
export const llmsQuery = `{
  "about": *[_type == "aboutPage"][0]{
    founderName, founderRoles, introQuote, founderBio, bioPullQuote, monikerText,
    milestones[]{ year, title, text },
    featuredOn[]{ name, title, date, description, url },
    rapidFire[]{ question, answer }
  },
  "projects": *[_type == "project" && seo.noIndex != true] | ${_projectOrder}{
    title, "slug": slug.current, category, year, role, excerpt, shortIntro, isUpcoming, story,
    contentSections[]{ _type, heading, body, text, quote, attribution, stickyText }
  },
  "entries": *[_type == "journalEntry" && seo.noIndex != true] | order(date desc)[0...20]{
    title, "slug": slug.current, date, excerpt, author, body
  }
}`;
