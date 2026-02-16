/**
 * GROQ queries used by server components via sanityFetch().
 */

// --------------- Navigation ---------------

export const navigationQuery = `*[_type == "navigation"][0]{
  items[]{ label, href, external }
}`;

// --------------- Site Settings ---------------

export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  siteTitle, tagline, footerText, spotifyPlaylistUrl
}`;

// --------------- Hero Slides ---------------

export const heroSlidesQuery = `*[_type == "heroSlide"] | order(order asc){
  _id, heading, subheading,
  "imageSrc": image.asset->url,
  imageAlt
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

// --------------- Journal ---------------

export const journalFeedQuery = `*[_type == "journalEntry"] | order(date desc){
  _id, title, "slug": slug.current, date, excerpt
}`;

export const journalBySlugQuery = `*[_type == "journalEntry" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, date, excerpt, body
}`;
