"use client";

import { useState } from "react";
import Link from "next/link";
import type { InstagramPhoto } from "@/components/contact/InstagramPhotoPlate";
import FooterInstagram from "./FooterInstagram";
import HoneypotField from "@/components/HoneypotField";
import { HONEYPOT_FIELD } from "@/lib/spam-protection";

type Props = {
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
  const [company, setCompany] = useState(""); // honeypot
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
        body: JSON.stringify({ email: email.trim(), [HONEYPOT_FIELD]: company }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      setEmail("");
      setCompany("");
    } catch {
      setStatus("error");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer-wrap">
      {/* Rule */}
      <div className="footer-rule" />

      {/* Main Content — Three Columns */}
      <div className="footer-main">
        {/* TOP button — positioned absolutely on desktop */}
        <button
          onClick={scrollToTop}
          className="footer-top-btn"
          type="button"
        >
          TOP <span>↑</span>
        </button>
        <div className="footer-grid">
          {/* Left Column: Crest + CTA */}
          <div className="footer-col-left">
            <img
              src="/images/hos-logo.svg"
              alt="House of Singh"
              className="footer-crest"
            />
            <Link href="/contact" className="footer-cta-link">
              <span className="footer-cta-heading">Start a project</span>
              <span className="footer-cta-arrow">&rarr;</span>
            </Link>
            <p className="footer-cta-subtitle">
              Let&rsquo;s talk about a project, collaboration or an idea you may
              have
            </p>
          </div>

          {/* Center Column: Nav + Newsletter */}
          <div className="footer-col-center">
            <nav className="footer-nav">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="footer-nav-link"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="footer-newsletter">
              <span className="footer-nl-label">NEWSLETTER</span>
              {status === "success" ? (
                <span className="footer-nl-thanks">Thank you</span>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="footer-nl-form"
                >
                  <HoneypotField value={company} onChange={setCompany} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Get the latest stories and updates"
                    aria-label="Email for newsletter"
                    className="footer-nl-input"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="footer-nl-btn"
                  >
                    <span className="footer-nl-arrow">
                      {status === "loading" ? "..." : "\u2192"}
                    </span>
                  </button>
                </form>
              )}
              {status === "error" && (
                <p className="footer-nl-error">
                  Something went wrong. Try again.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Instagram (mobile only) */}
          <div className="footer-col-right">
            {instagramPhotos.length > 0 && (
              <a
                href="https://www.instagram.com/houseofsingh"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-ig-link group"
              >
                <FooterInstagram photos={instagramPhotos} />
              </a>
            )}
            {/* Mobile-only: simple Instagram text link */}
            <a
              href="https://www.instagram.com/houseofsingh"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-ig-mobile-link"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              @houseofsingh
            </a>
          </div>
        </div>
      </div>

      {/* Part 3: Bottom Bar */}
      <div className="footer-rule" />
      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <span className="footer-bottom-copyright">
            &copy; 2026 HOUSE OF SINGH
          </span>
          <div className="footer-bottom-legal">
            <Link href="/privacy" className="footer-bottom-link">
              PRIVACY
            </Link>
            <Link href="/terms" className="footer-bottom-link">
              TERMS
            </Link>
          </div>
        </div>
        <span className="footer-bottom-tagline">
          Made by AI. Curated by humans.
        </span>
        <button
          onClick={scrollToTop}
          className="footer-mobile-top-btn"
          type="button"
        >
          TOP <span>↑</span>
        </button>
      </div>
    </footer>
  );
}
