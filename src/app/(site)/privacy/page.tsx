import Link from "@/components/Link";
import type { Metadata, ResolvingMetadata } from "next";
import { fullTitle } from "@/lib/page-title";
import { PRIVACY_UPDATED } from "@/lib/legalDates";
import { PRIVACY_DESCRIPTION } from "@/lib/pageDescriptions";
import { shareCard } from "@/lib/share-metadata";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";
import { siteCopy, type CopyKey } from "@/lib/siteCopy";
import { sanityFetch } from "@/sanity/fetch";
import { siteSettingsQuery } from "@/sanity/queries";
import type { SiteSettings } from "@/lib/types";

const TITLE = "Privacy Policy";
/** The mailing address the newsletter and Notify me name, as Canada's anti spam law asks (EMAIL_POSTAL_ADDRESS, the same line every email carries). */
const POSTAL_ADDRESS = process.env.EMAIL_POSTAL_ADDRESS?.trim() || "";
const DESCRIPTION = PRIVACY_DESCRIPTION;

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical: "/privacy",
    },
    ...(await shareCard(parent, fullTitle(TITLE), DESCRIPTION)),
  };
}

/*
 * Each section's In short line is editable in Site Settings, Privacy and
 * Terms (lib/siteCopy.ts holds today's text, written strictly from that
 * section's own text). The section text itself is unchanged.
 */
const SECTIONS: (Omit<LegalSection, "short"> & { short: CopyKey })[] = [
  {
    id: "overview",
    title: "Overview",
    short: "privacyShortOverview",
    body: (
      <>
        <p>
          House of Singh is the personal brand and creative platform of
          Maninder Singh, a creative director, photographer and
          multidisciplinary designer based in Toronto, Canada. This policy
          explains what information this website collects, where it is
          kept, and how it is used.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    short: "privacyShortCollect",
    body: (
      <>
        <p>
          <strong className="text-foreground">Contact form.</strong>{" "}
          The contact form asks what brings you here (a commercial
          project, a collaboration, a media or feature request, or
          something else), your name, your email address and, if you
          choose, a phone number. It then asks a few questions that depend
          on your choice:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Commercial project: the project name, a short description, a
            rough budget, a timeline, and how you found this site.
          </li>
          <li>
            Collaboration: the kind of collaboration, a link to your work
            and where to find you online (both optional), your idea, a
            timeline, and how you found this site.
          </li>
          <li>
            Media or feature: the outlet or organization, the type of
            inquiry, any deadline or event date, your request, and how you
            found this site.
          </li>
          <li>Something else: your message.</li>
        </ul>
        <p>
          When you submit, your answers are saved in Sanity together with
          the time of submission.
        </p>
        <p>
          <strong className="text-foreground">Project interest form.</strong>{" "}
          Some upcoming project pages include a short form. It collects
          your name, your email address, a phone number and an Instagram
          handle (both optional), and your story or nomination. The title
          of the project page and the time of submission are saved with
          it in Sanity.
        </p>
        <p>
          <strong className="text-foreground">Newsletter.</strong>{" "}
          The newsletter signup in the footer and in the newsletter window
          collects your email address only. It is kept in Kit, the service
          that holds our list and sends the letters, together with the
          words you agreed to beneath the field, where you signed up and
          when. A welcome email is sent at once through Resend. If Kit
          cannot be reached at that moment, your signup is held privately
          in Sanity and passed to Kit as soon as it can be, then deleted
          from Sanity.
        </p>
        <p>
          <strong className="text-foreground">The Shop: Notify me.</strong>{" "}
          Notify me, on the House of Singh Editions pages, collects your
          email address and which Collection you want to hear about. It is
          kept in Kit with that Collection, the words you agreed to, where
          and when, and a confirmation is sent at once through Resend.
        </p>
        {POSTAL_ADDRESS && (
          <p>
            <strong className="text-foreground">Who sends these emails.</strong>{" "}
            The newsletter comes from Maninder Singh at House of Singh, and
            Notify me from House of Singh Editions, both in Toronto. Our
            mailing address is {POSTAL_ADDRESS}. You can unsubscribe from
            any email at any time, or write to us through the{" "}
            <Link href="/contact" className="text-foreground hairline-rest">
              contact page
            </Link>
            .
          </p>
        )}
        <p>
          <strong className="text-foreground">The Shop: orders.</strong>{" "}
          When you buy a piece, payment happens on Stripe&apos;s checkout
          page: your card details go to Stripe and never reach this site.
          Stripe passes us your name, email address and shipping address,
          and what you bought (the piece, its size, where it ships, the
          price and shipping). Pieces are sold by Maninder Singh, operating
          as House of Singh Editions. We keep that order privately in Sanity,
          with the collector number we give each buyer and, for numbered
          pieces, the certificate code. Emails about your order (the
          confirmation, the certificate, when it is being made and when it
          ships, with tracking) are sent through Resend.
        </p>
        <p>
          <strong className="text-foreground">The Shop: collaboration proposals.</strong>{" "}
          The proposal form for artists collects your name, email address,
          what you make, a link to your work if you give one, and your
          idea. It is kept privately in Sanity; you receive an email that
          it arrived, and a copy goes to Maninder, through Resend.
        </p>
        <p>
          <strong className="text-foreground">Protection against abuse.</strong>{" "}
          To stop repeated automated submissions, the server counts how
          many times each IP address has sent one of these forms in the
          last ten minutes. This count is held only in the server&apos;s
          memory and is not saved.
        </p>
        <p>
          <strong className="text-foreground">Page performance.</strong>{" "}
          This site uses Vercel Speed Insights to measure how quickly
          pages load. It does not use cookies and does not build a profile
          of you.
        </p>
      </>
    ),
  },
  {
    id: "saved-progress",
    title: "Saved progress on the contact form",
    short: "privacyShortProgress",
    body: (
      <>
        <p>
          While you fill in the contact form, your answers are saved in
          your own browser so you can pick up where you left off. This
          draft stays on your device and is not sent to anyone until you
          submit the form.
        </p>
        <p>
          The draft is deleted from your browser when your message is sent.
          If you come back to an unfinished draft, a Clear saved progress
          button appears once you move past the first question and deletes
          it. Clearing this site&apos;s data in your
          browser removes it too.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    short: "privacyShortUse",
    body: (
      <>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Reply to messages sent through the contact form</li>
          <li>Reply to project interest submissions</li>
          <li>Send newsletter updates to people who have signed up</li>
          <li>Tell people who asked when a Collection opens, and about its early access</li>
          <li>Take payment for, make, ship and support Shop orders, and send the emails about them</li>
          <li>Reply to collaboration proposals</li>
          <li>See how quickly pages load and improve them</li>
        </ul>
        <p>
          We do not sell, rent, or share your personal information with
          third parties for marketing purposes.
        </p>
      </>
    ),
  },
  {
    id: "leaving-the-newsletter",
    title: "Leaving the newsletter",
    short: "privacyShortNewsletter",
    body: (
      <>
        <p>
          Every letter, and every email about a Collection, has a link to
          unsubscribe at the bottom: one click removes you. You can also
          send a message through the{" "}
          <Link href="/contact" className="text-foreground hairline-rest">
            contact page
          </Link>{" "}
          at houseofsingh.com/contact asking to unsubscribe, and you will
          be removed. Emails about an order you placed are not newsletters
          and still reach you.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and browser storage",
    short: "privacyShortCookies",
    body: (
      <>
        <p>
          This website uses no advertising or tracking scripts. Its pages
          set no cookies of their own, with one exception in the Shop: if
          you open an early access link or enter an early access code, a
          cookie remembers for sixty days that your code was valid (a
          fingerprint of the code, not the code itself), so the Collection
          stays open to you. A second cookie of the same kind exists only
          for the site&apos;s owner, to preview the Shop before it opens. Besides the contact form draft described
          above, it keeps two small notes in your browser&apos;s session
          storage, which is cleared when you close the tab: one so the
          opening animation plays only once per visit, and one so a scroll
          hint on the home page appears only once.
        </p>
        <p>
          It also keeps one note in your browser&apos;s local storage: which
          view of the Projects page you last chose, One by one or At a
          glance, so the page opens the same way next time. It holds nothing
          else, and clearing your browser&apos;s site data removes it.
        </p>
        <p>
          The Spotify player on the home page may set its own cookies, as
          described below.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third party services",
    short: "privacyShortThirdParties",
    body: (
      <>
        <p>This website relies on the following services:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Vercel</strong>: hosts the website and
            serves every page, and provides Speed Insights.
          </li>
          <li>
            <strong className="text-foreground">Sanity</strong>: stores the site&apos;s
            content and images, and keeps contact form and project interest
            submissions, Shop orders and collaboration proposals privately.
          </li>
          <li>
            <strong className="text-foreground">Kit</strong>: holds the newsletter list and
            the Shop&apos;s Notify me list, and sends the letters and the emails
            about each Collection.
          </li>
          <li>
            <strong className="text-foreground">Resend</strong>: sends the emails this website
            triggers, one person at a time: newsletter welcomes, Notify me
            confirmations, order emails and proposal acknowledgements.
          </li>
          <li>
            <strong className="text-foreground">Stripe</strong>: takes payment for Shop orders
            on its own checkout page, and holds the card details, which never
            reach this site.
          </li>
          <li>
            <strong className="text-foreground">Spotify</strong>: the playlist player on
            the home page. It loads from Spotify when you scroll to it, and
            Spotify may set its own cookies once it loads or when you use
            it. When you reach the music section, the home page also loads
            Spotify&apos;s player script, which tells the page when the music
            is playing so the record can turn. See the{" "}
            <a
              href="https://www.spotify.com/legal/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hairline-rest"
            >
              Spotify privacy policy
            </a>
            .
          </li>
        </ul>
        <p>
          Each of these services has its own privacy policy governing how
          it handles data. Links to social profiles such as Instagram take
          you to those sites, which have their own policies.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    short: "privacyShortContact",
    body: (
      <>
        <p>
          If you have questions about this privacy policy or how your data
          is handled, please reach out through the{" "}
          <Link href="/contact" className="text-foreground hairline-rest">
            contact page
          </Link>
          .
        </p>
      </>
    ),
  },
];

export default async function PrivacyPage() {
  const settings = await sanityFetch<SiteSettings | null>({ query: siteSettingsQuery });
  const copy = siteCopy(settings);
  const sections = SECTIONS.map((section) => ({ ...section, short: copy[section.short] }));
  return <LegalPage title="Privacy Policy" updated={PRIVACY_UPDATED.label} sections={sections} labels={{ contents: copy.legalContentsLabel, inShort: copy.legalShortPrefix }} />;
}
