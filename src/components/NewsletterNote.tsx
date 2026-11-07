"use client";

import { useEffect, useRef, useState } from "react";
import HoneypotField from "@/components/HoneypotField";
import { HONEYPOT_FIELD } from "@/lib/spam-protection";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

/** How long the thank you holds before the note closes itself. */
const CONFIRM_HOLD_MS = 2500;

/**
 * The newsletter as a corner note: a small paper card in the bottom right,
 * opened from the menu's Newsletter link. It is not modal: no overlay, the
 * page stays usable, and focus is not trapped. Opening moves focus to the
 * email field; Not now and Escape close it, and focus goes back to where it
 * was. It rises in within --dur-menu (see "Newsletter note" in layout.css).
 */
export default function NewsletterNote({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // A fresh form each time it opens (an intentional reset synced to isOpen).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen) return;
    setEmail("");
    setCompany("");
    setStatus("idle");
    setErrorMsg("");
  }, [isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Focus: into the email field on open, back to where it was on close.
  useEffect(() => {
    if (!isOpen) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
    const card = cardRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      if (card?.contains(document.activeElement)) {
        returnTo.current?.focus?.({ preventScroll: true });
      }
    };
  }, [isOpen]);

  // After a successful sign up, the thank you holds, then the note closes.
  useEffect(() => {
    if (!isOpen || status !== "success") return;
    const timer = window.setTimeout(() => onCloseRef.current(), CONFIRM_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), [HONEYPOT_FIELD]: company }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(typeof data.error === "string" ? data.error : "Something went wrong.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="newsletter-title"
      inert={!isOpen}
      data-open={isOpen ? "" : undefined}
      className="note-card"
    >
      {status === "success" ? (
        <div className="flex flex-col gap-2">
          <h2 id="newsletter-title" className="font-editorial font-normal text-[24px] leading-[1.2] text-foreground">
            Thank you
          </h2>
          <p className="text-[14px] leading-[1.6] text-muted-foreground">
            You&apos;ve been added to our mailing list. We&apos;ll be in touch.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 id="newsletter-title" className="font-editorial font-normal text-[24px] leading-[1.2] text-foreground">
              Stay in touch
            </h2>
            <p className="text-[14px] leading-[1.6] text-muted-foreground">
              Subscribe for updates on new work, journal entries, and studio news.
            </p>
          </div>
          <HoneypotField value={company} onChange={setCompany} idSuffix="newsletter" />
          <label className="flex flex-col gap-1">
            <span className="sr-only">Email address</span>
            <input
              ref={inputRef}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="note-input"
            />
          </label>
          {status === "error" && (
            <p className="text-[13px] text-error" role="alert">
              {errorMsg}
            </p>
          )}
          <div className="flex items-center justify-between gap-4">
            <button type="submit" disabled={status === "loading"} className="note-subscribe">
              {status === "loading" ? "Subscribing" : "Subscribe"}
            </button>
            <button type="button" onClick={onClose} className="note-later">
              Not now
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
