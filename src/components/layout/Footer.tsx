import Link from "next/link";
import OutlineCta from "@/components/OutlineCta";
import TorontoTime from "@/components/TorontoTime";
import type { SiteCopy } from "@/lib/siteCopy";
import FooterNewsletter from "./FooterNewsletter";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
];

const INSTAGRAM = "https://www.instagram.com/houseofsingh";

export type FooterCopy = Pick<
  SiteCopy,
  | "codaInvite"
  | "codaTimeLabel"
  | "codaBookLabel"
  | "codaWriteLabel"
  | "codaPagesLabel"
  | "codaNewsletterLabel"
  | "codaNewsletterPlaceholder"
  | "codaNewsletterThanks"
  | "menuInstagram"
>;

/**
 * The coda. Above the footer, on every page, the closing section (canvas
 * "Closing section", frame "A, chosen: a quiet invitation, Toronto time,
 * book a call"): the invitation in Playfair on the left; on the right the
 * time in Toronto, "Book a call" (the outlined call to action, opening the
 * booking address in a new tab) and a quiet link to the Contact page.
 * Then the footer (canvas "Footer", frames FINAL desktop and FINAL phone),
 * unchanged: under a hairline, "Pages" and the page names (one row on desktop, two columns on
 * phone, where Instagram joins them) and the newsletter; the legal line,
 * the smallest text on the site, right aligned on desktop and at the very
 * bottom on phone. Every link draws the shared hairline.
 */
export default function Footer({ copy, bookUrl }: { copy: FooterCopy; bookUrl: string }) {
  return (
    <footer className="footer-wrap">
      <div className="footer-main">
        <div className="footer-top">
          <p className="footer-invite">{copy.codaInvite}</p>
          <div className="footer-reach">
            <p className="footer-time">
              <span className="footer-time-label">{copy.codaTimeLabel}</span>
              <TorontoTime className="footer-time-value" />
            </p>
            <div className="footer-actions">
              <OutlineCta href={bookUrl} label={copy.codaBookLabel} className="footer-book" />
              <Link href="/contact" className="footer-write hairline">
                {copy.codaWriteLabel}
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-grid">
          <nav aria-labelledby="footer-pages" className="footer-pages">
            <span id="footer-pages" className="footer-label">
              {copy.codaPagesLabel}
            </span>
            <ul className="footer-nav" role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-nav-link hairline">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="footer-nav-phone">
                <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="footer-nav-link hairline">
                  {copy.menuInstagram}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </nav>
          <FooterNewsletter
            label={copy.codaNewsletterLabel}
            placeholder={copy.codaNewsletterPlaceholder}
            thanks={copy.codaNewsletterThanks}
          />
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-bottom-copyright">&copy; 2026 House of Singh</span>
        <Link href="/privacy" className="footer-bottom-link hairline">
          Privacy
        </Link>
        <Link href="/terms" className="footer-bottom-link hairline">
          Terms
        </Link>
      </div>
    </footer>
  );
}
