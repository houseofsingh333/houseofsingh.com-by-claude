"use client";

import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import type {
  ContactFormData,
  StepDefinition,
} from "@/lib/contact-form-data";

interface ReviewScreenProps {
  steps: StepDefinition[];
  formData: ContactFormData;
  onEdit: (stepIndex: number) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting?: boolean;
}

const sectionLabels: Record<string, string> = {
  intent: "Intent",
  contact: "Contact",
  details: "Details",
};

export function ReviewScreen({
  steps,
  formData,
  onEdit,
  onSubmit,
  onBack,
  submitting,
}: ReviewScreenProps) {
  const sections = steps.reduce<
    Record<string, { step: StepDefinition; index: number }[]>
  >((acc, step, i) => {
    if (!acc[step.section]) acc[step.section] = [];
    acc[step.section].push({ step, index: i });
    return acc;
  }, {});

  return (
    <div className="w-full max-w-xl mx-auto editorial-slide-up">
      <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
        Review
      </p>
      <h2 className="font-editorial text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-12">
        Before you send.
      </h2>

      <div className="space-y-10">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section}>
            <h3 className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
              {sectionLabels[section] || section}
            </h3>
            <div className="space-y-0">
              {items.map(({ step, index }) => {
                const val = formData[step.field];
                if (!val) return null;
                return (
                  <div
                    key={step.id}
                    className="flex items-baseline justify-between border-b border-border py-4 group"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-muted-foreground block mb-1">
                        {step.question.replace(/[?.]/g, "")}
                      </span>
                      <span className="text-base md:text-lg font-light text-foreground break-words">
                        {step.type === "date" && val
                          ? new Date(val).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : val}
                      </span>
                    </div>
                    <button
                      onClick={() => onEdit(index)}
                      className="ml-4 text-muted-foreground hover:text-foreground transition-colors duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
                      aria-label={`Edit ${step.question}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-16">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground border border-border rounded-full transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-8 py-3 text-sm tracking-widest uppercase bg-foreground text-background rounded-full hover:bg-foreground/90 transition-colors duration-300 disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Submit"}
        </button>
      </div>
    </div>
  );
}

export function ConfirmationScreen() {
  return (
    <div className="w-full max-w-xl mx-auto editorial-slide-up">
      <h1 className="font-editorial text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-6">
        Thank you for reaching out.
      </h1>
      <p className="text-muted-foreground text-lg mb-12">
        I&apos;ll be in touch shortly.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm tracking-widest uppercase border border-border rounded-full text-foreground hover:bg-foreground hover:text-background transition-colors duration-300"
        >
          Explore my projects
        </Link>
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm tracking-widest uppercase border border-border rounded-full text-foreground hover:bg-foreground hover:text-background transition-colors duration-300"
        >
          Read the journal
        </Link>
      </div>
    </div>
  );
}
