/**
 * GROQ queries used by server components via sanityFetch().
 *
 * Image fields use the _imageAsset projection to return the CDN URL
 * along with LQIP blur hash and dimensions for responsive rendering.
 */

// Shared projection for image asset data (includes alt/caption from image fields)
const _imageAsset = `{
  "url": asset->url,
  "lqip": asset->metadata.lqip,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
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

// --------------- Site Settings ---------------

export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  siteTitle,
  tagline,
  footerText,
  spotifyPlaylistUrl,
  defaultMetaDescription,
  organizationName,
  founderName,
  sameAs,
  googleVerification
}`;

// --------------- About Page ---------------

export const aboutPageQuery = `*[_type == "aboutPage"][0]{
  introQuote,
  founderName,
  founderRoles,
  founderBio,
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
  founderBio,
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

export const homepageFeaturedProjectsQuery = `*[_type == "project" && featuredOnHomepage == true] | order(homepageOrder asc, title asc){
  _id, title, "slug": slug.current, category,
  "thumbnail": thumbnail ${_imageAsset},
  "thumbnailAlt": coalesce(thumbnail.alt, title), excerpt
}`;

export const latestProjectsQuery = `*[_type == "project"] | order(_createdAt desc)[0...6]{
  _id, title, "slug": slug.current, category,
  "thumbnail": thumbnail ${_imageAsset},
  "thumbnailAlt": coalesce(thumbnail.alt, title), excerpt
}`;

// --------------- Projects ---------------

export const projectsListQuery = `*[_type == "project"] | order(title asc){
  _id, title, "slug": slug.current, category,
  "thumbnail": thumbnail ${_imageAsset},
  "thumbnailAlt": coalesce(thumbnail.alt, title), excerpt,
  isUpcoming
}`;

export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, category,
  excerpt,
  shortIntro,
  isUpcoming,
  showInterestForm,
  author,
  publishedAt,
  updatedAt,
  "seo": seo ${_seo},
  "coverImage": coverImage ${_imageAsset},
  contentSections[]{
    _type,
    _key,
    // textSection
    _type == "textSection" => {
      heading,
      body
    },
    // imageSingle
    _type == "imageSingle" => {
      "image": image ${_imageAsset},
      caption,
      size
    },
    // imagePair
    _type == "imagePair" => {
      "images": images[] ${_imageAsset},
      layout
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

// --------------- Spotlight ---------------

export const spotlightQuery = `*[_type == "spotlight"][0]{
  enabled, label, title, teaser, linkText, linkUrl, category,
  "image": spotlightImage ${_imageAsset}
}`;

// --------------- Contact Page ---------------

export const contactPageQuery = `*[_type == "contactPage"][0]{
  instagramPhotos[]{
    "id": _key,
    "url": image.asset->url,
    "alt": image.alt,
    permalink
  },
  "seo": seo ${_seo},
  seoTitle,
  seoDescription
}`;

// --------------- Journal ---------------

export const journalFeedQuery = `*[_type == "journalEntry"] | order(date desc){
  _id, title, "slug": slug.current, date,
  excerpt,
  "coverImage": coverImage ${_imageAsset}
}`;

export const journalBySlugQuery = `*[_type == "journalEntry" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, date,
  excerpt,
  body,
  author,
  "coverImage": coverImage ${_imageAsset},
  "seo": seo ${_seo},
  seoTitle,
  seoDescription
}`;
