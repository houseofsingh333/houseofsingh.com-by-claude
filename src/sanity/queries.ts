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
  items[]{ "label": coalesce(label.en, label), href, external, order }
}`;

// --------------- Site Settings ---------------

export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  siteTitle,
  "tagline": coalesce(tagline.en, tagline),
  "footerText": coalesce(footerText.en, footerText),
  spotifyPlaylistUrl
}`;

// --------------- About Page ---------------

export const aboutPageQuery = `*[_type == "aboutPage"][0]{
  "introQuote": coalesce(introQuote.en, introQuote),
  founderName,
  "founderRoles": coalesce(founderRoles.en, founderRoles),
  "founderBio": coalesce(founderBio.en, founderBio),
  "portrait": portrait ${_imageAsset},
  "monikerLogo": monikerLogo.asset->url,
  "monikerText": coalesce(monikerText.en, monikerText),
  milestones[]{
    year,
    "title": coalesce(title.en, title),
    "text": coalesce(text.en, text),
    "image": image ${_imageAsset}
  },
  testimonials[]{
    "quote": coalesce(quote.en, quote),
    name,
    role
  },
  seoTitle,
  seoDescription
}`;

// --------------- Hero Slides ---------------

export const heroSlidesQuery = `*[_type == "heroSlide"] | order(order asc){
  _id,
  "heading": coalesce(heading.en, heading),
  "subheading": coalesce(subheading.en, subheading),
  "image": image ${_imageAsset},
  "imageAlt": coalesce(image.alt, imageAlt),
  "caption": coalesce(caption.en, caption),
  internalLink,
  externalLink
}`;

// --------------- Project Categories ---------------

export const projectCategoriesQuery = `*[_type == "projectCategory"] | order(order asc){
  _id, "slug": slug.current, title, order,
  "thumbnail": thumbnail ${_imageAsset}
}`;

// --------------- Projects ---------------

export const projectsListQuery = `*[_type == "project"] | order(title asc){
  _id, "title": coalesce(title.en, title), "slug": slug.current, category,
  "thumbnail": thumbnail ${_imageAsset},
  thumbnailAlt, "excerpt": coalesce(excerpt.en, excerpt)
}`;

export const projectsByCategoryQuery = `*[_type == "project" && category == $category] | order(title asc){
  _id, "title": coalesce(title.en, title), "slug": slug.current, category,
  "thumbnail": thumbnail ${_imageAsset},
  thumbnailAlt, "excerpt": coalesce(excerpt.en, excerpt)
}`;

export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0]{
  _id, "title": coalesce(title.en, title), "slug": slug.current, category,
  "excerpt": coalesce(excerpt.en, excerpt),
  "body": coalesce(body.en, body),
  "images": images[]${_imageAsset}
}`;

// --------------- Spotlight Project ---------------

export const spotlightProjectQuery = `*[_type == "project" && spotlight == true][0]{
  _id, "title": coalesce(title.en, title), "slug": slug.current,
  "description": coalesce(excerpt.en, excerpt),
  "image": thumbnail ${_imageAsset}
}`;

// --------------- Journal ---------------

export const journalFeedQuery = `*[_type == "journalEntry"] | order(date desc){
  _id, "title": coalesce(title.en, title), "slug": slug.current, date,
  "excerpt": coalesce(excerpt.en, excerpt),
  "coverImage": coverImage ${_imageAsset}
}`;

export const journalBySlugQuery = `*[_type == "journalEntry" && slug.current == $slug][0]{
  _id, "title": coalesce(title.en, title), "slug": slug.current, date,
  "excerpt": coalesce(excerpt.en, excerpt),
  "body": coalesce(body.en, body),
  "coverImage": coverImage ${_imageAsset}
}`;
