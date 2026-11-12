import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "31g7gu7n",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  },
  studioHost: "houseofsingh",
  // The one registered Studio for the workspace "houseofsingh-studio": every
  // `sanity schema deploy` and `sanity deploy` goes to it, so tools that read
  // the schema by workspace find exactly one (docs/sanity-studio.md). Created
  // 26 Jul 2026; the older registration from 16 Feb is removed in sanity.io/manage.
  deployment: { appId: "fskxqjztrs8832zg24aemo58" },
});
