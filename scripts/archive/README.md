# Archived Sanity scripts

One time maintenance scripts from building the site. They are kept as a
record of what was done to the content, not as part of the website: nothing
in the site, the build or CI runs them, and Vercel never executes them.

They run **locally only**, from a developer's machine, with Node and a Sanity
token that can write to the dataset. Read a script's header comment before
running it: each one changes content in Sanity, and each header explains its
options (several have a `--dry-run` mode that changes nothing).

| Script | What it did |
|---|---|
| `migrate-flatten-bilingual.mjs` | Migrated content when the site dropped bilingual fields: for navigation, hero slides and the other affected types, it replaced each `{ en, pa }` object with its English value as a plain string. |
| `import-journal-entries.mjs` | Bulk imported journal entries from a CSV file and a folder of photos: uploaded each photo as a Sanity image asset and created the journal entry with its title, slug, date, excerpt, body, cover image (with alt text and caption) and SEO fields. |
| `delete-import-drafts.mjs` | Cleaned up after an import test: deleted the draft journal entries the test created, and only drafts whose ids match the import patterns. |
| `upload-project-assets.mjs` | Bulk uploaded a folder of project photos to Sanity's media library, titled by project so they cluster together, with optional alt text and titles from a CSV. It creates image assets only, no documents. |
| `content-fixes.mjs` | The content fixes of the search and structured data pass (Q5): a dry run prints every change; with `--apply` and a write token it patches only the listed fields, skipping any that already hold the new value. |

Tokens are read from environment variables (`SANITY_API_TOKEN` or
`SANITY_AUTH_TOKEN`) and must never be committed.
