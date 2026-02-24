"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import StepRenderer from "@/components/contact/StepRenderer";
import {
  ReviewScreen,
  ConfirmationScreen,
} from "@/components/contact/ReviewConfirmation";
import { TwoColumnLayout, ProgressBar } from "./ContactLayout";
import { useContactForm } from "./useContactForm";

export default function ContactForm() {
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
    progressPercent,
  } = useContactForm();

  /* ── Confirmation ── */
  if (phase === "done") {
    return (
      <>
        <ProgressBar percent={progressPercent} />
        <TwoColumnLayout>
          <ConfirmationScreen />
        </TwoColumnLayout>
      </>
    );
  }

  /* ── Review ── */
  if (phase === "review") {
    return (
      <>
        <ProgressBar percent={progressPercent} />
        <TwoColumnLayout>
          {submitError && (
            <p className="text-red-600 text-sm mb-6">{submitError}</p>
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
      </>
    );
  }

  /* ── Form steps ── */
  return (
    <>
      <ProgressBar percent={progressPercent} />
      <TwoColumnLayout>
        <div className="min-h-[50vh] flex flex-col justify-center">
          <div key={currentStep} className="editorial-slide-up">
            {/* Question */}
            <h2 className="font-editorial text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-[1.15] mb-4">
              {currentStepDef?.question}
            </h2>

            {/* Helper text */}
            {currentStepDef?.helperText && (
              <p className="text-sm text-muted-foreground mb-8">
                {currentStepDef.helperText}
              </p>
            )}

            {/* Input */}
            <div className="mt-8">
              {currentStepDef && (
                <StepRenderer
                  step={currentStepDef}
                  value={currentValue}
                  onChange={handleFieldChange}
                />
              )}
            </div>

            {/* Clear draft link on first step */}
            {currentStep === 0 && hasDraft && (
              <button
                onClick={clearDraft}
                className="mt-6 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Clear saved progress
              </button>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-12">
            <div>
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-5 py-3 text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground border border-border rounded-full transition-colors duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isSkippable && (
                <button
                  onClick={handleNext}
                  className="px-5 py-3 text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Skip
                </button>
              )}
              {currentStepDef?.type !== "intent" && (
                <button
                  onClick={handleNext}
                  disabled={!isValid() && !isSkippable}
                  className="flex items-center gap-2 px-6 py-3 text-sm tracking-widest uppercase bg-foreground text-background rounded-full hover:bg-foreground/90 transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {currentStep === steps.length - 1 ? "Review" : "Next"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </TwoColumnLayout>
    </>
  );
}
