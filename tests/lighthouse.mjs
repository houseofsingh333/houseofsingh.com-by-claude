#!/usr/bin/env node
/**
 * tests/lighthouse.mjs
 *
 * Lighthouse on the main page types, mobile and desktop, against agreed
 * limits (tests/budgets.json, "lighthouse"). One run is noisy, so each page
 * is measured several times and the median is compared; the limits sit a
 * margin below the measured values. Fails only when a median crosses one.
 *
 * Each page and form is first loaded once, unmeasured ("warmup"): a fresh
 * server resizes every photograph on its first request and prepares the
 * page, and that work shared the machine with the first measured runs.
 * Home, measured first and the richest in photographs, swung from 69 to
 * 100 because of it (13 Nov); warmed, it measures like the other pages.
 *
 *   node tests/lighthouse.mjs [url]       (default http://localhost:3100)
 *
 * Lighthouse is fetched at a fixed version on first use (npx), not added to
 * the site's dependencies: it is large and only this check needs it.
 * LIGHTHOUSE=/path/to/lighthouse uses a copy already on the machine.
 */
import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { chromium } from "@playwright/test";

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const BASE = (process.argv[2] || process.env.BASE_URL || "http://localhost:3100").replace(/\/$/, "");
const { lighthouse: limits } = JSON.parse(readFileSync(join(here, "budgets.json"), "utf8"));
const RUNS = Number(process.env.LIGHTHOUSE_RUNS || limits.runs || 3);
const WARMUP = Number(process.env.LIGHTHOUSE_WARMUP ?? limits.warmup ?? 1);
const LIGHTHOUSE_VERSION = "13.6.0";
const [cmd, ...pre] = process.env.LIGHTHOUSE ? [process.env.LIGHTHOUSE] : ["npx", "--yes", `lighthouse@${LIGHTHOUSE_VERSION}`];
const out = mkdtempSync(join(tmpdir(), "lh-"));

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

async function measure(path, form, i) {
  const file = join(out, `${form}-${path.replace(/\W+/g, "_") || "home"}-${i}.json`);
  const args = [
    ...pre,
    `${BASE}${path}`,
    "--quiet",
    "--output=json",
    `--output-path=${file}`,
    "--only-categories=performance",
    "--chrome-flags=--headless=new --no-sandbox",
    ...(form === "desktop" ? ["--preset=desktop"] : []),
  ];
  await run(cmd, args, { env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH || chromium.executablePath() }, maxBuffer: 64 * 1024 * 1024 });
  const r = JSON.parse(readFileSync(file, "utf8"));
  if (r.runtimeError) throw new Error(`${path} (${form}): ${r.runtimeError.message}`);
  return {
    performance: Math.round((r.categories.performance.score ?? 0) * 100),
    lcpMs: Math.round(r.audits["largest-contentful-paint"].numericValue),
    tbtMs: Math.round(r.audits["total-blocking-time"].numericValue),
    cls: Math.round(r.audits["cumulative-layout-shift"].numericValue * 1000) / 1000,
  };
}

const rows = [];
const failures = [];
for (const form of ["mobile", "desktop"]) {
  const limit = limits[form];
  for (const path of limits.pages) {
    for (let i = 0; i < WARMUP; i++) await measure(path, form, `warmup-${i}`);
    const runs = [];
    for (let i = 0; i < RUNS; i++) runs.push(await measure(path, form, i));
    const m = {
      performance: median(runs.map((r) => r.performance)),
      lcpMs: median(runs.map((r) => r.lcpMs)),
      tbtMs: median(runs.map((r) => r.tbtMs)),
      cls: median(runs.map((r) => r.cls)),
    };
    const bad = [
      m.performance < limit.performance && `performance ${m.performance} < ${limit.performance}`,
      m.lcpMs > limit.lcpMs && `LCP ${m.lcpMs} ms > ${limit.lcpMs} ms`,
      m.tbtMs > limit.tbtMs && `blocking time ${m.tbtMs} ms > ${limit.tbtMs} ms`,
      m.cls > limit.cls && `layout shift ${m.cls} > ${limit.cls}`,
    ].filter(Boolean);
    for (const b of bad) failures.push(`${path} (${form}): ${b}`);
    rows.push({ form, path, ...m, runs: runs.map((r) => r.performance).join(" "), ok: !bad.length });
    console.log(`${form.padEnd(7)} ${path.padEnd(18)} perf ${m.performance}  LCP ${m.lcpMs} ms  TBT ${m.tbtMs} ms  CLS ${m.cls}  (runs: ${rows.at(-1).runs})${bad.length ? "  FAIL" : ""}`);
  }
}
rmSync(out, { recursive: true, force: true });

// The summary on the CI run's page.
if (process.env.GITHUB_STEP_SUMMARY) {
  const lim = (f) => limits[f];
  const table = [
    `### Lighthouse (median of ${RUNS} runs, after ${WARMUP} unmeasured warm up)`,
    "",
    "| | Page | Performance | LCP | Blocking time | Layout shift | |",
    "|---|---|---|---|---|---|---|",
    ...rows.map((r) => `| ${r.form} | \`${r.path}\` | ${r.performance} (min ${lim(r.form).performance}) | ${(r.lcpMs / 1000).toFixed(2)} s (max ${(lim(r.form).lcpMs / 1000).toFixed(1)}) | ${r.tbtMs} ms (max ${lim(r.form).tbtMs}) | ${r.cls} (max ${lim(r.form).cls}) | ${r.ok ? "ok" : "**over**"} |`),
    "",
  ].join("\n");
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, table);
}

if (failures.length) {
  console.log(`\n${failures.length} over the limits:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log("\nall within the limits");
