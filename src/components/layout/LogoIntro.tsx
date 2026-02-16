"use client";

import { useState, useEffect } from "react";
import LogoAnimation from "./LogoAnimation";

const SESSION_KEY = "hos-logo-intro-seen";

export default function LogoIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show intro if not already seen this session
    if (sessionStorage.getItem(SESSION_KEY) !== "true") {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <LogoAnimation
      variant="intro"
      onIntroComplete={() => setShow(false)}
    />
  );
}
