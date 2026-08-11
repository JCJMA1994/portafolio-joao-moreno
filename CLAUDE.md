# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # dev server at http://localhost:4321
npm run build        # astro check + astro build (types fail the build)
npm run typecheck    # astro check only
npm test             # vitest unit tests
npm run test:watch   # vitest in watch mode
npm run test:e2e     # Playwright E2E (requires a prior build; starts preview server automatically)
npm run format       # Prettier write
npm run lint         # Prettier check
```

Run a single unit test file:
```bash
npx vitest run tests/unit/utils.test.ts
```

First time running E2E tests, install the browser:
```bash
npx playwright install --with-deps chromium
```

E2E tests run against the **production build** (not dev server). Run `npm run build` first — `playwright.config.ts`'s `webServer` starts the preview server automatically but does NOT trigger a build.

## Architecture

Astro 7 portfolio with `output: 'static'` and per-route SSR opt-out (`export const prerender = false`). Everything is static (SSG) and served from the CDN except two SSR routes:

| Route | Mode | Reason |
| --- | --- | --- |
| `/api/click` | server | writes click events to Turso/libSQL |
| `/links/stats` | server | reads live data + HTTP Basic Auth |

Path alias `@/*` maps to `src/*` (configured in both `tsconfig.json` and `vitest.config.ts`).

### Content collections

Defined in `src/content.config.ts` with Zod validation — a schema violation causes the **build to fail**, not a silent bad deploy:

- `blog` — `src/content/blog/*.{md,mdx}`. Schema in `src/content/blog-schema.ts` (extracted from the config so Vitest can import it without Astro's runtime). Required fields: `title` (≤70 chars), `description` (50–160 chars), `pubDate`, `tags[]`, `level` (enum: `principiante` | `intermedio` | `avanzado`). Optional: `series.name` + `series.order`.
- `tips` — `src/content/tips/*.{md,mdx}`. Each tip has a `number` field that is its permanent address — never reuse or reorder numbers.
- `work` — `src/content/work/*.{md,mdx}`. Project case studies.

### Blog series

Two-layer system:

1. **Integrity index** — `src/data/series.ts` declares each series with its post IDs in order. This is the source of truth that a unit test guards.
2. **Render logic** — `src/lib/series.ts` operates on `CollectionEntry<'blog'>` shapes to compute `SeriesNav` (prev/next/index/total). Intentionally decoupled from `astro:content` so it can be unit-tested with plain fixtures.

When adding a post to a series, update both `src/data/series.ts` (integrity index) and the post's frontmatter (`series.name` + `series.order`).

### Tips: thin-content threshold

A tip under 300 words (`THIN_CONTENT_THRESHOLD` in `src/lib/utils.ts`) is shown inline on `/tips` and does **not** get its own URL at `/tips/[slug]`. This is enforced in `src/pages/tips/[slug].astro`.

### Single source of truth for profile data

`src/data/profile.ts` drives the home page, CV, JSON-LD, and meta tags. `src/data/changelog.ts` drives the versioned timeline (the `major`/`minor`/`patch` level controls typographic weight — don't override it for visual effect). `src/data/links.ts` drives `/links`.

### The only hydrated component

`src/components/OfflineDemo.tsx` is the single React component with a `client:visible` directive. All other React components (including Lucide icons and shadcn/ui primitives) render to static HTML at build time.

### Middleware

`src/middleware.ts` protects `/links/stats` with HTTP Basic Auth. It uses constant-time comparison (`safeEqual`) and **fails closed** — if `STATS_USER` or `STATS_PASSWORD` env vars are absent, the route returns 401 unconditionally.

## Astro 7 gotchas

- **Astro 7's default HTML compression** removes whitespace between newline-separated expressions (same behavior as JSX). `© {year}\n{profile.name}` renders `© 2026JoseName` without a space. Compose concatenated strings in the frontmatter, not inline in the template. There are E2E regression tests for this in `tests/e2e/home.spec.ts`.
- **Rust HTML compiler** — malformed HTML (unclosed tags, invalid nesting) is a hard build error, not a warning.
- **Markdown processor is Sätteri** (not remark/rehype). For remark/rehype plugins, install `@astrojs/markdown-remark` and configure `markdown: { processor: unified() }`.
- **`@astrojs/db` was removed in Astro 7.** Click analytics use `@libsql/client` against Turso directly.
- **Code highlighting** uses Shiki with `theme: 'css-variables'` — colors come from `src/styles/globals.css`, not from a default dark theme.

## Tests

- **Unit** (`tests/unit/`) — Vitest, node environment. Files: `changelog`, `utils`, `profile`, `links`, `blog-schema` (Zod schema), `series` (render logic), `series-index` (integrity index).
- **E2E** (`tests/e2e/`) — Playwright on Desktop Chrome + Pixel 7. Cover structural HTML invariants (unique `h1`, JSON-LD types), theme persistence, tag pages, 404 status, and the full OfflineDemo flow.
- **Accessibility** (`tests/e2e/a11y.spec.ts`) — `@axe-core/playwright` runs on six pages: home, blog index, article, series, tips, CV. Any serious/critical violation fails the suite. Also tests keyboard focus and level-badge contrast in both color schemes.

## CI

Three parallel jobs (after a shared `verificar` gate):
1. `verificar` — typecheck + format + unit tests
2. `e2e` — build → Playwright (needs `verificar`)
3. `lighthouse` — build → Lighthouse CI with budget ≥0.95 perf, 1.0 a11y/SEO, LCP <1.5s, CLS <0.05 (needs `verificar`)

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | optional | Turso DB URL for click analytics |
| `TURSO_AUTH_TOKEN` | optional | Turso auth token |
| `STATS_USER` | optional* | Basic Auth user for `/links/stats` |
| `STATS_PASSWORD` | optional* | Basic Auth password for `/links/stats` |

*If absent, `/links/stats` returns 401. The site works fully without any of these; analytics simply aren't recorded.
