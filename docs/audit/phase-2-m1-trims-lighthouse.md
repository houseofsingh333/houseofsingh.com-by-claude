# Phase 2, M1 option 2: Lighthouse mobile, before and after

**Setup.** Lighthouse 13.6, mobile, median of three runs per page; Home seven runs.
- **Before:** main with Batch D.
- **After:** the same plus the three trims.
- **Conditions:** both built and served the same way on the same machine, runs alternating. Local numbers run slower than Production's; compare the two columns with each other.

| Page | Perf before | Perf after | LCP before | LCP after | TBT before | TBT after | Total KB before | Total KB after |
|---|---|---|---|---|---|---|---|---|
| Home | 99 | 95 | 1.22 s | 1.22 s | 118 ms | 176 ms | 586 | 579 |
| About | 82 | 87 | 4.25 s | 3.87 s | 212 ms | 129 ms | 493 | 468 |
| Projects | 84 | 88 | 4.06 s | 3.77 s | 209 ms | 124 ms | 506 | 498 |
| A project (Zamana) | 85 | 86 | 4.04 s | 3.80 s | 153 ms | 130 ms | 614 | 608 |
| Journal | 84 | 88 | 4.07 s | 3.88 s | 144 ms | 125 ms | 632 | 626 |
| An entry (The saddle) | 84 | 87 | 4.05 s | 3.91 s | 198 ms | 109 ms | 632 | 626 |
| A month (November 2024) | 84 | 87 | 4.07 s | 3.91 s | 179 ms | 158 ms | 534 | 528 |

**Home** (seven runs each):
- Performance: median 99 before, 98 after.
- Blocking time: median 118 ms before, 148 ms after.

The link previews' work now lands just after the load instead of during it. On Home, whose largest element is text, that adds a little blocking time.

**The trims:**
- **The crest file** (`public/images/hos-logo.svg`): optimised at precision 2, 81 KB to 63 KB (about 6 KB less over the network). Identical to the eye: at the header's real size, 52 of 104,000 pixels change by more than a trace, single soft-edge pixels where lines meet.
- **No prefetching during the first load** (`src/components/Link.tsx`): on Projects, previews used to start at 0.4 s, mid-load (14 of them); now they start at 1.3 s, after the load. Later page changes prefetch as before.
- **The quote italic:** the same font at its one weight, 400, 39 KB to 22 KB. The quote renders pixel-identical. It was already loaded only on About; the saving is the file.
