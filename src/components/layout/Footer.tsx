"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { NavItem } from "@/lib/placeholder-data";
import type { InstagramPhoto } from "@/components/contact/InstagramPhotoPlate";
import FooterInstagram from "./FooterInstagram";

type Props = {
  items: NavItem[];
  instagramPhotos?: InstagramPhoto[];
};

const LINK_CLASS =
  "text-[11px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300";

export default function Footer({ items, instagramPhotos = [] }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const pathname = usePathname();
  const isContactPage = pathname === "/contact";

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

  const internalItems = [...items]
    .filter((item) => !item.external)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <footer className="bg-white">
      {/* Full-width divider — edge to edge */}
      <div className="w-full h-px bg-border" />

      {/* ——— Area 1: Instagram + CTA Row ——— */}
      <div className="px-6 md:px-16 pt-20 md:pt-20 pb-10 md:pb-10">
        <div className="flex flex-col md:flex-row md:gap-12 lg:gap-16 gap-10">
          {/* Left: Instagram feed */}
          {instagramPhotos.length > 0 && (
            <div className="w-full md:w-[220px] lg:w-[280px] flex-shrink-0">
              <FooterInstagram photos={instagramPhotos} />
            </div>
          )}

          {/* Right: CTA + Newsletter */}
          <div className="flex-1 flex flex-col justify-center">
            {!isContactPage && (
              <Link
                href="/contact"
                className="group inline-flex items-baseline gap-3 mb-10 md:mb-12"
              >
                <span className="font-editorial text-2xl md:text-3xl lg:text-4xl font-light text-foreground leading-snug">
                  Start a project
                </span>
                <span className="text-foreground/30 group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300 text-base md:text-lg">
                  →
                </span>
              </Link>
            )}

            {/* Newsletter */}
            <div>
              <p className={`${LINK_CLASS} mb-4 pointer-events-none`}>
                Newsletter
              </p>

              {status === "success" ? (
                <p className="text-sm text-muted-foreground py-2">
                  Thank you for subscribing.
                </p>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex items-center max-w-md"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    aria-label="Email for newsletter"
                    className="flex-1 bg-transparent border-0 border-b border-border px-0 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground transition-colors duration-300"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className={`${LINK_CLASS} pl-4 py-2 disabled:opacity-50`}
                  >
                    {status === "loading" ? "..." : "Subscribe"}
                  </button>
                </form>
              )}

              {status === "error" && (
                <p className="text-xs text-red-500 mt-2">
                  Something went wrong. Please try again.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ——— Divider ——— */}
      <div className="mx-6 md:mx-16 h-px bg-border/40" />

      {/* ——— Area 2: Info Row ——— */}
      <div className="px-6 md:px-16 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-6">
          {/* Left: Logo crest + copyright */}
          <div className="flex items-center gap-4">
            <img
              src="/images/hos-logo.svg"
              alt="House of Singh"
              className="opacity-15"
              style={{ width: "40px", height: "40px" }}
            />
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground/50">
              &copy; {new Date().getFullYear()} House of Singh
            </span>
          </div>

          {/* Center: Navigation links — horizontal */}
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 md:gap-x-6">
            {internalItems.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${LINK_CLASS} py-0.5`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Back to top + tagline */}
          <div className="flex flex-col items-start md:items-end gap-2">
            <button
              onClick={scrollToTop}
              className={`${LINK_CLASS} py-0.5 cursor-pointer`}
            >
              Top ↑
            </button>
            <span className="text-[10px] tracking-[0.12em] text-muted-foreground/35 italic">
              Made by AI. Curated by humans.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
