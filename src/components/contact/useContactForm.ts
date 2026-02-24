"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  type ContactFormData,
  emptyFormData,
  buildSteps,
  STORAGE_KEY,
} from "@/lib/contact-form-data";

export type Phase = "form" | "review" | "done";

export function useContactForm() {
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

  return {
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
  };
}
