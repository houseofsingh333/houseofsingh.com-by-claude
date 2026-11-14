# Importing content from the HOS-content folder

One tool, `scripts/import-content.mjs`, adds and updates the website's content from a folder on your computer.

**What it fills:**
- the Home slides (the first is the menu's photograph for Home);
- projects;
- Journal entries;
- the Journey and "Featured on" on the About page;
- the Shop's artists.

House of Singh Editions pieces and collections come later; for now they are made in the Studio.

**What it does to photographs:** it prepares every photograph and checks it, then shows you everything before it changes anything.

## 1. The folder

```
HOS-content/
  hero/
    01-port-credit/        item.md + one photograph
    02-the-studio/
  projects/
    zamana/                item.md + cover.jpg, 01.jpg, 02.jpg ...
  journal/
    the-saddle/            item.md + cover.jpg (and any others)
  journey/
    2026-horse-riding/     item.md + photo.jpg
  featured/
    mensxp/                item.md + logo.png, image.jpg
  collaborators/
    jaspreet-kaur/         item.md + portrait.jpg
```

**Items.** Each item is a folder holding its `item.md` and its photographs.

**Folder names.** The folder's name is the item's address. `projects/zamana` becomes houseofsingh.com/projects/zamana. For hero slides and milestones, a number at the start sets the order and is not part of the name.

**Folders the tool skips:**
- **"_" at the start of the name:** for example `_drafts` or `_old-zamana`. Use this for anything not ready.
- **Unknown section folders:** reported and skipped.

**Photographs:** JPEG, PNG, HEIC (straight from an iPhone), TIFF and WebP are all accepted.

## 2. item.md

Copy the template for the section from `docs/content-import/` (for example `docs/content-import/projects/item.md`) into the item's folder and fill it in. An item.md has two parts:

1. **The details**, between two lines of `---`, one per line as `name: value`.
2. **The text**, after the second `---`, written as plain paragraphs separated by an empty line. You can use `**bold**`, `*italic*`, `[a link](https://...)`, `## a heading`, lists starting with `- `, and quotes starting with `> `.

Photographs are listed under `images`, one per line, in this form:

```
images:
  - cover.jpg | What the photograph shows | An optional caption
  - 02.jpg | decorative
```

**The three parts of a line:** the file name, then the alt text, then (optional) a caption.

**Alt text** describes the photograph for someone who cannot see it. Write `decorative` instead only for a photograph that adds nothing to understanding, such as a texture.

**Photographs not listed are not imported.** The dry run tells you which ones.

## 3. What it does to each photograph

**Before upload, every photograph:**
- is turned upright;
- is saved as a JPEG at quality 83 that loads progressively;
- keeps its colour profile;
- loses everything else: the location where it was taken (GPS), the camera and lens, dates and editing software.

**iPhone (HEIC) photographs:** they are in the wider Display P3 colour, and are labelled so their colours stay true.

**Logos:** a transparent logo stays a transparent PNG.

**Size report:** each file's size before and after is shown, with a total.

**Checks.** These warn and stop nothing:
- a hero under 2400 pixels wide, and any other photograph under 1600 pixels wide;
- a portrait photograph used as a hero (heroes are shown wide on a computer);
- a photograph that looks soft or blurred. This is a sharpness measure, and it can also flag photographs that are soft on purpose, such as fog or shallow focus;
- a source that was already heavily compressed (saved at low quality before).

**The one refusal:** a hero under 1600 pixels wide is refused. That item is skipped until the photograph is replaced; everything else goes ahead.

**Which photographs are heroes:** the homepage slides and each project's `cover.jpg`.

## 4. Run it

**First, a dry run.** It is the default, and it changes nothing. It lists every item as new, update, no change or skipped, with each photograph's size before and after, any checks to look at, and any problems:

```
node scripts/import-content.mjs "/path/to/HOS-content"
```

**Then publish:**

```
SANITY_WRITE_TOKEN=paste-the-token-here node scripts/import-content.mjs "/path/to/HOS-content" --apply
```

`--apply` publishes straight to the website. Check the dry run first.

**Options:**
- `--only projects` limits a run to one section.
- `--only projects/zamana,hero` limits it to one item and one section.
- `--replace` also removes what the folder no longer has: photographs missing from an item's list, and items missing from a section. The dry run shows each removal first. Without `--replace` nothing is ever deleted.

**The token.** It is read only from `SANITY_WRITE_TOKEN`, and never stored in the website's code. To make one:
1. Go to sanity.io/manage, open the project, then API, then Tokens, then Add API token.
2. Give it the Editor permission.
3. Keep it in your password manager. Never put it in a message, a file in the website's code, or a screenshot.

**Matching: never duplicated.** An item already on the website is updated, not added again. It is matched by:
- its address (projects, Journal, artists);
- its caption (hero slides);
- its year and title (milestones);
- its publication and title (Featured on).

A photograph already there (the same prepared file) is not uploaded again.

**Edits in the Studio.** If an item has unpublished edits waiting in the Studio, a dry run with the token set says so. Publishing from the folder does not touch that draft, so decide which version you want.

**HOS-content wins.** Fields you fill in item.md replace what the website has. Fields you leave out are left as they are.

## 5. The fields, section by section

Limits are the same as in the Studio.

### hero: the Home slides

Since the new opening (14 Nov) Home itself shows no slide: the first one, in order, is the menu's photograph for Home when Site settings sets none.

| Field | | Notes |
|---|---|---|
| folder name | required | Starts with its number: `01-port-credit`. The number is the slide's order. |
| `caption` | recommended | Shown on the slide. Also how the slide is matched. |
| `heading`, `subheading` | optional | |
| `link` | optional | A page on this site (`/about`) or a full `https://` address. |
| photograph | required | Exactly one, landscape, at least 2400 px wide (under 1600 px refused). Give its alt text as `alt:` or in `images`. A slide cannot be decorative. |

### projects

| Field | | Notes |
|---|---|---|
| folder name | required | The address: `zamana`. Or set `slug:`. |
| `title` | required | |
| `category` | required | One or more of Photography, Collaborations, Design, separated by commas. |
| `year` | optional | A whole number. |
| `role` | optional | Shown beside the category. |
| `shortIntro` | optional | Under the title. |
| `excerpt` | recommended | On the Projects page. |
| `featuredOnHomepage`, `homepageOrder`, `isUpcoming` | optional | true or false; a number; true or false. |
| text | optional | The project's story. |
| `cover.jpg` | recommended | The hero: landscape, at least 2400 px wide (under 1600 px refused). |
| other photographs | | The Photographs list, in the order listed, each with alt text and an optional caption. Layout is left on Auto. |

### journal: Journal entries

| Field | | Notes |
|---|---|---|
| folder name | required | The address: `the-saddle`. Or set `slug:`. |
| `title` | required | |
| `date` | required | Written `2026-07-05`. |
| `excerpt` | recommended | Shown in listings. |
| `author` | optional | |
| `seoTitle`, `seoDescription` | optional | At most 60 and 160 characters. |
| text | optional | The entry. `![](02.jpg)` on its own line places that photograph there. |
| `cover.jpg` | required | Or the first listed photograph: the entry's photograph. |
| other photographs | | Placed in the text where named, or else at the end. |

### journey: milestones on the About page

| Field | | Notes |
|---|---|---|
| folder name | | `2026-horse-riding`. |
| `year` | required | Four digits. |
| `title` | required | At most 30 characters. |
| `text` | optional | At most 75 characters. |
| `photo.jpg` | required | Exactly one. |

### featured: "Featured on" on the About page

| Field | | Notes |
|---|---|---|
| `name` | required | The publication. |
| `title` | optional | The feature's title. |
| `date` | optional | `2018-03-01`. |
| `description` | optional | One or two sentences. |
| `url` | optional | A full `https://` address. |
| `logo.png` | optional | The publication's logo. No width check; transparency kept. |
| `image.jpg` | optional | An image of the feature. |

### collaborators: the Shop's artists

| Field | | Notes |
|---|---|---|
| folder name | required | The address: `jaspreet-kaur`. |
| `name` | required | At most 60 characters. |
| `discipline`, `city` | optional | At most 40 characters each. |
| `links` | optional | One per line: `Instagram \| https://...`. |
| text | optional | About them, at most 600 characters (or `text:`). |
| `portrait.jpg` | optional | One photograph, with alt text (not decorative). |

## 6. Checking the tool

`node scripts/import-content-test.mjs` runs the tool's checks on test photographs it makes itself, without touching Sanity:
- the preparation;
- the warnings and the refusal;
- the reading of item.md;
- publishing, against a stand-in that records every write.

Add the path of an iPhone HEIC photograph to check HEIC too.
