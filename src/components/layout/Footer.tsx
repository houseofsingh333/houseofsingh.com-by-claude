"use client";

import { useState } from "react";
import Link from "next/link";
import type { InstagramPhoto } from "@/components/contact/InstagramPhotoPlate";
import FooterInstagram from "./FooterInstagram";

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
    <footer className="footer-wrap">
      {/* Part 1: Logo Crest — centered above footer content */}
      <div className="footer-crest-area">
        <img
          src="/images/hos-logo.svg"
          alt="House of Singh"
          className="footer-crest"
        />
      </div>

      {/* Rule below crest */}
      <div className="footer-rule" />

      {/* Part 2: Main Content — Three Columns */}
      <div className="footer-main">
        <div className="footer-grid">
          {/* Left Column: CTA */}
          <div className="footer-col-left">
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
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    aria-label="Email for newsletter"
                    className="footer-nl-input"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="footer-nl-btn"
                  >
                    {status === "loading" ? "..." : "SUBSCRIBE"}
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

          {/* Right Column: TOP ↑ + Instagram */}
          <div className="footer-col-right">
            <button
              onClick={scrollToTop}
              className="footer-top-btn"
              type="button"
            >
              TOP <span>↑</span>
            </button>
            {instagramPhotos.length > 0 && (
              <a
                href="https://www.instagram.com/houseofsingh"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-ig-link"
              >
                <FooterInstagram photos={instagramPhotos} />
              </a>
            )}
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
