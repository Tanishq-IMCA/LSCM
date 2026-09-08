<div align="center">
  <h1>IMAGINEX</h1>
  <p>An AI idea-generator with a dark, glassmorphism interface — pitch a problem, pick a domain, get three sharp, side-by-side ideas with reasoning meters.</p>
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
  <a href="#"><img alt="Maintained" src="https://img.shields.io/badge/Maintained%3F-yes-brightgreen.svg?style=for-the-badge"></a>
  <a href="#"><img alt="License" src="https://img.shields.io/badge/License-Proprietary-red.svg?style=for-the-badge"></a>
  <a href="#"><img alt="Phase" src="https://img.shields.io/badge/Phase-UI%20Polish-yellow.svg?style=for-the-badge"></a>
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
  <a href="#"><img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"></a>
  <a href="#"><img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"></a>
  <a href="#"><img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"></a>
  <a href="#"><img alt="Font Awesome" src="https://img.shields.io/badge/Font_Awesome-528DD7?style=for-the-badge&logo=fontawesome&logoColor=white"></a>
</p>

---

## About This Project

IMAGINEX is an AI idea-generator built around a single, fast loop: describe what you're trying to do, choose a **mode** (Business, Product, Software, Content, Moonshot) and any **filters** (B2B, SaaS, D2C, Marketplace…), optionally engage **Turbo Mode** for a more aggressive pass, and receive **three side-by-side glass "Idea Cards."** Each card has a title, a description, and four interactive **meters** (Easy to Execute · Profitable · Hard to Make · Potential). Click any meter and a small glass capsule expands to explain *why* the AI rated it that way.

The aesthetic is intentional: dark canvas, drifting colored blobs, real glass panels (no fake light), Bourgeois titles, Inter body. Every tap, hover, and mode switch is choreographed — this is meant to feel like a Gemini concept trailer, not a generic dashboard.

---

## Features

### Dashboard
-   **IMAGINEX brand mark**: Static wand-and-wordmark hero in Bourgeois — never reflows the composer.
-   **Composer**: Auto-resizing textarea with a cycling, never-default placeholder.
-   **Mode pill + filter chips**: Five modes (Business, Product, Software, Content, Moonshot), each with a tailored filter row. Hover any chip for a plain-English explanation of what the term means.
-   **Turbo Mode**: A bolt button that engages a sustained electric-blue glow + screen-wide shake; glow lives on a halo *outside* the button so layout never expands.
-   **Model selector**: Pick which underlying model handles the request (Gemini 2.5 Pro / Flash, GPT-5, GPT-5 Mini, GPT-4.1).
-   **Idea Cards**: Three glass cards with title, description, and four animated meters. Click a meter to inflate a reason capsule.

### History
-   **Sessions list**: Every generation grouped by prompt, with mode/filter chips on each band.
-   **Filter bar**: Filter by mode, sort by newest / oldest / top-potential, and free-text search past prompts.
-   **Empty state**: Sleek "Nothing imagined yet" panel with a one-tap return to the dashboard.

### Settings
-   **Identity**: Display name, profile picture, instance tag (copyable).
-   **Appearance**: Eight curated themes — each retunes the accent color and the wallpaper blob palette in a single, animated swap.
-   **AI Providers**: Sign in with Google (Gemini) and OpenAI (ChatGPT). The app detects your tier and unlocks the corresponding models. Other models are coming soon.
-   **Danger Zone**: Clear all history; reset the local instance.

### System
-   **Notice stack**: A non-intrusive top-left toast lane for mode changes, theme swaps, and confirmations.
-   **Page transitions**: Blurred overlay fade between dashboard / history / settings, with a syncing sidebar indicator.
-   **Reduced-motion safe**: All shines, drifts, and shimmers honor `prefers-reduced-motion`.

---

## Project Roadmap

### Core Features
- [x] **Static frontend served by Express 5**: Dark, animated, fully self-contained shell at `/`.
- [x] **Dark glassmorphism design system**: Real transparency, hairline highlights, Bourgeois titles.
- [x] **Wallpaper engine**: Drifting colored blobs, theme-tinted, brighter and less blurry pass.
- [x] **Mode + filter taxonomy**: Five modes with descriptive, hoverable filter chips.
- [x] **Composer + Turbo Mode**: Stable layout regardless of state.
- [x] **Idea Cards UI**: Title, description, four meters, expanding reason capsules.
- [x] **History page UI**: Bands, filter bar, empty state.
- [x] **Settings page UI**: Identity, appearance, AI providers, danger zone.
- [x] **Bourgeois brand font**: Loaded locally with `font-display: block` so titles never flash a default font.

### Future Enhancements
- [ ] **Backend idea generation**: `/api/imagine` endpoint — accepts prompt + mode + filters + model and returns three Idea Cards.
- [ ] **Provider OAuth**: Sign in with Google / OpenAI; detect tier; persist tokens.
- [ ] **History persistence**: Wire the History page to a real DB (Drizzle + Postgres).
- [ ] **Session-aware prompts**: Inject the user's display name into the AI's system prompt.
- [ ] **Streaming reasons**: Stream the meter-reason text as it's generated.
- [ ] **Mobile layout pass**: First-class touch + small-viewport experience.

---

## Setup Instructions

### Prerequisites
-   Node.js 24+
-   pnpm 10+

### Required Secrets

Set these in the Replit Secrets panel before running the app:

| Secret | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (auto-provisioned by the Replit DB integration) |
| `SESSION_SECRET` | Random secret for signing session cookies. Generate with `openssl rand -hex 32`. If absent, a temporary secret is auto-generated per process — sessions won't survive restarts. |

### 1. Install
```bash
pnpm install
```

### 2. Run the app
```bash
PORT=8080 pnpm --filter @workspace/api-server run dev
```

Then open [http://localhost:8080](http://localhost:8080).

### 3. Typecheck / build
```bash
pnpm run typecheck       # full typecheck across all packages
pnpm run build           # typecheck + build all packages
```

---

## Contributing

As this is a personal project, direct contributions are not sought. However, feel free to draw inspiration from the code for your own projects, respecting the proprietary nature of the work.
