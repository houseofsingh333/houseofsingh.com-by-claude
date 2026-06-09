/**
 * Root Sanity config — required by the Sanity CLI for commands like
 * `sanity schema deploy`. Re-exports the embedded studio config so
 * there is a single source of truth for schema types and project settings.
 */
export { default } from "./src/sanity/studio";
