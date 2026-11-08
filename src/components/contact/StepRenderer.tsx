"use client";

import { useCallback } from "react";
import { CalendarIcon } from "lucide-react";
import { formatDateOnly, toDateOnly } from "@/lib/dates";
import type { StepDefinition, ContactFormData } from "@/lib/contact-form-data";

interface StepRendererProps {
  step: StepDefinition;
  value: string;
  onChange: (field: keyof ContactFormData, value: string) => void;
}


export default function StepRenderer({
  step,
  value,
  onChange,
}: StepRendererProps) {
  const handleChange = useCallback(
    (val: string) => onChange(step.field, val),
    [onChange, step.field],
  );

  // Intent selection — editorial divider-line interaction
  if (step.type === "intent") {
    return (
      <div className="contact-intent-list w-full">
        {step.options?.map((option) => (
          <button
            key={option}
            onClick={() => handleChange(option)}
            className={`contact-intent-option w-full text-left py-5 md:py-6 font-editorial text-[length:clamp(26px,calc(23.37px_+_0.674vw),32px)] leading-[1.2]${
              value === option ? " is-selected" : ""
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    );
  }

  // Choice chips — editorial
  if (step.type === "chips") {
    return (
      <div className="flex flex-wrap gap-3 w-full">
        {step.options?.map((option) => (
          <button
            key={option}
            onClick={() => handleChange(option)}
            className={`contact-option px-5 py-3 border font-editorial text-[18px] md:text-[20px] ${
              value === option
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-foreground border-border hover:border-foreground/40"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    );
  }

  // Select / list
  if (step.type === "select") {
    return (
      <div className="w-full space-y-0">
        {step.options?.map((option) => (
          <button
            key={option}
            onClick={() => handleChange(option)}
            className={`contact-option w-full text-left px-5 py-4 border-b border-border font-editorial text-[length:clamp(24px,calc(22.25px_+_0.449vw),28px)] leading-[1.25] ${
              value === option
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {value === option && <span className="mr-3">→</span>}
            {option}
          </button>
        ))}
      </div>
    );
  }

  // Textarea
  if (step.type === "textarea") {
    return (
      <textarea
        rows={4}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Type here…"
        className="contact-input w-full bg-transparent border-0 px-0 py-3 text-xl md:text-2xl font-light text-foreground resize-none"
        autoFocus
      />
    );
  }

  // Date picker (native input — no external deps needed)
  if (step.type === "date") {
    return (
      <div className="relative w-full">
        <div className="contact-input flex items-center gap-3 py-3">
          <CalendarIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          {value ? (
            <span className="text-xl md:text-2xl font-light text-foreground">
              {formatDateOnly(value)}
            </span>
          ) : (
            <span className="text-xl md:text-2xl font-light text-muted-foreground">
              Pick a date…
            </span>
          )}
        </div>
        <input
          type="date"
          value={toDateOnly(value)}
          // Stored as the picker gives it, "YYYY-MM-DD": a calendar day,
          // never converted to a UTC timestamp.
          onChange={(e) => handleChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    );
  }

  // Default: text / email / tel input
  return (
    <input
      type={step.type}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={
        step.type === "email"
          ? "your@email.com"
          : step.type === "tel"
            ? "+1 (555) 000-0000"
            : "Type here…"
      }
      className="contact-input w-full bg-transparent border-0 px-0 py-3 text-xl md:text-2xl font-light text-foreground"
      autoFocus
    />
  );
}
