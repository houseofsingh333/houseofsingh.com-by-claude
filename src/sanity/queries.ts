/**
 * GROQ queries used by server components via sanityFetch().
 */

// --------------- Navigation ---------------

export const navigationQuery = `*[_type == "navigation"][0]{
  items[]{ label, href, external, order }
}`;

// --------------- Site Settings ---------------

export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  siteTitle, tagline, footerText, spotifyPlaylistUrl
}`;

// --------------- Hero Slides ---------------

export const heroSlidesQuery = `*[_type == "heroSlide"] | order(order asc){
  _id,
  "image": image.asset->url,
  caption,
  internalLink,
  externalLink
}`;

// --------------- Project Categories ---------------

export const projectCategoriesQuery = `*[_type == "projectCategory"] | order(order asc){
  _id, "slug": slug.current, title, order
}`;

// --------------- Projects ---------------

export const projectsListQuery = `*[_type == "project"] | order(title asc){
  _id, title, "slug": slug.current, category,
  "thumbnailSrc": thumbnail.asset->url, thumbnailAlt, excerpt
}`;

export const projectsByCategoryQuery = `*[_type == "project" && category == $category] | order(title asc){
  _id, title, "slug": slug.current, category,
  "thumbnailSrc": thumbnail.asset->url, thumbnailAlt, excerpt
}`;

export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, category, excerpt, body,
  "images": images[].asset->url
}`;

// --------------- Spotlight Project ---------------

export const spotlightProjectQuery = `*[_type == "project" && spotlight == true][0]{
  _id, title, "slug": slug.current,
  "description": excerpt,
  "image": thumbnail.asset->url
}`;

// --------------- Journal ---------------

export const journalFeedQuery = `*[_type == "journalEntry"] | order(date desc){
  _id, title, "slug": slug.current, date, excerpt,
  "coverImage": coverImage.asset->url
}`;

export const journalBySlugQuery = `*[_type == "journalEntry" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, date, excerpt, body
}`;
