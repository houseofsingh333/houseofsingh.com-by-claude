import Link from "next/link";
import type { Metadata, ResolvingMetadata } from "next";
import { fullTitle } from "@/lib/page-title";
import { shareCard } from "@/lib/share-metadata";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";

const TITLE = "Terms of Use";
const DESCRIPTION =
  "The conditions for using the House of Singh website and its content.";

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical: "/terms",
    },
    ...(await shareCard(parent, fullTitle(TITLE), DESCRIPTION)),
  };
}

/*
 * Each "short" is an In short line written strictly from that section's own
 * text. The section text itself is unchanged.
 */
const SECTIONS: LegalSection[] = [
  {
    id: "use",
    title: "Use of this website",
    short: "the site is for information and portfolio purposes. Browse freely, but do not scrape or copy it with automated tools.",
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
    short: "the work on this site belongs to Maninder Singh / House of Singh. Ask before using any of it commercially.",
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
          <Link href="/contact" className="text-foreground underline underline-offset-4">
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
    short: "the site is provided as is, without guarantees.",
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
    short: "links to other sites are not endorsements, and their content is their own.",
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
    short: "these terms follow the laws of Ontario, Canada.",
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
    short: "these terms may change, and using the site after a change means accepting it.",
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

export default function TermsPage() {
  return <LegalPage title="Terms of Use" updated="Last updated: March 2026" sections={SECTIONS} />;
}
