"use client";

import { useState } from "react";
import Link from "next/link";
import type { NavItem } from "@/lib/placeholder-data";

type Props = {
  items: NavItem[];
};

export default function Footer({ items }: Props) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail("");
  };

  const internalItems = items.filter((item) => !item.external);

  return (
    <footer className="px-8 md:px-16 py-24 md:py-36 border-t border-border">
      {/* CTA */}
      <div className="mb-16">
        <p className="font-editorial text-2xl md:text-3xl lg:text-4xl font-light text-foreground leading-snug max-w-lg">
          Want to work together?
        </p>
        <p className="text-sm text-muted-foreground mt-3 max-w-md">
          Let&apos;s talk about a project, collaboration or an idea you may
          have.
        </p>
        <Link
          href="/contact"
          className="inline-block mt-6 text-xs tracking-widest uppercase text-foreground border-b border-foreground/30 pb-1 hover:border-foreground transition-colors duration-300"
        >
          Get in touch
        </Link>
      </div>

      {/* Bottom row */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 pt-8 border-t border-border/50">
        {/* Left — nav links + copyright */}
        <div>
          <div className="flex flex-wrap gap-6 mb-4">
            {internalItems.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[11px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] tracking-widest uppercase text-muted-foreground">
            <span>&copy; 2026 House of Singh Studios Inc.</span>
            <span className="hidden md:inline text-border">&middot;</span>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors duration-300"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors duration-300"
            >
              Privacy
            </Link>
          </div>
        </div>

        {/* Right — newsletter */}
        <div className="max-w-xs w-full">
          <p className="text-[11px] tracking-widest uppercase text-muted-foreground mb-3">
            Newsletter
          </p>
          {subscribed ? (
            <p className="text-sm text-muted-foreground">
              Thank you for subscribing.
            </p>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex items-center gap-0"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-transparent border-0 border-b border-border px-0 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-300"
              />
              <button
                type="submit"
                className="px-3 py-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                →
              </button>
            </form>
          )}
        </div>
      </div>
    </footer>
  );
}
