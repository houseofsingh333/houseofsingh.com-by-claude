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
  caption
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
  spotifyPlaylistUrl
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
    url,
    "logo": logo.asset->url
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
  testimonials[]{
    quote,
    name,
    role
  },
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

// --------------- Project Categories ---------------

export const projectCategoriesQuery = `*[_type == "projectCategory"] | order(order asc){
  _id, "slug": slug.current, title, order,
  "thumbnail": thumbnail ${_imageAsset},
  "previewGif": previewGif.asset->url,
  "previewImages": previewImages[] ${_imageAsset}
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
  "thumbnailAlt": coalesce(thumbnail.alt, title), excerpt
}`;

export const projectsByCategoryQuery = `*[_type == "project" && category == $category] | order(title asc){
  _id, title, "slug": slug.current, category,
  "thumbnail": thumbnail ${_imageAsset},
  "thumbnailAlt": coalesce(thumbnail.alt, title), excerpt
}`;

export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, category,
  excerpt,
  shortIntro,
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

// --------------- Spotlight Project ---------------

export const spotlightProjectQuery = `*[_type == "project" && spotlight == true][0]{
  _id, title, "slug": slug.current,
  "description": excerpt,
  "image": thumbnail ${_imageAsset}
}`;

// --------------- Contact Page ---------------

export const contactPageQuery = `*[_type == "contactPage"][0]{
  instagramPhotos[]{
    "id": _key,
    "url": image.asset->url,
    "alt": image.alt,
    permalink
  }
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
  "coverImage": coverImage ${_imageAsset}
}`;
