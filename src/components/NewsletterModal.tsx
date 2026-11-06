"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import HoneypotField from "@/components/HoneypotField";
import { HONEYPOT_FIELD } from "@/lib/spam-protection";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useFocusTrap } from "@/hooks/useFocusTrap";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

/** How long the confirmation holds before auto-dismissing, and the fade length. */
const CONFIRM_HOLD_MS = 2500;
const CONFIRM_FADE_MS = 500;

export default function NewsletterModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [closing, setClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  // While open: the rest of the page is inert, Tab stays inside, Escape
  // closes, and on close focus returns to where it was before opening.
  // Initial focus moves to the email field (the existing timer below).
  useFocusTrap({
    active: isOpen,
    containerRef: dialogRef,
    keepRefs: [backdropRef],
    onEscape: onClose,
    restoreFocus: true,
  });

  // Keep a stable handle to onClose so the auto-dismiss timers don't reset
  // when the parent passes a fresh inline callback on re-render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Reset form state when modal opens — intentional reset synced to isOpen prop
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setCompany("");
      setStatus("idle");
      setErrorMsg("");
      setClosing(false);
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Auto-dismiss the confirmation: hold ~2.5s, then fade out and close.
  // Under reduced motion, close instantly after the same hold (no fade).
  // Timers are cleared on manual close (isOpen → false) and on unmount, so
  // there is no double close and no state update on an unmounted component.
  useEffect(() => {
    if (!isOpen || status !== "success") return;

    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    const holdTimer = setTimeout(() => {
      if (prefersReduced) {
        onCloseRef.current();
      } else {
        setClosing(true);
        fadeTimer = setTimeout(() => onCloseRef.current(), CONFIRM_FADE_MS);
      }
    }, CONFIRM_HOLD_MS);

    return () => {
      clearTimeout(holdTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [isOpen, status, prefersReduced]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={`fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Modal. Inert while hidden, so its controls are out of the Tab order
          and hidden from screen readers; the fade is unchanged. */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-title"
        inert={!isOpen}
        className={`fixed inset-0 z-[61] flex items-center justify-center px-6 transition-all duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`bg-background border border-border w-full max-w-md p-8 md:p-10 relative transition-transform duration-300 ${
            isOpen ? "translate-y-0" : "translate-y-4"
          }`}
          style={
            closing
              ? {
                  opacity: 0,
                  transition:
                    "opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)",
                }
              : undefined
          }
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {status === "success" ? (
            <div className="text-center py-4">
              <h3 id="newsletter-title" className="font-editorial text-2xl md:text-3xl font-light text-foreground mb-3">
                Thank you
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You&apos;ve been added to our mailing list. We&apos;ll be in touch.
              </p>
            </div>
          ) : (
            <>
              <h3 id="newsletter-title" className="font-editorial text-2xl md:text-3xl font-light text-foreground mb-2">
                Stay in touch
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                Subscribe for updates on new work, journal entries, and studio news.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <HoneypotField value={company} onChange={setCompany} idSuffix="newsletter" />
                <div>
                  <label htmlFor="newsletter-email" className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                    Email Address
                  </label>
                  <input
                    id="newsletter-email"
                    ref={inputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-transparent border-0 border-b border-border px-0 py-3 text-lg font-light text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-300"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-error" role="alert">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-foreground text-background py-3 text-sm tracking-widest uppercase hover:bg-foreground/90 transition-colors duration-300 disabled:opacity-50"
                >
                  {status === "loading" ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
