/**
 * GROQ queries — stubs for now.
 * Each query will be used in server components via sanityFetch().
 */

export const navigationQuery = `*[_type == "navigation"][0]{ items[]{ label, href } }`;

export const heroSlidesQuery = `*[_type == "heroSlide"] | order(order asc){
  _id, heading, subheading, "imageSrc": image.asset->url, imageAlt
}`;

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

export const journalFeedQuery = `*[_type == "journalEntry"] | order(date desc){
  _id, title, "slug": slug.current, date, excerpt
}`;

export const journalBySlugQuery = `*[_type == "journalEntry" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, date, excerpt, body
}`;

export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  siteTitle, tagline, footerText
}`;
