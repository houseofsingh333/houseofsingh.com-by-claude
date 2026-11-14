import Link from "@/components/Link";
import type { Metadata, ResolvingMetadata } from "next";
import { fullTitle } from "@/lib/page-title";
import { TERMS_UPDATED } from "@/lib/legalDates";
import { TERMS_DESCRIPTION } from "@/lib/pageDescriptions";
import { shareCard } from "@/lib/share-metadata";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";
import { siteCopy, type CopyKey } from "@/lib/siteCopy";
import { sanityFetch } from "@/sanity/fetch";
import { siteSettingsQuery } from "@/sanity/queries";
import type { SiteSettings } from "@/lib/types";

/** The title in search results and share cards (approved 14 Nov); the page itself still says "Terms of Use". */
const SEARCH_TITLE = "Terms of Use for houseofsingh.com";
const DESCRIPTION = TERMS_DESCRIPTION;

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: SEARCH_TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical: "/terms",
    },
    ...(await shareCard(parent, fullTitle(SEARCH_TITLE), DESCRIPTION, "/terms")),
  };
}

/*
 * Each section's In short line is editable in Site Settings, Privacy and
 * Terms (lib/siteCopy.ts holds today's text, written strictly from that
 * section's own text). The section text itself is unchanged.
 */
const SECTIONS: (Omit<LegalSection, "short"> & { short: CopyKey })[] = [
  {
    id: "use",
    title: "Use of this website",
    short: "termsShortUse",
    body: (
      <>
        <p>
          This website is operated by Maninder Singh under the brand House
          of Singh, based in Toronto, Canada. By accessing and using this
          website, you agree to the following terms.
        </p>
        <p>
          This site is provided for informational and portfolio purposes.
          You may browse freely, but you may not use automated tools to
          scrape, copy, or reproduce the content without permission.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    short: "termsShortProperty",
    body: (
      <>
        <p>
          All content on this website — including but not limited to
          photography, design work, written content, logos, and branding —
          is the intellectual property of Maninder Singh / House of Singh
          unless otherwise noted.
        </p>
        <p>
          You may not reproduce, distribute, or use any content from this
          site for commercial purposes without prior written consent. If
          you would like to use or license any work, please get in touch
          through the{" "}
          <Link href="/contact" className="text-foreground hairline-rest">
            contact page
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    short: "termsShortLiability",
    body: (
      <>
        <p>
          This website and its content are provided &ldquo;as is&rdquo;
          without warranties of any kind, either express or implied.
          House of Singh does not guarantee that the site will be
          available at all times or that the information presented is
          completely accurate or up to date.
        </p>
        <p>
          House of Singh shall not be held liable for any damages arising
          from the use of or inability to use this website.
        </p>
      </>
    ),
  },
  {
    id: "external-links",
    title: "External links",
    short: "termsShortLinks",
    body: (
      <>
        <p>
          This site may contain links to third-party websites. These links
          are provided for convenience and do not imply endorsement. House
          of Singh is not responsible for the content or privacy practices
          of external sites.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law",
    short: "termsShortLaw",
    body: (
      <>
        <p>
          These terms are governed by the laws of the Province of Ontario,
          Canada. Any disputes arising from the use of this website shall
          be subject to the exclusive jurisdiction of the courts of
          Ontario.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    short: "termsShortChanges",
    body: (
      <>
        <p>
          We may update these terms from time to time. Continued use of the
          website after changes are posted constitutes acceptance of the
          revised terms.
        </p>
      </>
    ),
  },
];

export default async function TermsPage() {
  const settings = await sanityFetch<SiteSettings | null>({ query: siteSettingsQuery });
  const copy = siteCopy(settings);
  const sections = SECTIONS.map((section) => ({ ...section, short: copy[section.short] }));
  return <LegalPage title="Terms of Use" updated={TERMS_UPDATED.label} sections={sections} labels={{ contents: copy.legalContentsLabel, inShort: copy.legalShortPrefix }} />;
}
