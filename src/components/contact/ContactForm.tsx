"use client";

import { useState } from "react";
import { ArrowDown, ArrowLeft } from "lucide-react";

const steps = [
  {
    label: "Your Request",
    description: "Start a conversation\nabout a new project\nor media inquiries.",
  },
  {
    label: "Your Information",
    description: "Tell us more about you.\nWhat\u2019s your name\nand email?",
  },
  {
    label: "Your Message",
    description: "How can we help?\nWrite down your\nrequest here.",
  },
  {
    label: "Almost There",
    description: "Review and send.\nWe\u2019ll get back to you\nshortly.",
  },
];

const reasons = ["Project Query", "Collaboration", "Media"];

type FormData = {
  name: string;
  email: string;
  reason: string;
  message: string;
};

export default function ContactForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    reason: "",
    message: "",
  });

  const canNext = () => {
    if (step === 0) return !!form.reason;
    if (step === 1) return !!form.name && !!form.email;
    if (step === 2) return !!form.message;
    return true;
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-8 md:px-16">
        <div className="text-center">
          <h1 className="font-editorial text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-6">
            Thank you
          </h1>
          <p className="text-muted-foreground text-lg">
            Your message has been received. We&apos;ll be in touch soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col px-6 md:px-16 py-12 md:py-24">
      {/* Main content — split layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-start pt-8 md:pt-16">
        {/* Left — step label + description */}
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4 md:mb-6">
            {steps[step].label}
          </p>
          <h2 className="font-editorial text-2xl md:text-4xl lg:text-[2.75rem] font-light text-foreground leading-[1.2] whitespace-pre-line">
            {steps[step].description}
          </h2>
        </div>

        {/* Right — form fields per step */}
        <div className="flex flex-col justify-center">
          {step === 0 && (
            <div className="space-y-0">
              {reasons.map((r) => (
                <button
                  key={r}
                  onClick={() => setForm({ ...form, reason: r })}
                  className={`w-full flex items-center gap-5 py-6 border-b border-border text-left transition-colors duration-300 group ${
                    form.reason === r
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-300 ${
                      form.reason === r
                        ? "border-foreground bg-foreground"
                        : "border-muted-foreground/40 group-hover:border-foreground"
                    }`}
                  >
                    {form.reason === r && (
                      <span className="w-2 h-2 rounded-full bg-background" />
                    )}
                  </span>
                  <span className="text-xl md:text-3xl font-light tracking-tight">
                    {r}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-border px-0 py-3 text-xl md:text-2xl font-light text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground transition-colors duration-300"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-border px-0 py-3 text-xl md:text-2xl font-light text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground transition-colors duration-300"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                Your Message
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-transparent border-0 border-b border-border px-0 py-3 text-xl md:text-2xl font-light text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground transition-colors duration-300 resize-none"
                placeholder="Tell us more\u2026"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                {[
                  { label: "Reason", value: form.reason },
                  { label: "Name", value: form.name },
                  { label: "Email", value: form.email },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-baseline border-b border-border pb-3"
                  >
                    <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="text-lg font-light text-foreground">
                      {item.value}
                    </span>
                  </div>
                ))}
                <div className="border-b border-border pb-3">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2">
                    Message
                  </span>
                  <p className="text-base font-light text-foreground leading-relaxed">
                    {form.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar — step indicator + navigation */}
      <div className="flex items-end justify-between pt-10 md:pt-24">
        {/* Step indicator */}
        <div className="text-5xl md:text-8xl lg:text-9xl font-light text-foreground/10 leading-none tracking-tighter select-none">
          {step + 1}
          <span className="text-3xl md:text-6xl lg:text-7xl">
            /{steps.length}
          </span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 px-5 py-3 text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground border border-border rounded-full transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Prev
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canNext()}
              className="flex items-center gap-2 px-6 py-3 text-sm tracking-widest uppercase bg-foreground text-background rounded-full hover:bg-foreground/90 transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <ArrowDown className="w-4 h-4 -rotate-90" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-3 text-sm tracking-widest uppercase bg-foreground text-background rounded-full hover:bg-foreground/90 transition-colors duration-300"
            >
              Submit
              <ArrowDown className="w-4 h-4 -rotate-90" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
