"use client";

import { useEffect, useRef } from "react";
import { OutlineButton } from "@/components/OutlineCta";
import { TextButton } from "@/components/TextLink";
import StepRenderer from "@/components/contact/StepRenderer";
import {
  ReviewScreen,
  ConfirmationScreen,
} from "@/components/contact/ReviewConfirmation";
import { TwoColumnLayout } from "./ContactLayout";
import { useContactForm } from "./useContactForm";
import { bringStepIntoView } from "./bringStepIntoView";
import SanityImage from "@/components/SanityImage";
import type { SanityImage as SanityImageData } from "@/lib/types";
import HoneypotField from "@/components/HoneypotField";
import type { ContactFormCopy } from "@/lib/contact-form-data";

type Props = {
  /** Maninder's portrait: the Contact portrait, else the About portrait. */
  portrait: SanityImageData | null;
  /** The portrait's caption (Contact Page, Portrait caption). */
  caption: string;
  /** The words of the form, from Sanity with today's wording as default. */
  copy: ContactFormCopy;
};

/** The portrait beside the form (and after it on phones). */
function ContactPortrait({ image, caption }: { image: SanityImageData; caption: string }) {
  return (
    <figure className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <SanityImage
          image={image}
          context="body"
          alt={typeof image === "string" ? "Maninder Singh" : undefined}
          fill
          sizes="(min-width: 1280px) 460px, (min-width: 768px) 36vw, calc(100vw - 48px)"
          className="object-cover object-top"
        />
      </div>
      <figcaption className="type-label text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function ContactForm({ portrait, caption, copy }: Props) {
  const {
    formData,
    currentStep,
    phase,
    setPhase,
    setCurrentStep,
    hasDraft,
    submitting,
    submitError,
    stepError,
    steps,
    currentStepDef,
    currentValue,
    isValid,
    isSkippable,
    handleFieldChange,
    handleNext,
    handlePrev,
    handleEditFromReview,
    handleSubmit,
    clearDraft,
    honeypot,
    setHoneypot,
  } = useContactForm(copy);

  /* Moving to a step (Next, Back, a reason chosen, Back from the review):
     the question comes into view below the header if it or Next is not
     already wholly in view, and takes the focus; on a text step the field
     takes it once the page is at rest. Not on the first step as the page
     opens. */
  const questionRef = useRef<HTMLHeadingElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const opened = useRef(false);
  useEffect(() => {
    if (phase !== "form") return;
    if (!opened.current) {
      opened.current = true;
      return;
    }
    // Next (or Review) is the last button in the row; the reasons step has none.
    const buttons = navRef.current?.querySelectorAll<HTMLElement>("button");
    const next = currentStepDef?.type === "intent" || !buttons?.length ? null : buttons[buttons.length - 1];
    // A text step: once the page is at rest, the caret goes to its field so
    // the reader can type straight away. A choice step keeps the question focused.
    const typed = ["text", "email", "tel", "textarea"].includes(currentStepDef?.type ?? "");
    const step = questionRef.current?.closest(".editorial-slide-up");
    bringStepIntoView(questionRef.current, next, typed ? () => step?.querySelector<HTMLElement>("input.contact-input, textarea.contact-input")?.focus({ preventScroll: true }) : undefined);
    // Only a move to another step: not the answers changing within one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, phase]);

  const aside = portrait ? <ContactPortrait image={portrait} caption={caption} /> : undefined;

  /* ── Confirmation ── */
  if (phase === "done") {
    return (
      <TwoColumnLayout aside={aside}>
        <ConfirmationScreen heading={copy.thankYouHeading} line={copy.thankYouLine} />
      </TwoColumnLayout>
    );
  }

  /* ── Review ── */
  if (phase === "review") {
    return (
      <TwoColumnLayout aside={aside}>
        {submitError && (
          <p
            role="alert"
            className="text-small text-muted-foreground mb-6 border-l-2 border-foreground/20 pl-4"
          >
            {submitError}
          </p>
        )}
        <ReviewScreen
          steps={steps}
          formData={formData}
          onEdit={handleEditFromReview}
          onSubmit={handleSubmit}
          submitting={submitting}
          onBack={() => {
            setCurrentStep(steps.length - 1);
            setPhase("form");
          }}
        />
      </TwoColumnLayout>
    );
  }

  /* ── Form steps ── */
  return (
    <TwoColumnLayout aside={aside}>
      <HoneypotField value={honeypot} onChange={setHoneypot} idSuffix="contact" />
        <div className="min-h-[50vh] flex flex-col justify-center max-w-lg">
          <div key={currentStep} className="editorial-slide-up">
            {/* Question */}
            <h2 ref={questionRef} tabIndex={-1} className="font-editorial font-normal text-display-l text-foreground leading-[1.15] sm:leading-[1.12] mb-5 tracking-[-0.01em] text-balance outline-none">
              {currentStepDef?.question}
            </h2>

            {/* Helper text — stronger pause before input */}
            {currentStepDef?.helperText && (
              <p className="text-small text-muted-foreground leading-relaxed mb-10">
                {currentStepDef.helperText}
              </p>
            )}

            {/* Input */}
            <div className={currentStepDef?.helperText ? "mt-4" : "mt-12"}>
              {currentStepDef && (
                <StepRenderer
                  step={currentStepDef}
                  value={currentValue}
                  onChange={handleFieldChange}
                  error={stepError}
                />
              )}
            </div>

            {/* Clear draft — only after the user has progressed past the first screen */}
            {currentStep > 0 && hasDraft && (
              <button
                onClick={clearDraft}
                className="contact-btn hairline mt-8 type-label text-muted-foreground"
              >
                Clear saved progress
              </button>
            )}
          </div>

          {/* Navigation buttons */}
          <div ref={navRef} className="flex items-center justify-between pt-10 md:pt-16">
            <div>
              {currentStep > 0 && (
                <TextButton back onClick={handlePrev}>
                  Back
                </TextButton>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isSkippable && (
                <TextButton onClick={handleNext}>Skip</TextButton>
              )}
              {currentStepDef?.type !== "intent" && (
                <OutlineButton onClick={handleNext} disabled={!isValid() && !isSkippable}>
                  {currentStep === steps.length - 1 ? "Review" : "Next"}
                </OutlineButton>
              )}
            </div>
          </div>
        </div>

        {/* Phones: the portrait after the form */}
        {portrait && (
          <div className="md:hidden mt-16 mb-4">
            <ContactPortrait image={portrait} caption={caption} />
          </div>
        )}
      </TwoColumnLayout>
  );
}
