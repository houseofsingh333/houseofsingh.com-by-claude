import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for House of Singh — how we collect, use, and protect your information.",
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

export default function PrivacyPage() {
  return (
    <div className="overflow-hidden">
      <section className="px-6 md:px-16 page-top-offset section-pb">
        <div className="max-w-2xl">
          <h1 className="font-editorial text-3xl md:text-4xl font-light mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-16">
            Last updated: March 2026
          </p>

          <SectionDivider label="Overview" />
          <div className="space-y-4 text-sm md:text-[15px] text-muted-foreground leading-[1.8] mb-16">
            <p>
              House of Singh is a personal brand and creative studio operated by
              Maninder Singh, based in Toronto, Canada. This policy explains how
              we handle information collected through this website.
            </p>
            <p>
              We respect your privacy and collect only what is necessary to
              provide a good experience.
            </p>
          </div>

          <SectionDivider label="Information We Collect" />
          <div className="space-y-4 text-sm md:text-[15px] text-muted-foreground leading-[1.8] mb-16">
            <p>
              <strong className="text-foreground">Contact form submissions.</strong>{" "}
              When you use the contact form, we collect your name, email
              address, and message content. This information is used solely to
              respond to your inquiry.
            </p>
            <p>
              <strong className="text-foreground">Newsletter signups.</strong>{" "}
              If you subscribe to our newsletter, we collect your email address
              to send periodic updates about projects, journal posts, and studio
              news. You can unsubscribe at any time.
            </p>
            <p>
              <strong className="text-foreground">Analytics data.</strong>{" "}
              We use Vercel Analytics and Speed Insights to understand how
              visitors use this site. These tools collect anonymous,
              privacy-friendly usage data such as page views and performance
              metrics. No personally identifiable information is tracked.
            </p>
          </div>

          <SectionDivider label="How We Use Your Information" />
          <div className="space-y-4 text-sm md:text-[15px] text-muted-foreground leading-[1.8] mb-16">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Respond to inquiries submitted through the contact form</li>
              <li>Send newsletter updates to subscribers who have opted in</li>
              <li>Understand site usage and improve the experience</li>
            </ul>
            <p>
              We do not sell, rent, or share your personal information with
              third parties for marketing purposes.
            </p>
          </div>

          <SectionDivider label="Cookies" />
          <div className="space-y-4 text-sm md:text-[15px] text-muted-foreground leading-[1.8] mb-16">
            <p>
              This website uses minimal cookies necessary for site
              functionality. Vercel Analytics is privacy-focused and does not
              use cookies for tracking. We do not use advertising cookies or
              third-party tracking scripts.
            </p>
          </div>

          <SectionDivider label="Third-Party Services" />
          <div className="space-y-4 text-sm md:text-[15px] text-muted-foreground leading-[1.8] mb-16">
            <p>This website relies on the following third-party services:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">Vercel</strong> — hosting
                and analytics
              </li>
              <li>
                <strong className="text-foreground">Sanity</strong> — content
                management system
              </li>
            </ul>
            <p>
              Each of these services has its own privacy policy governing how
              they handle data.
            </p>
          </div>

          <SectionDivider label="Contact" />
          <div className="space-y-4 text-sm md:text-[15px] text-muted-foreground leading-[1.8]">
            <p>
              If you have questions about this privacy policy or how your data
              is handled, please reach out through the{" "}
              <a href="/contact" className="text-foreground underline underline-offset-4">
                contact page
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
