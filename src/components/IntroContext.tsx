"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type IntroContextValue = {
  /** True once the intro overlay has been dismissed (or was skipped). */
  introComplete: boolean;
  /** Signal that the intro has ended. Safe to call more than once. */
  completeIntro: () => void;
};

const IntroContext = createContext<IntroContextValue | null>(null);

/**
 * Shares a single "has the intro finished" signal across the tree so the
 * Header (which owns the intro overlay) can tell the hero to begin its
 * animation directly — no sessionStorage polling, no setInterval.
 */
export function IntroProvider({ children }: { children: ReactNode }) {
  const [introComplete, setIntroComplete] = useState(false);
  const completeIntro = useCallback(() => setIntroComplete(true), []);

  return (
    <IntroContext.Provider value={{ introComplete, completeIntro }}>
      {children}
    </IntroContext.Provider>
  );
}

/**
 * Read the intro signal. If used outside the provider we fail open
 * (introComplete = true) so hero content is never gated behind a missing
 * provider.
 */
export function useIntro(): IntroContextValue {
  const ctx = useContext(IntroContext);
  if (!ctx) {
    return { introComplete: true, completeIntro: () => {} };
  }
  return ctx;
}
