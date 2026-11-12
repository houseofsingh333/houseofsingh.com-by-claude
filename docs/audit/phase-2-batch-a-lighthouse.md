# Phase 2, Batch A: Lighthouse mobile, before and after

**Setup.** Lighthouse 13.6, mobile, median of three runs per page.
- **Before:** main (after PR #71 opened).
- **After:** Batch A.
- **Conditions:** both built and served the same way on the same machine, runs alternating. These local numbers run slower than Production's; compare the two columns with each other, not with the audit's Production scores.

| Page | Perf before | Perf after | LCP before | LCP after | TBT before | TBT after | CLS after |
|---|---|---|---|---|---|---|---|
| About | 86 | 84 | 4.03 s | 4.20 s | 124 ms | 147 ms | 0.000 |
| Projects | 85 | 86 | 4.09 s | 3.88 s | 157 ms | 150 ms | 0.000 |
| A project (Zamana) | 86 | 86 | 4.04 s | 4.03 s | 133 ms | 155 ms | 0.000 |
| Journal | 85 | 84 | 4.04 s | 4.01 s | 139 ms | 184 ms | 0.000 |
| An entry (The saddle) | 83 | 84 | 4.11 s | 4.24 s | 182 ms | 195 ms | 0.000 |
| A month (November 2024) | 84 | 84 | 4.08 s | 4.07 s | 203 ms | 171 ms | 0.000 |

## What this shows

**M1 is not met.** Preconnect, high fetch priority and the lazy logo leave the mobile LCP where it was.

**Why: how the simulation counts.** Measured directly, the opening photograph paints early: the About portrait at 0.46 s, once the whole page has loaded, by 0.42 s. Lighthouse's slowed phone simulation then charges that photograph for every file that loaded before it:
- the JavaScript, 185 KB;
- four fonts, 114 KB, one of them the italic for the About quote;
- the styles, 31 KB;
- the header crest SVG, 33 KB;
- link prefetches, 25 KB;
- the photograph itself, 41 to 82 KB.

All of that goes through a simulated 1.6 Mbps connection.

**What follows.** On a page whose largest element is a photograph, the simulated LCP is set by the page's total early weight, not by how early the photograph is requested. Pages whose largest element is text (Home, Contact, the Shop) score about 1 s.

**The options** are in the PR description. The changes are kept: they are correct practice, they do no harm, and the lazy logo takes 14 KB off About's early weight.
