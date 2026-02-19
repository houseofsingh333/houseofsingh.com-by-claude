"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  type ContactFormData,
  emptyFormData,
  buildSteps,
  STORAGE_KEY,
} from "@/lib/contact-form-data";
import StepRenderer from "@/components/contact/StepRenderer";
import {
  ReviewScreen,
  ConfirmationScreen,
} from "@/components/contact/ReviewConfirmation";

type Phase = "form" | "review" | "done";

/* ── Static left column ────────────────────────────────── */
function EditorialSidebar() {
  return (
    <div className="md:sticky md:top-24 md:self-start">
      <h1 className="font-editorial text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-8">
        Say hello.
      </h1>
      <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
        Whether it&apos;s a project, a collaboration, or simply a conversation,
        I&apos;m always open to hearing from thoughtful people.
      </p>
      <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
        If you&apos;d like to catch up over coffee, go for a walk, or explore an
        idea together, feel free to reach out.
      </p>
    </div>
  );
}

/* ── Two-column wrapper ────────────────────────────────── */
function TwoColumnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[80vh] px-6 md:px-8 page-top-offset pb-16 md:pb-24">
      <div className="grid md:grid-cols-[2fr_3fr] gap-12 md:gap-24 max-w-6xl mx-auto">
        <EditorialSidebar />
        <div>{children}</div>
      </div>
    </div>
  );
}

/* ── Progress bar ──────────────────────────────────────── */
function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div
        className="h-[2px] bg-foreground transition-all duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(() => {
    if (typeof window === "undefined") return emptyFormData;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...emptyFormData, ...parsed };
      }
    } catch {
      /* ignore */
    }
    return emptyFormData;
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("form");
  const [returnToReview, setReturnToReview] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Draft restored notice
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.intent || parsed.name || parsed.email) {
          setHasDraft(true);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Autosave to localStorage
  useEffect(() => {
    if (phase === "done") return;
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(timeout);
  }, [formData, phase]);

  const steps = useMemo(
    () => buildSteps(formData.intent),
    [formData.intent],
  );
  const currentStepDef = steps[currentStep];
  const currentValue = currentStepDef ? formData[currentStepDef.field] : "";

  const isValid = useCallback(() => {
    if (!currentStepDef) return false;
    if (!currentStepDef.required) return true;
    return !!formData[currentStepDef.field];
  }, [currentStepDef, formData]);

  const isSkippable = currentStepDef && !currentStepDef.required;

  const handleFieldChange = useCallback(
    (field: keyof ContactFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleNext = useCallback(() => {
    if (!isValid() && !isSkippable) return;
    if (returnToReview) {
      setReturnToReview(false);
      setPhase("review");
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setPhase("review");
    }
  }, [isValid, isSkippable, currentStep, steps.length, returnToReview]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const handleEditFromReview = useCallback((stepIndex: number) => {
    setReturnToReview(true);
    setCurrentStep(stepIndex);
    setPhase("form");
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed");
      }
      localStorage.removeItem(STORAGE_KEY);
      setPhase("done");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [formData]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData(emptyFormData);
    setCurrentStep(0);
    setHasDraft(false);
  }, []);

  // Auto-advance on intent selection
  useEffect(() => {
    if (currentStepDef?.type === "intent" && formData.intent) {
      const timer = setTimeout(() => setCurrentStep((s) => s + 1), 300);
      return () => clearTimeout(timer);
    }
  }, [formData.intent, currentStepDef?.type]);

  // Keyboard: Enter to advance (not for textarea or intent)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "Enter" &&
        phase === "form" &&
        currentStepDef?.type !== "textarea" &&
        currentStepDef?.type !== "intent"
      ) {
        e.preventDefault();
        if (isValid() || isSkippable) handleNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, currentStepDef, isValid, isSkippable, handleNext]);

  // Progress
  const totalSteps = steps.length;
  const progressPercent =
    phase === "review" || phase === "done"
      ? 100
      : ((currentStep + 1) / (totalSteps + 1)) * 100;

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
