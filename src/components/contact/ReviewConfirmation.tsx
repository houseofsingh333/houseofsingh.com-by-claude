"use client";

import TextLink, { TextButton } from "@/components/TextLink";
import { Pencil } from "lucide-react";
import { OutlineButton } from "@/components/OutlineCta";
import { formatDateOnly } from "@/lib/dates";
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
      <p className="type-label text-muted-foreground mb-4">
        Review
      </p>
      <h2 className="font-editorial font-normal text-display-l text-foreground mb-12 leading-[1.12]">
        Before you send.
      </h2>

      <div className="space-y-10">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section}>
            <h3 className="type-label text-muted-foreground mb-4">
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
                      <span className="text-small text-muted-foreground block mb-1">
                        {step.question.replace(/[?.]/g, "")}
                      </span>
                      <span className="text-body text-foreground break-words">
                        {step.type === "date" && val
                          ? formatDateOnly(val)
                          : val}
                      </span>
                    </div>
                    <button
                      onClick={() => onEdit(index)}
                      className="contact-btn hairline ml-4 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 flex-shrink-0"
                      aria-label={`Edit ${step.question}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-16">
        <TextButton back onClick={onBack}>
          Back
        </TextButton>
        <OutlineButton onClick={onSubmit} disabled={submitting}>
          {submitting ? "Sending…" : "Submit"}
        </OutlineButton>
      </div>
    </div>
  );
}

export function ConfirmationScreen({ heading, line }: { heading: string; line: string }) {
  return (
    <div className="w-full max-w-xl mx-auto editorial-slide-up">
      <h2 className="font-editorial font-normal text-display-l text-foreground mb-6 leading-[1.08]">
        {heading}
      </h2>
      <p className="text-muted-foreground text-body-l mb-14 leading-relaxed">
        {line}
      </p>
      <div className="flex flex-wrap gap-4">
        <TextLink href="/projects">Explore my projects</TextLink>
        <TextLink href="/journal">Read the journal</TextLink>
      </div>
    </div>
  );
}
