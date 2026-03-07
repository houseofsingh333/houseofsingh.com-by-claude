import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for the House of Singh website — conditions for using this site and its content.",
};

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="mb-10">
      <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
        {label}
      </p>
      <div className="w-full h-px bg-border" />
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="overflow-hidden">
      <section className="px-6 md:px-16 page-top-offset section-pb">
        <div className="max-w-2xl">
          <h1 className="font-editorial text-3xl md:text-4xl font-light mb-4">
            Terms of Use
          </h1>
          <p className="text-sm text-muted-foreground mb-16">
            Last updated: March 2026
          </p>

          <SectionDivider label="Use of This Website" />
          <div className="space-y-4 text-sm md:text-[15px] text-muted-foreground leading-[1.8] mb-16">
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
          </div>

          <SectionDivider label="Intellectual Property" />
          <div className="space-y-4 text-sm md:text-[15px] text-muted-foreground leading-[1.8] mb-16">
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
              <a href="/contact" className="text-foreground underline underline-offset-4">
                contact page
              </a>
              .
            </p>
          </div>

          <SectionDivider label="Limitation of Liability" />
          <div className="space-y-4 text-sm md:text-[15px] text-muted-foreground leading-[1.8] mb-16">
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
          </div>

          <SectionDivider label="External Links" />
          <div className="space-y-4 text-sm md:text-[15px] text-muted-foreground leading-[1.8] mb-16">
            <p>
              This site may contain links to third-party websites. These links
              are provided for convenience and do not imply endorsement. House
              of Singh is not responsible for the content or privacy practices
              of external sites.
            </p>
          </div>

          <SectionDivider label="Governing Law" />
          <div className="space-y-4 text-sm md:text-[15px] text-muted-foreground leading-[1.8] mb-16">
            <p>
              These terms are governed by the laws of the Province of Ontario,
              Canada. Any disputes arising from the use of this website shall
              be subject to the exclusive jurisdiction of the courts of
              Ontario.
            </p>
          </div>

          <SectionDivider label="Changes to These Terms" />
          <div className="space-y-4 text-sm md:text-[15px] text-muted-foreground leading-[1.8]">
            <p>
              We may update these terms from time to time. Continued use of the
              website after changes are posted constitutes acceptance of the
              revised terms.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
