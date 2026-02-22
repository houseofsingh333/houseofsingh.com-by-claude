# Punjabi Fonts

Place the following WOFF2 files in this directory:

- `NotoSansGurmukhi-Thin.woff2` (weight 100)
- `NotoSansGurmukhi-Light.woff2` (weight 300)
- `NotoSansGurmukhi-Regular.woff2` (weight 400)
- `NotoSansGurmukhi-Medium.woff2` (weight 500)
- `NotoSansGurmukhi-SemiBold.woff2` (weight 600)
- `NotoSansGurmukhi-Bold.woff2` (weight 700)

These are declared in `src/app/globals.css` via `@font-face` and applied
automatically when `html[data-lang="pa"]` is set by the bilingual middleware.
