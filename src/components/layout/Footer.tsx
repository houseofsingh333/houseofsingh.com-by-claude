"use client";

import { useState } from "react";
import Link from "next/link";
import type { InstagramPhoto } from "@/components/contact/InstagramPhotoPlate";
import FooterInstagram from "./FooterInstagram";

type Props = {
  items?: unknown[];
  instagramPhotos?: InstagramPhoto[];
};

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
];

export default function Footer({ instagramPhotos = [] }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer-redesign">
      {/* Top border */}
      <div className="footer-top-rule" />

      {/* ——— Main three-column area ——— */}
      <div className="footer-main">
        {/* Left Column: Navigation */}
        <nav className="footer-nav-col">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="footer-nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Center Column: Instagram Crossfade */}
        <div className="footer-center-col">
          {instagramPhotos.length > 0 && (
            <FooterInstagram photos={instagramPhotos} />
          )}
        </div>

        {/* Right Column: CTA + Branding */}
        <div className="footer-right-col">
          {/* Top: CTA Block */}
          <div className="footer-cta-block">
            <Link href="/contact" className="footer-cta-link">
              <span className="footer-cta-text">Start a project</span>
              <span className="footer-cta-arrow">&rarr;</span>
            </Link>
            <p className="footer-cta-subtitle">
              Let&rsquo;s talk about a project, collaboration or an idea you may
              have
            </p>
          </div>

          {/* Bottom: Logo + Tagline */}
          <div className="footer-brand-block">
            <img
              src="/images/hos-logo.svg"
              alt="House of Singh"
              className="footer-crest"
            />
            <p className="footer-tagline">Made by AI. Curated by humans.</p>
          </div>
        </div>
      </div>

      {/* ——— Bottom Bar ——— */}
      <div className="footer-bottom-spacer" />
      <div className="footer-bottom-rule" />
      <div className="footer-bottom-bar">
        {/* Left: Copyright + legal */}
        <div className="footer-legal">
          <span className="footer-legal-item">
            &copy; 2026 HOUSE OF SINGH
          </span>
          <Link href="/privacy" className="footer-legal-link">
            PRIVACY
          </Link>
          <Link href="/terms" className="footer-legal-link">
            TERMS
          </Link>
        </div>

        {/* Center: Newsletter */}
        <div className="footer-newsletter">
          {status === "success" ? (
            <span className="footer-newsletter-label">Thank you</span>
          ) : (
            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
              <span className="footer-newsletter-label">NEWSLETTER</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email for newsletter"
                className="footer-newsletter-input"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="footer-newsletter-btn"
              >
                {status === "loading" ? "..." : "SUBSCRIBE"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="footer-newsletter-error">
              Something went wrong. Try again.
            </p>
          )}
        </div>

        {/* Right: Back to top */}
        <button onClick={scrollToTop} className="footer-top-btn" type="button">
          TOP <span>↑</span>
        </button>
      </div>

      {/* Bottom padding */}
      <div style={{ height: 28 }} />
    </footer>
  );
}
