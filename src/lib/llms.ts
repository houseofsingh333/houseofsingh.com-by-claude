import type { PortableTextBlock } from "@portabletext/react";
import { sanityFetch } from "@/sanity/fetch";
import { llmsQuery } from "@/sanity/queries";
import { plainParagraphs } from "@/lib/portableText";
import { formatEntryDate } from "@/lib/dates";
import { JOURNAL_DESCRIPTION } from "@/lib/pageDescriptions";

/*
 * llms.txt and llms-full.txt: the site in plain text for language models
 * and answer engines (llmstxt.org). Everything after the fixed opening
 * (who is who, written once and kept consistent with
 * lib/structured-data.ts) comes from Sanity as it stands: nothing here
 * writes new copy about a project or an entry.
 */

const SITE_URL = "https://houseofsingh.com";

type Blocks = PortableTextBlock[] | null;

type LlmsProject = {
  title: string;
  slug: string;
  category?: string | null;
  year?: number | null;
  role?: string | null;
  excerpt?: string | null;
  shortIntro?: string | null;
  isUpcoming?: boolean | null;
  story?: Blocks;
  contentSections?: {
    _type: string;
    heading?: string | null;
    body?: Blocks;
    text?: string | null;
    quote?: string | null;
    attribution?: string | null;
    stickyText?: Blocks;
  }[] | null;
};

type LlmsEntry = { title: string; slug: string; date: string; excerpt?: string | null; author?: string | null; body?: Blocks };

type LlmsData = {
  about: {
    founderName?: string | null;
    founderRoles?: string[] | null;
    introQuote?: string | null;
    founderBio?: Blocks;
    bioPullQuote?: string | null;
    monikerText?: Blocks;
    milestones?: { year?: string | null; title?: string | null; text?: string | null }[] | null;
    featuredOn?: { name?: string | null; title?: string | null; date?: string | null; description?: string | null; url?: string | null }[] | null;
    rapidFire?: { question?: string | null; answer?: string | null }[] | null;
  } | null;
  projects: LlmsProject[] | null;
  entries: LlmsEntry[] | null;
};

/** The fixed opening, unchanged from the original public/llms.txt. */
const OPENING = `# House of Singh

> House of Singh is the creative practice of Maninder Singh, RGD, a Toronto based creative director, photographer and multidisciplinary designer. houseofsingh.com is his official personal website, portfolio and journal.

## Who is who

- Maninder Singh is a creative director, photographer and multidisciplinary designer based in Toronto, Canada, and a member of RGD (Registered Graphic Designers of Canada).
- House of Singh is his creative practice and parent brand, active under that name since 2014. HOUSE OF SINGH is a registered Canadian trademark.
- House of Singh Studios (studios.houseofsingh.com) is his design studio for brand identity, websites, photography and creative direction, founded in Canada in 2023. It is a venture of House of Singh.
- House of Singh and House of Singh Studios are not affiliated with other businesses that use similar names.

## About Maninder Singh

- His practice spans visual identity and photography, work that prioritizes depth over reach.
- He thinks in systems, designs with restraint, and photographs the things most people walk past.
- His approach: clarity over noise, craft over shortcuts. Film photography is part of his current practice.
- He led the TEDxToronto creative team.
- He is a judge for the RGD design awards and mentors through RGD and two Sikh organizations.
- He works from Toronto.

## Main pages

- [About](${SITE_URL}/about): The story, values and vision behind House of Singh, including Maninder Singh's background, milestones and a personal rapid fire Q&A.
- [Projects](${SITE_URL}/projects): Selected work across design, photography and creative direction.
- [Journal](${SITE_URL}/journal): Thoughts, process notes and stories from behind the scenes.
- [Contact](${SITE_URL}/contact): Inquiries for projects, collaborations and media features.`;

const PROFILES = `## Official profiles

- RGD: https://rgd.ca/members/profile/manindersingh
- LinkedIn: https://www.linkedin.com/in/manindersingh333
- Instagram: https://www.instagram.com/houseofsingh/
- X: https://x.com/houseofsingh
- Pinterest: https://ca.pinterest.com/houseofsingh`;

export async function loadLlmsData(): Promise<LlmsData> {
  const data = await sanityFetch<LlmsData | null>({ query: llmsQuery });
  return { about: data?.about ?? null, projects: data?.projects ?? [], entries: data?.entries ?? [] };
}

const clean = (s?: string | null) => (s ?? "").replace(/\s+/g, " ").trim();
const projectUrl = (p: LlmsProject) => `${SITE_URL}/projects/${p.slug}`;
const entryUrl = (e: LlmsEntry) => `${SITE_URL}/journal/${e.slug}`;

/** The project's facts as the page shows them: categories, year, role, upcoming. */
function projectFacts(p: LlmsProject): string {
  return [clean(p.category), p.year ? String(p.year) : "", clean(p.role), p.isUpcoming ? "Upcoming" : ""]
    .filter(Boolean)
    .join(", ");
}

/** A project's own summary: its excerpt, else its intro. */
function projectSummary(p: LlmsProject): string {
  return clean(p.excerpt) || clean(p.shortIntro);
}

/** llms.txt: the opening, then each project, the journal and its recent entries. */
export function buildLlmsTxt({ projects, entries }: LlmsData): string {
  const lines: string[] = [OPENING, "", "## Projects", ""];
  for (const p of projects ?? []) {
    const facts = projectFacts(p);
    const summary = projectSummary(p);
    lines.push(`- [${clean(p.title)}](${projectUrl(p)})${facts ? ` (${facts})` : ""}${summary ? `: ${summary}` : ""}`);
  }
  lines.push("", "## Journal", "", JOURNAL_DESCRIPTION, "", "Most recent entries:", "");
  for (const e of entries ?? []) {
    const excerpt = clean(e.excerpt);
    lines.push(`- [${clean(e.title)}](${entryUrl(e)}) (${formatEntryDate(e.date)})${excerpt ? `: ${excerpt}` : ""}`);
  }
  lines.push(
    "",
    PROFILES,
    "",
    "## Optional",
    "",
    `- [Full text](${SITE_URL}/llms-full.txt): About, every project and the twenty most recent journal entries in full.`,
    "",
  );
  return lines.join("\n");
}

/** Paragraphs of Portable Text, each on its own line with a blank line between. */
const paragraphs = (blocks?: Blocks) => plainParagraphs(blocks ?? null).map(clean).filter(Boolean);

/** llms-full.txt: the opening, then About, every project and the recent entries in full. */
export function buildLlmsFullTxt({ about, projects, entries }: LlmsData): string {
  const out: string[] = [OPENING, ""];

  if (about) {
    out.push("## About", "", `Source: ${SITE_URL}/about`, "");
    if (about.founderName) out.push(clean(about.founderName));
    if (about.founderRoles?.length) out.push(about.founderRoles.map(clean).join(", "));
    if (about.founderName || about.founderRoles?.length) out.push("");
    if (about.introQuote) out.push(`"${clean(about.introQuote)}"`, "");
    for (const p of paragraphs(about.founderBio)) out.push(p, "");
    if (about.bioPullQuote) out.push(`"${clean(about.bioPullQuote)}"`, "");
    for (const p of paragraphs(about.monikerText)) out.push(p, "");
    const milestones = (about.milestones ?? []).filter((m) => m.title || m.text);
    if (milestones.length) {
      out.push("### Journey", "");
      for (const m of milestones) {
        out.push(`- ${[clean(m.year), clean(m.title)].filter(Boolean).join(": ")}${m.text ? `. ${clean(m.text)}` : ""}`);
      }
      out.push("");
    }
    const featured = (about.featuredOn ?? []).filter((f) => f.name || f.title);
    if (featured.length) {
      out.push("### Featured on", "");
      for (const f of featured) {
        const head = [clean(f.name), clean(f.title)].filter(Boolean).join(", ");
        const when = f.date ? ` (${formatEntryDate(f.date)})` : "";
        out.push(`- ${head}${when}${f.description ? `: ${clean(f.description)}` : ""}${f.url ? ` ${f.url}` : ""}`);
      }
      out.push("");
    }
    const qa = (about.rapidFire ?? []).filter((q) => q.question && q.answer);
    if (qa.length) {
      out.push("### Rapid fire", "");
      for (const q of qa) out.push(`- ${clean(q.question)} ${clean(q.answer)}`);
      out.push("");
    }
  }

  out.push("## Projects", "");
  for (const p of projects ?? []) {
    out.push(`### ${clean(p.title)}`, "", `Source: ${projectUrl(p)}`);
    const facts = projectFacts(p);
    if (facts) out.push(facts);
    out.push("");
    if (p.excerpt) out.push(clean(p.excerpt), "");
    if (p.shortIntro) out.push(clean(p.shortIntro), "");
    for (const para of paragraphs(p.story)) out.push(para, "");
    for (const s of p.contentSections ?? []) {
      if (s.heading && clean(s.heading) !== clean(p.title)) out.push(`#### ${clean(s.heading)}`, "");
      for (const para of [...paragraphs(s.body), ...paragraphs(s.stickyText)]) out.push(para, "");
      if (s.text) out.push(clean(s.text), "");
      if (s.quote) out.push(`"${clean(s.quote)}"${s.attribution ? `, ${clean(s.attribution)}` : ""}`, "");
    }
  }

  out.push("## Journal", "", JOURNAL_DESCRIPTION, "", "The twenty most recent entries.", "");
  for (const e of entries ?? []) {
    out.push(`### ${clean(e.title)}`, "", `Source: ${entryUrl(e)}`, formatEntryDate(e.date), "");
    const body = paragraphs(e.body);
    if (e.excerpt && clean(e.excerpt) !== body[0]) out.push(clean(e.excerpt), "");
    for (const para of body) out.push(para, "");
  }

  out.push(PROFILES, "");
  return out.join("\n");
}
