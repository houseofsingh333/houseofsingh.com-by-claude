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
    <footer className="footer-wrap">
      {/* ——— Band 1: Full-width CTA ——— */}
      <div className="footer-band1">
        <Link href="/contact" className="footer-band1-link">
          <span className="footer-band1-heading">Start a project</span>
          <span className="footer-band1-arrow">&rarr;</span>
        </Link>
        <p className="footer-band1-subtitle">
          Let&rsquo;s talk about a project, collaboration or an idea you may
          have
        </p>
      </div>

      {/* ——— Band 2: Two-column info area ——— */}
      <div className="footer-band2">
        <div className="footer-band2-grid">
          {/* Left column: nav + logo */}
          <div className="footer-band2-left">
            <nav className="footer-band2-nav">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="footer-band2-nav-link"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="footer-band2-brand">
              <img
                src="/images/hos-logo.svg"
                alt="House of Singh"
                className="footer-band2-crest"
              />
              <p className="footer-band2-tagline">
                Made by AI. Curated by humans.
              </p>
            </div>
          </div>

          {/* Right column: Instagram */}
          <div className="footer-band2-right">
            {instagramPhotos.length > 0 && (
              <FooterInstagram photos={instagramPhotos} />
            )}
            <a
              href="https://www.instagram.com/houseofsingh"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-band2-ig-label"
            >
              INSTAGRAM
            </a>
          </div>
        </div>
      </div>

      {/* ——— Band 3: Bottom bar ——— */}
      <div className="footer-band3">
        {/* Left: Copyright + Legal */}
        <div className="footer-band3-legal">
          <span className="footer-band3-legal-item">
            &copy; 2026 HOUSE OF SINGH
          </span>
          <Link href="/privacy" className="footer-band3-legal-link">
            PRIVACY
          </Link>
          <Link href="/terms" className="footer-band3-legal-link">
            TERMS
          </Link>
        </div>

        {/* Center: Newsletter */}
        <div className="footer-band3-newsletter">
          {status === "success" ? (
            <span className="footer-band3-nl-thanks">Thank you</span>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="footer-band3-nl-form"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email for newsletter"
                className="footer-band3-nl-input"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="footer-band3-nl-btn"
              >
                {status === "loading" ? "..." : "SUBSCRIBE"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="footer-band3-nl-error">
              Something went wrong. Try again.
            </p>
          )}
        </div>

        {/* Right: Back to top */}
        <button
          onClick={scrollToTop}
          className="footer-band3-top-btn"
          type="button"
        >
          TOP <span>↑</span>
        </button>
      </div>
    </footer>
  );
}
