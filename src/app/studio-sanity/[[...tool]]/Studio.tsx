"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity/studio";

export default function Studio() {
  return <NextStudio config={config} />;
}
