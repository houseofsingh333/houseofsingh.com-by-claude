"use client";

import { useState } from "react";
import HoneypotField from "@/components/HoneypotField";

type Props = {
  projectTitle: string;
};

export default function ProjectInterestForm({ projectTitle }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [story, setStory] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = name.trim() && email.trim() && story.trim() && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/project-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          instagram: instagram.trim(),
          story: story.trim(),
          projectTitle,
          company: honeypot,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-3xl px-6 md:px-16 section-py">
        <div className="w-full h-px bg-border mb-10" />
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">
          Thank you
        </p>
        <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.9]">
          Your interest has been submitted. We&apos;ll be in touch.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-6 md:px-16 section-py">
      <div className="w-full h-px bg-border mb-10" />
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">
        Interested?
      </p>
      <h2 className="font-editorial text-2xl md:text-3xl font-light text-foreground leading-[1.15] mb-4">
        Share your story
      </h2>
      <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.9] max-w-xl mb-10">
        Know someone — or are you someone — who should be part of this project?
        Tell us about it.
      </p>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-8">
        <HoneypotField value={honeypot} onChange={setHoneypot} />

        <div>
          <label
            htmlFor="interest-name"
            className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 mb-2"
          >
            Name *
          </label>
          <input
            id="interest-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="contact-input w-full bg-transparent text-sm py-2 text-foreground"
            placeholder="Your name"
          />
        </div>

        <div>
          <label
            htmlFor="interest-email"
            className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 mb-2"
          >
            Email *
          </label>
          <input
            id="interest-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="contact-input w-full bg-transparent text-sm py-2 text-foreground"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="interest-phone"
            className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 mb-2"
          >
            Phone
          </label>
          <input
            id="interest-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="contact-input w-full bg-transparent text-sm py-2 text-foreground"
            placeholder="Optional"
          />
        </div>

        <div>
          <label
            htmlFor="interest-instagram"
            className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 mb-2"
          >
            Instagram
          </label>
          <input
            id="interest-instagram"
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="contact-input w-full bg-transparent text-sm py-2 text-foreground"
            placeholder="@handle"
          />
        </div>

        <div>
          <label
            htmlFor="interest-story"
            className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 mb-2"
          >
            Your story or nomination *
          </label>
          <textarea
            id="interest-story"
            required
            rows={5}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="contact-input w-full bg-transparent text-sm py-2 text-foreground resize-none"
            placeholder="Tell us about yourself or who you'd like to nominate…"
          />
        </div>

        {error && (
          <p className="text-sm text-muted-foreground border-l-2 border-foreground/20 pl-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="contact-btn contact-btn-primary"
        >
          {submitting ? "Sending…" : "Submit"}
        </button>
      </form>
    </section>
  );
}
