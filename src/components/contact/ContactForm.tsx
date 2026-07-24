"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import StepRenderer from "@/components/contact/StepRenderer";
import {
  ReviewScreen,
  ConfirmationScreen,
} from "@/components/contact/ReviewConfirmation";
import { TwoColumnLayout } from "./ContactLayout";
import { useContactForm } from "./useContactForm";
import InstagramPhotoPlate, {
  type InstagramPhoto,
} from "./InstagramPhotoPlate";
import HoneypotField from "@/components/HoneypotField";

type Props = {
  instagramPhotos?: InstagramPhoto[];
};

export default function ContactForm({ instagramPhotos = [] }: Props) {
  const {
    formData,
    currentStep,
    phase,
    setPhase,
    setCurrentStep,
    hasDraft,
    submitting,
    submitError,
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
  } = useContactForm();

  const aside =
    instagramPhotos.length > 0 ? (
      <InstagramPhotoPlate photos={instagramPhotos} />
    ) : undefined;

  /* ── Confirmation ── */
  if (phase === "done") {
    return (
      <TwoColumnLayout aside={aside}>
        <ConfirmationScreen />
      </TwoColumnLayout>
    );
  }

  /* ── Review ── */
  if (phase === "review") {
    return (
      <TwoColumnLayout aside={aside}>
        {submitError && (
          <p className="text-sm text-muted-foreground mb-6 border-l-2 border-foreground/20 pl-4">
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
            <h2 className="font-editorial text-[1.75rem] sm:text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-[1.15] sm:leading-[1.12] mb-5 tracking-[-0.01em] text-balance">
              {currentStepDef?.question}
            </h2>

            {/* Helper text — stronger pause before input */}
            {currentStepDef?.helperText && (
              <p className="text-sm text-muted-foreground/60 leading-relaxed mb-10">
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
                />
              )}
            </div>

            {/* Clear draft — only after the user has progressed past the first screen */}
            {currentStep > 0 && hasDraft && (
              <button
                onClick={clearDraft}
                className="contact-btn mt-8 text-xs tracking-[0.08em] text-muted-foreground/50 hover:text-muted-foreground"
              >
                Clear saved progress
              </button>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-10 md:pt-16">
            <div>
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="contact-btn contact-btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="contact-btn-arrow contact-btn-arrow-back w-4 h-4" />
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isSkippable && (
                <button
                  onClick={handleNext}
                  className="contact-btn contact-btn-ghost"
                >
                  Skip
                </button>
              )}
              {currentStepDef?.type !== "intent" && (
                <button
                  onClick={handleNext}
                  disabled={!isValid() && !isSkippable}
                  className="contact-btn contact-btn-primary flex items-center gap-2"
                >
                  {currentStep === steps.length - 1 ? "Review" : "Next"}
                  <ArrowRight className="contact-btn-arrow contact-btn-arrow-next w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile-only Instagram plate — placed near footer, after form content */}
        {instagramPhotos.length > 0 && (
          <div className="md:hidden mt-16 mb-4 px-2">
            <InstagramPhotoPlate photos={instagramPhotos} />
          </div>
        )}
      </TwoColumnLayout>
  );
}
