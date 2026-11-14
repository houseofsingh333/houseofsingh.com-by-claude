# The Sanity Studio registration

The Studio for this site (the workspace `houseofsingh-studio`) is registered with Sanity once. Every `npx sanity@latest schema deploy` and `npx sanity@latest deploy` goes to that one registration, pinned in `sanity.cli.ts` as `deployment.appId`.

## Why this matters

On 12 Nov 2026 Sanity listed **two** registrations under the same workspace name:

| Application id | Created | Schema |
|---|---|---|
| `fskxqjztrs8832zg24aemo58` | 26 Jul 2026 | current: the Shop, email queue, redirects, everything since |
| `uvucw196entvycs92o2wiueg` | 16 Feb 2026 | stale: none of the Shop's types |

Tools that check content against the schema look it up by workspace name. With two registrations they could not tell which one is right, so they refused to check anything. There was also an old copy of the schema saved in the dataset itself (`_.schemas.houseofsingh-studio`), from before Sanity's Studio registrations existed.

## The fix

**In code (done):** `sanity.cli.ts` pins the July registration, so no deploy can create or update another.

**In sanity.io/manage (Maninder, once):**
1. Open project 31g7gu7n, then the **Studios** tab.
2. Find the Studio with application id `uvucw196entvycs92o2wiueg`, created 16 Feb 2026. Its address contains that id.
3. Open its menu (the three dots), then **Delete** (or **Unregister**). Keep `fskxqjztrs8832zg24aemo58`.
4. If Studios lists a hosted address (`houseofsingh.sanity.studio`) under the old id, check you do not use that address. The Studio you use is at `houseofsingh.com/studio`.

**Then, in Terminal in the project folder:**

```
npx sanity@latest schema deploy
```

This writes the current schema to the one remaining registration. I then remove the old saved copy and confirm that Sanity's tools see a single, current schema.

## Where things are in the Studio

The sidebar has five groups (approved 13 Nov; `src/sanity/structure.ts`). Only where things are found and what they are called changed: no type, field or document was renamed, moved or removed.

| Group | What is in it |
|---|---|
| **Inbox** | Every message sent through the site: New, Replied and reviewed, Archived, each type (Commercial project, Collaboration, Press, Shop artists, Something else), then each form (Contact messages, Project interest, For artists proposals). |
| **Website** | Home (Home slides, Spotlight), About, Projects, Journal, Contact page. |
| **Shop** | Collection, Pieces, Collaborators, Orders (Check tax, To make, Being made, Shipped, Refunded, All orders), Shop settings (Shop settings, Shipping rates, Categories), Small supplier tracker. |
| **Settings** | Site settings, Navigation, Content rules, Redirects. |
| **System** | The records the site keeps by itself: Newsletter records, Emails waiting to send, Sign ups waiting for Kit, Collectors, Notify me records, and every Navigation document. |

**Single pages open straight into their form:** About, Contact page, Spotlight, Site settings, Navigation, Shop settings, Shipping rates and the Small supplier tracker. Each opens the very document the website reads (the first published one of its type), and none is offered as new or can be duplicated.

**Tabs on the long forms:** About (Intro, Practice, Journey, Featured on, Rapid fire, Search), Project (Story, Photographs, Homepage, Search), Journal entry (Writing, Photographs, Search) and Site settings (Homepage chapters, Menu, Projects page, Journal page, 404 page, Privacy and Terms, General, Search). The first tab opens first; "All fields" still shows everything at once. `scripts/guardrails-test.ts` fails if a type has no place in the sidebar or a field is left out of every tab.
