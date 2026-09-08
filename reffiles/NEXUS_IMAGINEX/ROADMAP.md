<div align="center">
  <h1>IMAGINEX</h1>
  <p>Build roadmap and single source of truth for the next agent. Read this end-to-end before writing a single line of code.</p>
</div>

<br><br>

> [!CAUTION]
> **PROPRIETARY AND CONFIDENTIAL**
>
> This project, along with the associated codebase, constitutes the proprietary and strictly confidential intellectual property of the originating developer.
>
> **UNAUTHORIZED USE IS STRICTLY PROHIBITED.**
> You may not copy, distribute, transmit, reproduce, publish, modify, or create derivative works from this source material without the explicit, documented authorization of the chief developer. Any unauthorized replication, reverse engineering, or dissemination of these proprietary systems will be subject to immediate legal action and aggressive prosecution under applicable intellectual property laws.
>
> *This repository does NOT grant an open-source license. All rights are explicitly reserved.*

<br><br>

---

### Status & Tech
<!-- Status Badges -->
<p align="center">
  <a href="#"><img alt="Document" src="https://img.shields.io/badge/Document-Build%20Roadmap-1f8b4c?style=for-the-badge&logo=readthedocs"></a>
  <a href="#"><img alt="Authority" src="https://img.shields.io/badge/Authority-Single%20Source%20of%20Truth-red?style=for-the-badge&logo=bookstack"></a>
  <a href="#"><img alt="Audience" src="https://img.shields.io/badge/Audience-Next%20Agent-blueviolet?style=for-the-badge&logo=robotframework"></a>
  <a href="#"><img alt="Phase" src="https://img.shields.io/badge/Phase-UI%20Polish-yellow?style=for-the-badge&logo=appveyor"></a>
</p>

<!-- Tech Stack Badges -->
<p align="center">
  <a href="#"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"></a>
  <a href="#"><img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"></a>
  <a href="#"><img alt="Express" src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white"></a>
  <a href="#"><img alt="pnpm" src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white"></a>
  <a href="#"><img alt="esbuild" src="https://img.shields.io/badge/esbuild-FFCF00?style=for-the-badge&logo=esbuild&logoColor=black"></a>
  <a href="#"><img alt="Drizzle" src="https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black"></a>
  <a href="#"><img alt="Zod" src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white"></a>
</p>

---

## About This Document

This is the build spec. The visual language is law — defaults trend toward the most polished, most animated, most "Gemini-concept-trailer" interpretation possible. Companion file: [`README.md`](./README.md).

Status legend: ✅ done · 🟡 partial · ⏳ pending backend / external service.

---

## 1. The 30-Second Pitch

**IMAGINEX** is an AI idea-generator. The user types what they're trying to do, picks a domain mode (Business / Product / Software / Content / Moonshot) plus sub-filters (B2B, SaaS, D2C, Marketplace…), optionally flips on **Turbo Mode**, hits send, and gets back **three side-by-side glass "Idea Cards."** Each card has a title, a description, a hairline separator, and four interactive **meters** (Easy to Execute, Profitable, Hard to Make, Potential). Clicking any meter inflates a small glass capsule that explains *why* the AI rated it that way.

---

## 2. Visual Language (Non-Negotiable)

### Color & Surface
- ✅ **Canvas**: near-black radial (`#0d0d11` → `#030305`).
- ✅ **Wallpaper blobs**: 32vw / max 480px, opacity 0.45–0.62, `mix-blend-mode: screen`, blur 70px. Bright enough to feel alive, low enough to never compete with content.
- ✅ **Glass panels**: `rgba(255,255,255,0.04)` with `backdrop-filter: blur(14px) saturate(115%)`. *No baked-in white gradient.* Only a hairline highlight on the top edge.
- ✅ **Hairlines**: 80% inset, gradient (transparent → accent → transparent), opacity 0.35.

### Typography
- ✅ **Bourgeois Book** (local OTF at `public/static/fonts/Bourgeois.otf`) for every "branded" surface — brand mark, page titles, idea-card titles, mode pill, chips, model selector. `font-display: block`.
- ✅ **Inter** for body copy and inputs.
- ✅ **`fonts-pending` guard**: titles are `visibility: hidden` until `document.fonts.ready` resolves (1.2s ceiling).
- ✅ **Brand mark**: `<i.fa-wand-magic-sparkles>` + `IMAGINEX`, gap 16px, accent-tinted wand with a subtle 5.5s float animation.

### Motion
- ✅ Drifting blobs (4 keyframes, 56–84s loops).
- ✅ Title shimmer (`shine-text`, 12s linear).
- ✅ Wave-line under titles (gradient slide).
- ✅ Card-in stagger (140ms / card).
- ✅ Meter fills (1.2s `cubic-bezier(0.19, 1, 0.22, 1)`).
- ✅ Turbo glow halo (pulse 1.4s).
- ✅ All animations honor `prefers-reduced-motion`.

### Theme Engine
- ✅ Eight themes (`themes.js`): Emerald Terrace · Cobalt Drift · Magma Field · Violet Eclipse · Rose Machinery · Bone White · Acid Lab · Void Amber. Each retunes accent + glow + 3 blob hues. Persisted to `localStorage`.

---

## 3. Information Architecture

| Route          | Page          | Purpose                                                  |
| -------------- | ------------- | -------------------------------------------------------- |
| `#/`           | Dashboard     | Brand mark · composer · idea cards.                      |
| `#/history`    | History       | Past sessions, filter bar, empty state.                  |
| `#/settings`   | Settings      | Identity · Appearance · AI Providers · Danger Zone.      |

Sidebar order: Imagine, History, (spacer + divider), Settings, Reset session.

---

## 4. Modes & Filters

Modes are the top-level intent. Each carries a filter row whose chips are `{ key, desc }` — `desc` shows on hover via `.nx-tooltip` so users always know what each term means.

| Mode      | Accent      | Filters (chip labels)                                                                                  |
| --------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| BUSINESS  | `#4ADE80`   | B2B, B2C, SaaS, D2C, Marketplace, Subscription, Service, Franchise                                     |
| PRODUCT   | `#60A5FA`   | Hardware, Consumer Goods, Wearable, Home, Eco, Premium                                                 |
| SOFTWARE  | `#A78BFA`   | SaaS, B2B, B2C, Mobile App, Web App, Browser Extension, Dev Tool, AI Wrapper, Open Source              |
| CONTENT   | `#FB923C`   | YouTube, TikTok, Newsletter, Podcast, Course, Community                                                |
| MOONSHOT  | `#F472B6`   | Bio, Space, Energy, Robotics, Web3, Ethics-First                                                       |

Switching modes triggers the **Interface Glitch** (clip-path + chromatic-aberration steps for 540ms across every glass panel + sidebar + bell).

---

## 5. Idea Cards

Three side-by-side cards (1-up below 1100px). Each card:

1. **Title** — Bourgeois, accent-tinted, glow-shadowed.
2. **Hairline** — 10% inset.
3. **Description** — Inter, 0.92rem, line-height 1.55.
4. **Hairline** — 10% inset.
5. **Meter list** — four meters:
    - `easy_to_execute` → "EASY TO EXECUTE"
    - `profitable`      → "PROFITABLE"
    - `hard_to_make`    → "HARD TO MAKE"
    - `potential`       → "POTENTIAL"

Click any meter ⇒ all other meters dim to 25%; an expanding glass **bubble** grows from the meter row carrying:
- A miniature copy of the clicked meter (re-animating its fill).
- A `bubble-reason` paragraph (the AI's explanation).
- A close ✕ in the top-right.

Click anywhere outside ⇒ bubble collapses, meters un-dim.

> **Removed**: the `common` meter is intentionally gone. Only the four above.

---

## 6. Backend (Pending)

Express 5 (`artifacts/api-server`) currently serves the static UI from `public/` and a `/api/healthz` endpoint. The next agent must add:

- 🟡 `POST /api/imagine` — body `{ prompt, mode, filters, model, turbo }` → returns `{ ideas: [{ title, description, meters: { easy_to_execute, profitable, hard_to_make, potential } }] }` with each meter as `{ value: 0–100, reason: string }`.
- ⏳ `GET /api/history` / `POST /api/history` — Drizzle + Postgres persistence of past sessions.
- 🟡 `POST /api/auth/google/start` / `POST /api/auth/openai/start` — provider OAuth flows; detect tier; persist tokens server-side. Other models are coming soon.
- 🟡 `GET /api/me` — return profile (display name, picture URL, instance tag, connected providers, detected tiers).

---

## 7. Build Order (Status)

1. ✅ Wallpaper engine (animated blobs + theme tinting).
2. ✅ Glass design system + sidebar + topbar + notice stack.
3. ✅ Brand mark + composer (mode pill, filter chips, turbo, model selector, send).
4. ✅ Idea Card render + meter expansion bubble.
5. ✅ History page UI + empty state.
6. ✅ Settings page UI (identity, appearance, providers, danger zone).
7. ✅ Bourgeois local font + `fonts-pending` guard.
8. 🟡 `/api/imagine` (LLM call, prompt construction, response shaping).
9. ⏳ History persistence (Drizzle migrations).
10. 🟡 Provider OAuth (Google / OpenAI) + tier detection.
11. ⏳ Streaming meter-reason text.

---

## 8. Acceptance Checklist

- [x] Big titles render in Bourgeois Book — never in a default browser font.
- [x] Glass panels are visibly transparent — wallpaper bleeds through.
- [x] Wallpaper blobs are bright but compact, less than 480px, opacity 0.45+.
- [x] Backdrop blur is a low single-digit (≤ 14px on glass, none global).
- [x] Hero brand mark never reflows the composer when state changes.
- [x] Turbo glow never widens the composer.
- [x] Filter chips read in natural case ("B2B", "SaaS", "Marketplace") and tooltip-explain on hover.
- [x] Idea Card meters are exactly four (no `common`).
- [x] All animations respect `prefers-reduced-motion`.
- [ ] `POST /api/imagine` returns three valid Idea Card payloads end-to-end.
- [ ] History page reads from a real DB.
- [ ] Provider connect buttons complete OAuth flows.

---

## 9. Files of Note

```
artifacts/api-server/
├── public/
│   ├── index.html                # Single-page shell
│   └── static/
│       ├── css/
│       │   ├── core.css          # Variables · glass · sidebar · typography · buttons
│       │   ├── wallpaper.css     # Animated blob engine
│       │   ├── dashboard.css     # Brand mark · composer · idea cards · meters
│       │   ├── history.css
│       │   ├── settings.css
│       │   └── turbo.css
│       ├── fonts/
│       │   └── Bourgeois.otf     # Brand font (local)
│       └── js/
│           ├── themes.js         # Theme registry + mode/filter catalog
│           ├── core.js           # iNexus.* helpers · profile · notices
│           ├── wallpaper.js
│           ├── router.js
│           ├── typewriter.js     # Composer placeholder cycler
│           ├── mode_toggle.js    # Mode pill · filter chips · tooltips · glitch
│           ├── turbo_mode.js
│           ├── idea_card.js      # Card render + meter expansion
│           ├── dashboard.js
│           ├── history.js
│           ├── settings_ui.js
│           └── boot.js
└── src/                          # Express app entry
```

---

## 10. Glossary

- **Brand mark** — wand glyph + IMAGINEX wordmark hero.
- **Mode** — top-level domain (BUSINESS, PRODUCT, SOFTWARE, CONTENT, MOONSHOT).
- **Filter** — sub-tag scoped to a mode (B2B, SaaS, etc.) with a plain-English tooltip.
- **Turbo Mode** — aggressive generation pass; visually a sustained electric-blue glow + screen-wide shake.
- **Interface Glitch** — chromatic-aberration step sequence applied across every glass surface on mode change.
- **Idea Card** — title + description + four meters; one of three returned per request.
- **Reason capsule** — the bubble that inflates when a meter is clicked.
