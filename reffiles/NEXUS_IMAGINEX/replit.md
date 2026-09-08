# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Required Secrets

Set these in the Replit Secrets panel before running the app:

| Secret | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (auto-provisioned by Replit DB integration) |
| `SESSION_SECRET` | Random secret for signing session cookies. Generate with `openssl rand -hex 32`. If absent, a temporary secret is auto-generated per process — sessions won't survive restarts. |

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Application: iNexus — Imagine It

Located at `artifacts/api-server/`. Express 5 server (port 8080) that serves a
static dark-themed AI idea-generator UI from `public/`. Single-page app with
hash routing (`#/`, `#/history`, `#/settings`).

### Frontend conventions

- **Typography**
  - Big titles use `Bourgeois`, with `Fraunces` (Google Fonts, `display=block`)
    as the served fallback so titles never flash a default browser font.
  - Drop a real Bourgeois OTF/WOFF2 in `public/static/fonts/` to override.
  - Body uses Inter.
- **Glass panels** — `.glass-panel` is genuinely transparent (no white-gradient
  fake light), only a hairline highlight on the top edge.
- **Wallpaper** — small dim animated blobs under a dark vignette in
  `static/css/wallpaper.css`. Re-tinted by the active theme via CSS vars.
- **Filters** — modes/filters live in `static/js/themes.js`. Each filter is
  `{ key, desc }`; `desc` is shown on hover via the shared `.nx-tooltip`
  rendered by `mode_toggle.js`.
- **Idea cards** — meters defined in `static/js/idea_card.js` are
  `easy_to_execute`, `profitable`, `hard_to_make`, `potential` (no `common`).
- **Glass button system** — `.glass-btn` (optionally wrapped in
  `.button-wrap` + `.button-shadow`) provides a premium refractive pill
  button using `@property --angle-1/--angle-2`.
- **Layout stability** — `.hero-block` reserves min-height, `.hero-title`
  reserves 2.4em, and `.turbo-btn::after` paints its glow on a halo
  `inset:-8px` so toggling Turbo never resizes the composer.
  - The `.model-row` has a fixed-width `.model-toggle-name` (145px,
    ellipsizes) so swapping between short/long model names never shifts
    the `|` divider or the live progress bar to its right.
- **Live generation progress bar** — `static/js/gen_progress.js` exposes
  `window.iNexusGenProgress` with `start(estimateMs)`, `report(received,
  expected)`, `complete()`, and `reset()`. Currently driven by the
  simulated send delay in `dashboard.js`. **Backend roadmap:** when real
  model streaming lands, call `start()` on stream open, `report()` per
  token chunk (overrides the time-based curve with the real ratio),
  `complete()` on stream end, and `reset()` on error/abort. Painting is
  GPU-only (`transform: scaleX` + tabular-nums on the percentage label)
  so the row never reflows during 60fps updates.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
