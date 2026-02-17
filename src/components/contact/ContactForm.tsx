"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Send } from "lucide-react";

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const SUBJECTS = [
  "Brand Identity",
  "Photography",
  "Editorial / Print",
  "Creative Direction",
  "Collaboration",
  "General Inquiry",
];

export default function ContactForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canAdvance = () => {
    if (step === 0) return form.name.trim().length > 0;
    if (step === 1) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (step === 2) return form.subject.length > 0;
    if (step === 3) return form.message.trim().length > 0;
    return false;
  };

  const handleNext = () => {
    if (!canAdvance()) return;
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      setSubmitted(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  if (submitted) {
    return (
      <div className="overflow-hidden">
        <section className="px-8 md:px-16 pt-32 md:pt-44 pb-24 md:pb-36 flex flex-col items-center justify-center min-h-[60vh]">
          <p className="font-editorial text-3xl md:text-5xl font-light text-foreground text-center leading-[1.2] animate-editorial-fade-in">
            Thank you, {form.name}.
          </p>
          <p className="text-sm text-muted-foreground mt-6 text-center max-w-md leading-relaxed">
            Your message has been received. We&apos;ll be in touch shortly.
          </p>
        </section>
      </div>
    );
  }

  const steps = [
    {
      label: "01",
      heading: "What\u2019s your name?",
      content: (
        <input
          type="text"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Your full name"
          autoFocus
          className="w-full bg-transparent border-0 border-b border-border px-0 py-4 text-2xl md:text-4xl font-editorial font-light text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground transition-colors duration-300"
        />
      ),
    },
    {
      label: "02",
      heading: "What\u2019s your email?",
      content: (
        <input
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="you@example.com"
          autoFocus
          className="w-full bg-transparent border-0 border-b border-border px-0 py-4 text-2xl md:text-4xl font-editorial font-light text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground transition-colors duration-300"
        />
      ),
    },
    {
      label: "03",
      heading: "What can we help with?",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update("subject", s)}
              className={`text-left px-5 py-4 border transition-all duration-300 text-sm tracking-wide ${
                form.subject === s
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-foreground hover:border-foreground/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      ),
    },
    {
      label: "04",
      heading: "Tell us more",
      content: (
        <textarea
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Share some details about your project or idea..."
          autoFocus
          rows={4}
          className="w-full bg-transparent border-0 border-b border-border px-0 py-4 text-lg md:text-xl font-editorial font-light text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground transition-colors duration-300 resize-none"
        />
      ),
    },
  ];

  const current = steps[step];

  return (
    <div className="overflow-hidden">
      {/* Header */}
      <section className="px-8 md:px-16 pt-32 md:pt-44 pb-16 md:pb-24">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
          Contact
        </p>
        <div className="w-full h-px bg-border mb-10" />
        <h1 className="font-editorial text-3xl md:text-5xl lg:text-6xl font-light text-foreground leading-[1.1] max-w-2xl animate-editorial-fade-in">
          Let&apos;s Start a Conversation
        </h1>
        <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.8] mt-6 max-w-lg">
          Whether it&apos;s a project, collaboration, or just an idea —
          we&apos;d love to hear from you.
        </p>
      </section>

      {/* Multi-step form */}
      <section className="px-8 md:px-16 pb-24 md:pb-36">
        <div className="max-w-2xl">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-12">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-px transition-all duration-500 ${
                  i <= step
                    ? "bg-foreground flex-[2]"
                    : "bg-border flex-1"
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div key={step} className="animate-editorial-fade-in">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
              {current.label}
            </p>
            <h2 className="font-editorial text-2xl md:text-3xl font-light text-foreground mb-8">
              {current.heading}
            </h2>
            {current.content}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-12">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className={`flex items-center gap-2 text-xs tracking-widest uppercase transition-all duration-300 ${
                step === 0
                  ? "text-muted-foreground/30 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              disabled={step === 0}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance()}
              className={`flex items-center gap-2 text-xs tracking-widest uppercase transition-all duration-300 ${
                canAdvance()
                  ? "text-foreground hover:text-foreground/70"
                  : "text-muted-foreground/30 cursor-not-allowed"
              }`}
            >
              {step === 3 ? (
                <>
                  Send
                  <Send className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
