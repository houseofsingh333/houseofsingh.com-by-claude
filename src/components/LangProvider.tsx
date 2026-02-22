"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export type Lang = "en" | "pa";

const LangContext = createContext<Lang>("en");

export function useLang(): Lang {
  return useContext(LangContext);
}

export default function LangProvider({
  children,
}: {
  lang?: Lang;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const lang: Lang = pathname.startsWith("/pa") ? "pa" : "en";

  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}
