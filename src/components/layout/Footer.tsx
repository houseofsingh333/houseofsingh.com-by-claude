"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { NavItem } from "@/lib/placeholder-data";

type Props = {
  items: NavItem[];
};

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/houseofsingh" },
];

const LINK_CLASS =
  "text-[11px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300";

export default function Footer({ items }: Props) {
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

      {/* ——— Upper footer ——— */}
      <div className="px-6 md:px-16 pt-24 md:pt-40 pb-16 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* CTA — primary call to action */}
          <div className="md:col-span-4">
            {!isContactPage && (
              <Link
                href="/contact"
                className="group inline-flex items-baseline gap-3"
              >
                <span className="font-editorial text-2xl md:text-3xl lg:text-4xl font-light text-foreground leading-snug">
                  Start a project
                </span>
                <span className="text-foreground/30 group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300 text-base md:text-lg">
                  →
                </span>
              </Link>
            )}
          </div>

          {/* Navigation — subpage links */}
          <div className="md:col-span-2">
            <nav className="flex flex-row flex-wrap gap-x-5 gap-y-2 md:flex-col md:gap-3">
              {internalItems.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${LINK_CLASS} py-0.5 w-fit`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter + Social */}
          <div className="md:col-span-4">
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
                className="flex items-center"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
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

            {/* Social links */}
            <div className="mt-8 flex items-center gap-5">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${LINK_CLASS} py-0.5`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Top button — scroll to top */}
          <div className="md:col-span-2 flex md:justify-end md:items-start">
            <button
              onClick={scrollToTop}
              className={`${LINK_CLASS} py-0.5 cursor-pointer`}
            >
              Top ↑
            </button>
          </div>
        </div>
      </div>

      {/* ——— Lower strip ——— */}
      <div className="mx-6 md:mx-16 h-px bg-border/40" />

      <div className="px-6 md:px-16 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: copyright + legal */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] tracking-widest uppercase text-muted-foreground/50">
            <span>&copy; 2026 House of Singh</span>
            <span className="text-border">&middot;</span>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors duration-300"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors duration-300"
            >
              Terms
            </Link>
          </div>

          {/* Right: crest + signature */}
          <div className="flex items-center gap-3">
            <img
              src="/images/hos-logo.svg"
              alt=""
              className="w-5 h-5 opacity-20"
            />
            <span className="text-[10px] tracking-[0.12em] text-muted-foreground/35 italic">
              Made by AI. Curated by humans.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
