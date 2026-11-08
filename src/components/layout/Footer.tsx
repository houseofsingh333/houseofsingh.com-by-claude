import Link from "next/link";
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

/**
 * The coda: "Start a project" at monumental size with its line, the time
 * in Toronto, the site links and the newsletter, and a bottom line with the
 * copyright, Privacy and Terms.
 */
export default function Footer({ copy }: { copy: Pick<SiteCopy, "codaCta" | "codaLine" | "codaTimeLabel"> }) {
  return (
    <footer className="footer-wrap">
      <div className="footer-main">
        <div className="footer-top">
          <div className="footer-cta">
            <Link href="/contact" className="footer-cta-link hairline">
              {copy.codaCta}
            </Link>
            <p className="footer-cta-subtitle">{copy.codaLine}</p>
          </div>
          <p className="footer-time">
            <span className="footer-time-label">{copy.codaTimeLabel}</span>
            <TorontoTime className="footer-time-value" />
          </p>
        </div>

        <div className="footer-grid">
          <nav aria-label="Footer" className="footer-nav">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="footer-nav-link hairline">
                {link.label}
              </Link>
            ))}
          </nav>
          <FooterNewsletter />
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
