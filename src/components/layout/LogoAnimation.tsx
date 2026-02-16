"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import Link from "next/link";

type Props = {
  variant: "intro" | "header";
  onIntroComplete?: () => void;
};

// Dynamically import the JSON so it doesn't break if the file is missing
let animationData: object | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  animationData = require("../../../public/animations/logo.json");
} catch {
  animationData = null;
}

const SESSION_KEY = "hos-logo-intro-seen";

function IntroWithoutLottie({
  onIntroComplete,
}: {
  onIntroComplete?: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onIntroComplete?.(), 1500);
    return () => clearTimeout(timer);
  }, [onIntroComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <span className="text-2xl font-medium tracking-widest uppercase text-foreground animate-pulse">
        House of Singh
      </span>
    </div>
  );
}

function IntroWithLottie({
  onIntroComplete,
}: {
  onIntroComplete?: () => void;
}) {
  const [phase, setPhase] = useState<"playing" | "shrinking" | "done">(
    "playing"
  );

  useEffect(() => {
    if (phase === "done") {
      sessionStorage.setItem(SESSION_KEY, "true");
      onIntroComplete?.();
    }
  }, [phase, onIntroComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-all duration-1000 ease-in-out ${
        phase === "shrinking" || phase === "done"
          ? "opacity-0 pointer-events-none"
          : "opacity-100"
      }`}
    >
      <div
        className={`transition-all duration-1000 ease-in-out ${
          phase === "shrinking"
            ? "-translate-y-[45vh] scale-[0.25]"
            : "translate-y-0 scale-100"
        }`}
      >
        <Lottie
          animationData={animationData}
          loop={false}
          autoplay={true}
          onComplete={() => {
            setPhase("shrinking");
            setTimeout(() => setPhase("done"), 1000);
          }}
          style={{ width: 280, height: 280 }}
        />
      </div>
    </div>
  );
}

export default function LogoAnimation({ variant, onIntroComplete }: Props) {
  if (variant === "intro") {
    if (!animationData) {
      return <IntroWithoutLottie onIntroComplete={onIntroComplete} />;
    }
    return <IntroWithLottie onIntroComplete={onIntroComplete} />;
  }

  // Header variant: small logo
  if (!animationData) {
    return (
      <Link
        href="/"
        className="absolute left-1/2 -translate-x-1/2 text-sm font-medium tracking-widest uppercase text-foreground"
      >
        House of Singh
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className="absolute left-1/2 -translate-x-1/2"
      aria-label="House of Singh — Home"
    >
      <Lottie
        animationData={animationData}
        loop={false}
        autoplay={false}
        style={{ width: 80, height: 80 }}
      />
    </Link>
  );
}
