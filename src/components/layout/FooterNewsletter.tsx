"use client";

import { useState } from "react";
import HoneypotField from "@/components/HoneypotField";
import { HONEYPOT_FIELD } from "@/lib/spam-protection";

/** The footer's newsletter sign up: a hairline email field and an arrow. */
export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
        // Show the server's own wording (for example the rate limit message).
        const data = await res.json().catch(() => ({}));
        setErrorMsg(typeof data.error === "string" ? data.error : "");
        setStatus("error");
        return;
      }
      setStatus("success");
      setEmail("");
      setCompany("");
    } catch {
      setErrorMsg("");
      setStatus("error");
    }
  };

  return (
    <div className="footer-newsletter">
      <span className="footer-nl-label">Newsletter</span>
      {status === "success" ? (
        <span className="footer-nl-thanks">Thank you</span>
      ) : (
        <form onSubmit={handleSubscribe} className="footer-nl-form">
          <HoneypotField value={company} onChange={setCompany} idSuffix="footer" />
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
            aria-label="Subscribe"
            className="footer-nl-btn"
          >
            <span aria-hidden="true" className="footer-nl-arrow">
              {status === "loading" ? "..." : "→"}
            </span>
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="footer-nl-error" role="alert">
          {errorMsg || "Something went wrong. Try again."}
        </p>
      )}
    </div>
  );
}
