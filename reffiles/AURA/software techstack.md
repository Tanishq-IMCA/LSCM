<div align="center">
  <h1>AURA Software Techstack & Inner Workings</h1>
  <p>A full-stack architectural deep-dive into the systems, flows, rendering model, data contracts, and runtime behavior of the AURA Health Arena platform.</p>
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
<p align="center">
  <a href="#"><img alt="Maintained" src="https://img.shields.io/badge/Maintained%3F-yes-brightgreen.svg?style=for-the-badge"></a>
  <a href="#"><img alt="License" src="https://img.shields.io/badge/License-Proprietary-red.svg?style=for-the-badge"></a>
  <a href="#"><img alt="Architecture" src="https://img.shields.io/badge/Architecture-Unified%20Flask%20Stack-blue.svg?style=for-the-badge"></a>
</p>

<p align="center">
  <a href="#"><img alt="Python" src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"></a>
  <a href="#"><img alt="Flask" src="https://img.shields.io/badge/Flask-101010?style=for-the-badge&logo=flask&logoColor=white"></a>
  <a href="#"><img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"></a>
  <a href="#"><img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"></a>
  <a href="#"><img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"></a>
  <a href="#"><img alt="Chart.js" src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white"></a>
</p>

---

## 1. Executive Overview

**AURA Health Arena** is a single-application wellness environment built around a deliberately unified stack: a Python runtime, a Flask delivery layer, server-rendered templates, direct JSON persistence, and a handcrafted frontend interaction model using HTML, CSS, and JavaScript. It is not a microservice platform, not an ORM-driven SaaS, and not a component-framework-heavy SPA. The architecture is intentionally local-first, file-backed, visually rich, and low-ceremony.

At a product level, AURA behaves like a **digital sanctuary**. It supports identity creation, a first-run OOBE onboarding sequence, adaptive therapy, journaling, analytics, profile settings, persistent audio mood-scapes, and reactive visual systems. At a technical level, the application is a compact but layered full-stack system where the backend is responsible for routing, persistence, profile state, and telemetry endpoints, while the frontend is responsible for choreography, animation, ambient interaction, chart rendering, and session-local behavioral logic.

The important architectural decision is this: **AURA optimizes for cohesion over abstraction**. The same repository owns the backend logic, the data layout, the HTML templates, the runtime JavaScript, the visual design language, and the behavioral rules that tie therapy sessions to analytics. That makes the codebase faster to iterate on, easier to reason about in one workspace, and more suitable for a highly stylized product where UI behavior and product logic are tightly coupled.

This document explains:

- the actual software stack used by the current codebase
- how the server and client collaborate
- how user data is stored and updated
- how onboarding, therapy, journaling, settings, and analytics fit together
- how audio, charts, and animations are implemented
- how recent additions such as narrated OOBE text, therapy response analytics, assurance audio mapping, and staged page reveals work
- what the system does well today
- what tradeoffs the current architecture deliberately makes

---

## 2. Core Stack Summary

The current AURA stack can be understood as six layers.

| Layer | Primary Technology | Function |
| :--- | :--- | :--- |
| **Application Runtime** | `Python 3.x` | Executes the server, filesystem logic, data operations, and application services. |
| **Web Delivery Layer** | `Flask` | Routes pages and APIs, manages session state, and renders templates. |
| **Persistence Layer** | `JSON files + local folder structure` | Stores profiles, therapy history, journal entries, user preferences, and uploaded assets. |
| **Frontend Rendering** | `Jinja2 templates + HTML5` | Produces server-rendered page markup with embedded dynamic values. |
| **Interaction Layer** | `Vanilla JavaScript` | Controls onboarding, therapy logic, charts, animation sequencing, music continuity, and client-side UX behavior. |
| **Visual/Analytics Layer** | `CSS3 + Chart.js + Web Audio APIs` | Delivers the glassmorphism UI, panel animations, behavioral charts, and audio-reactive experiences. |

This is a **monolithic, local-first web application**. That term matters:

- **Monolithic** means routing, templating, storage, session logic, and domain logic live inside one deployable server process.
- **Local-first** means the product does not depend on an external database or cloud storage to operate.
- **Web application** means the UI is browser-rendered, but its visual quality is intentionally pushed toward a productized software feel rather than a conventional website.

---

## 3. Backend Runtime: Python as the Application Spine

Python is the control plane of the system. The current backend is not just a thin API wrapper. It is the spine that binds together:

- identity creation
- login and session handling
- profile hydration
- local storage directory management
- route rendering
- telemetry endpoints
- journaling analysis endpoints
- therapy/session persistence
- corrupt-profile recovery paths
- file-backed data updates

### Why Python works well here

Python is a practical fit for AURA because the app’s needs are centered on:

- rapid iteration
- local file handling
- JSON-heavy data movement
- route-based delivery
- text processing
- developer ergonomics for single-repo ownership

The product is not currently CPU-bound in a way that would justify a more operationally complex backend language. The heavy experience in AURA is mostly visual and browser-side. Python therefore remains the right tradeoff for speed of development and maintainability.

### The actual role of `main.py`

`main.py` acts as the application entry point and the route registry. It is responsible for:

- bootstrapping Flask
- initializing session configuration
- calling `storage_manager.init_storage()`
- defining login, OOBE, dashboard, analytics, journal, settings, and utility routes
- exposing REST-style JSON endpoints for profile and user data
- configuring the local file-based log handler

It is effectively the orchestration file for the whole app. It is not yet split into Blueprints or modules by domain, which keeps the project compact, though it also means route growth should eventually be managed more deliberately.

---

## 4. Delivery Layer: Flask and the Unified Routing Model

Flask is the runtime boundary between the browser and the application state.

### What Flask is doing in AURA

Flask handles:

- page routes such as `/`, `/settings`, `/journal`, `/analytics`, `/login`, and `/oobe`
- JSON endpoints such as `/api/profile`, `/api/users`, `/api/login`, `/api/storage/<key>`, and `/api/sys_usage`
- session-backed authentication
- template rendering
- access control through `@app.before_request`

### Why Flask is a good fit here

Flask is lightweight enough to keep AURA’s architecture simple while still supporting:

- server-rendered templates
- session cookies
- API endpoints
- local development speed

Because AURA’s frontend is heavily custom and not framework-dependent, Flask pairs well with this approach. It avoids the overhead of a larger opinionated stack while still letting the project behave like a cohesive application.

### Route design philosophy

The route layout is intentionally straightforward:

- content pages are rendered server-side
- data is fetched from simple JSON endpoints
- authentication gates most routes
- the frontend requests exactly the profile or storage data it needs

This makes the product easy to run locally and easy to understand:

1. browser hits route
2. Flask checks session
3. Flask renders template or returns JSON
4. frontend enhances the page with JavaScript

That sequence appears over and over in the codebase and is one of the reasons AURA remains tractable without a larger framework.

---

## 5. Data Persistence: The Local JSON Engine

One of the defining characteristics of AURA is that it does **not** rely on a relational database. Instead, it uses a structured local filesystem layout driven by `storage_manager.py`.

### Current data layout

The persistence structure is centered around the `data/` directory:

- `data/users/`
  - per-user profile JSON files
- `data/user_data/<username>/`
  - `preferences/`
  - `uploads/`
  - `survey_data/`
  - `dashboard_data/`
  - `journal_data/`

This split is useful because it separates:

- **identity profile** data
- **category-specific user activity** data
- **asset uploads**

### What `storage_manager.py` provides

`storage_manager.py` is the project’s internal persistence adapter. It is responsible for:

- initializing storage directories
- locating profiles case-insensitively
- loading and merging profile data
- storing avatar assets
- listing users
- deleting users
- mapping logical storage keys to actual JSON files
- writing data through a temp-file replace flow

### Why this model works

For AURA’s current scale, the JSON model has real strengths:

- no database setup burden
- very fast local iteration
- easy backups and portability
- transparent debugging
- low infrastructure complexity

### Tradeoffs of this model

The tradeoffs are equally real:

- no transactional guarantees across multiple files
- concurrent writes are not fully coordinated
- ad hoc schema evolution requires discipline
- data querying is application-side rather than database-native

For the current product, those tradeoffs are acceptable because:

- the app is local-first
- concurrency pressure is low
- data volumes are moderate
- the development velocity benefit is large

---

## 6. Identity, Authentication, and Session Model

AURA treats identity as part of the product experience rather than a utility screen.

### Identity creation flow

The login/setup experience feeds into `/api/users`, where a new user is created with:

- name
- age
- social tag
- password
- security question/answer
- avatar
- default theme seed values

The backend writes the initial profile and then immediately sets the session user, allowing the new account to transition into OOBE without a separate login round-trip.

### Session model

Flask session cookies are used for active authentication state. `main.py` configures:

- `SESSION_COOKIE_SAMESITE='Lax'`
- `SESSION_COOKIE_SECURE=False`
- `SESSION_COOKIE_HTTPONLY=True`
- `SECRET_KEY`

The `before_request` gate keeps non-public routes protected and redirects unauthenticated users back to login.

### Corrupt identity handling

AURA has recovery logic that goes beyond a normal toy app. There are explicit flows for:

- detecting malformed or incomplete profiles
- restoring minimum viable profile fields
- purging unrecoverable identities

This matters because the product stores data locally and needs resilience in the face of partial writes or stale profile states.

---

## 7. Frontend Rendering Model: Jinja2 + HTML Templates

AURA uses a server-rendered HTML model. Templates are not placeholders for a JS framework; they are the primary rendering layer.

### Why this matters

The app gets several benefits from this choice:

- direct route-to-page rendering
- easy injection of profile-dependent values
- smaller client boot complexity
- easier page-specific scripting

Each major page owns its own presentation and much of its own behavioral logic:

- `dashboard.html`
- `settings.html`
- `journal.html`
- `analytics.html`
- `login.html`
- `oobe.html`

### Base template strategy

`base.html` provides:

- global fonts and variables
- glassmorphism tokens
- sidebar shell
- overlay transitions
- wallpaper system
- global notices
- shared music engine
- page-entry fade behavior

This is important because it makes the visual language coherent across otherwise very different surfaces.

---

## 8. Visual System: Glassmorphism as a UI Engine

AURA’s visual layer is not “some CSS on top.” It is a deliberate design system.

### Key visual primitives

The visual identity revolves around:

- frosted glass backgrounds
- variable blur intensity
- thin light borders
- restrained `5px` corner treatment in many shared surfaces
- accent-color-driven glow
- reflected highlights
- smooth background persistence

### Why the visual system matters technically

The glass system is not only aesthetic. It affects:

- component hierarchy
- hover affordances
- layering decisions
- contrast rules
- animation timing

By centralizing these variables in `base.html`, the app can update the theme and have the rest of the system follow without rewriting each page independently.

### Page reveal engine

The recent page polish work introduced:

- shared staged fade/blur/slide panel reveals
- a page-reveal completion signal
- analytics text appearing after reveal, not before

That is an example of AURA’s frontend style: UX sequencing is treated as a product primitive, not an afterthought.

---

## 9. OOBE System: Cinematic Onboarding Architecture

The OOBE flow is one of the most product-defining technical systems in AURA.

### Files involved

- `templates/oobe.html`
- `static/js/oobe.js`

### What the OOBE actually does

It handles:

- greeting the user by name
- sequential onboarding narration
- stress-dial introduction
- spiritual alignment selection
- stress-source selection
- adaptive question sequence
- final sanctuary preparation state

### Technical characteristics

The OOBE uses:

- custom typewriter animation
- segmented text rendering
- controlled sequence timing
- explicit audio-text synchronization
- fallback mapping for narration file names
- controlled progression so text does not advance before narration completes

### Why it matters architecturally

This is more than an onboarding page. It establishes the AURA contract:

- the system is personalized
- the UI is responsive and theatrical
- audio, text, and interaction are tightly choreographed
- psychological framing is part of the product design

---

## 10. Audio Architecture: Music, Reassurance, and Narration

Audio in AURA exists in three distinct roles.

### 10.1 Global ambient/religious music

The persistent background music system:

- selects tracks based on religion or manual override
- persists playback time and paused state via `localStorage`
- restores audio continuity across page navigation

This gives the app a continuous environment instead of page-isolated sound.

### 10.2 OOBE narration

The onboarding flow now uses a controlled narration system tied to:

- explicit text-to-file lookup
- alias handling for non-literal filenames
- progression gates based on playback completion

This system exists because autoplay, file naming, and progressive UI text all need coordination.

### 10.3 Assurance audio during therapy

The reassurance text shown during therapy previously guessed MP3 filenames from rendered strings. That was unreliable. The current system uses an explicit mapping between each reassurance sentence and its exact audio file path.

This is a good example of the engineering philosophy in AURA:

- if dynamic inference is brittle, replace it with deterministic mapping
- preserve the user-facing text quality while controlling the asset resolution internally

---

## 11. Therapy Engine: Behavior, Session Flow, and Metrics

The therapy engine is one of the most important runtime systems in the product.

### Core responsibilities

It controls:

- session start/stop lifecycle
- breathing cycle choreography
- prompt presentation
- answer capture
- live stress adjustments
- reassurance text/audio insertion
- session duration tracking
- session summary persistence

### Runtime model

When therapy starts:

1. the interface shifts into therapy mode
2. breathing visuals activate
3. a timer begins
4. prompts begin after a short lead-in
5. answers increment `goodAnswers` or `badAnswers`
6. stress score is adjusted
7. charts and metrics are updated
8. session result is stored when therapy stops

### Why the question answers matter

Therapy answers now feed:

- live mood chart updates
- stored `goodAnswers` / `badAnswers`
- stored `moodDelta`
- analytics sentiment calculations
- dashboard vitality and coherence metrics

This is a major architectural improvement because it transforms therapy from a visual interaction into a measurable behavioral signal.

---

## 12. Dashboard Inner Workings

The dashboard is the central runtime cockpit of AURA.

### Key subsystems on the dashboard

- terminal/log feed
- main therapy visual surface
- mood chart
- stress/vitality/coherence stat block
- therapy session chart
- mandala/reassurance text system
- background audio controls

### Stress, vitality, and coherence

Originally:

- stress was mixed with CPU
- vitality mirrored RAM
- coherence mirrored GPU/disk

That made the latter two visually active but behaviorally meaningless.

Now:

- stress still reflects profile stress with a telemetry mix
- vitality derives from stress plus therapy answer balance
- coherence derives from stress plus therapy answer balance, weighted differently

That means the metrics now reflect actual emotional interaction patterns rather than unrelated machine usage.

### Mood chart behavior

The mood chart is lightweight but effective:

- it shifts based on post-answer stress updates
- it gives an ambient sense of movement during therapy
- it functions as an in-session emotional visualizer rather than a long-term analytics chart

The long-term analytics responsibility is handled separately in `analytics.html`.

---

## 13. Journal System and Reflective Analysis

The journaling surface is one of AURA’s most important non-therapy modules.

### Technical role of the journal

It provides:

- text entry creation and persistence
- mood tagging
- historical reflection access
- analysis hooks for sentiment interpretation

### Current analysis approach

The current backend route `/api/analyze_journal` uses a heuristic word-bucket model:

- negative term scoring
- positive term scoring
- sentiment bucket assignment
- randomized insight text selection

### Why this is important to document accurately

Some older repo text references GPT-based journaling analysis, but the current codebase is using an internal heuristic analyzer. For a technical doc, the current implementation matters more than historical intent.

That does not diminish the feature. It simply means the present stack is:

- local
- fast
- deterministic
- lower-complexity than an external model integration

---

## 14. Analytics System: From Session Logs to Behavioral Readouts

The analytics page has evolved from a summary screen into a proper interpretation layer.

### Data sources used

Analytics now consumes:

- profile stress score
- therapy session count
- session dates
- session durations
- positive answer counts
- negative answer counts
- mood delta per session

### Primary visual outputs

The page now includes:

- baseline stress indicator
- therapy sessions count
- average sentiment
- day streak
- stress and sentiment trajectory chart
- therapy response balance chart
- AI behavioral insights list
- “What This Means For You” interpretation panel

### The therapy response balance chart

This chart is especially important because it visualizes:

- positive responses as upward bars
- negative responses as downward bars
- mood delta as a line across sessions

This gives the user a far better sense of emotional movement than a single neutral score.

### AI insight generation

The insights system now synthesizes:

- engagement footprint
- response bias
- recent momentum
- reactivity range
- latest-session interpretation

### “What This Means For You”

This panel is intentionally more human-facing than the insight list. It translates the data into:

- a summary paragraph
- action bullets
- watch-out bullets
- takeaways

That is a strong example of AURA’s hybrid design approach: the system does not stop at measurement; it interprets the meaning of the measurement inside the same interface.

---

## 15. System Telemetry and Runtime Feedback

AURA uses `psutil` to expose host telemetry through `/api/sys_usage`.

### What is currently measured

- CPU percent
- RAM percent
- disk percent (currently standing in for a GPU-like lane in the UI)

### Why telemetry is in the product

Telemetry serves two roles:

1. environmental immersion
2. operational awareness

The dashboard uses this data to make the software feel alive, but it can also be part of caution signaling during therapy if the environment appears stressed.

### Caution on terminology

The current code uses disk usage for the third lane in places where the UI may suggest “GPU” or coherence-like behavior. That is a presentational choice, not literal GPU measurement.

---

## 16. Animation and Interaction Model

AURA depends heavily on frontend timing quality.

### Interaction strategy

The app uses:

- hand-authored CSS transitions
- JS-triggered fades and state toggles
- chart updates rather than hard re-renders
- low-level DOM updates instead of framework diffing

### Benefits of this approach

- total control over feel
- no framework overhead
- easy sequencing between text, audio, and motion
- direct ownership of timing curves

### Risks

- more custom logic to maintain
- state coordination bugs can be easier to introduce
- animation and data behavior can become tightly coupled

That tradeoff is acceptable here because AURA’s product value is closely tied to crafted UX timing.

---

## 17. Security Posture and Local Privacy

AURA is privacy-oriented by architecture, though it is not yet a hardened enterprise system.

### Strengths of the current posture

- local-first data storage
- HTTP-only session cookie configuration
- no mandatory cloud profile backend
- no external database footprint
- clear proprietary boundaries

### Practical limitations

- passwords are currently file-stored and not visibly hashed in the current profile persistence model
- authorization is route/session-based, not role-layered
- local filesystem access still implies strong trust in the host machine

### What that means in practice

AURA is currently best understood as:

- strong for local ownership
- strong for portability
- moderate for prototype-grade privacy
- not yet equivalent to a zero-trust hardened production environment

That distinction matters in any serious technical overview.

---

## 18. Operational Characteristics

### Local development model

Running the app is intentionally simple:

```bash
python main.py
```

That launches the server and exposes the application on port `5000`.

### Why simple launch matters

For a project like AURA, the operational simplicity is a feature:

- easy contributor onboarding
- fast iteration
- lower environment friction
- fewer moving pieces to debug

### Logging

The system writes logs under `data/logs/`, but generated log files are now excluded from normal Git tracking to avoid noisy commits and branch divergence.

That is a practical, high-value cleanup because runtime-generated files should not shape Git history in an application like this.

---

## 19. Architectural Strengths

There are several things the current AURA architecture does very well.

### 19.1 Cohesion

The product logic, visuals, and storage model all fit together naturally.

### 19.2 Fast iteration

Because the stack is small and local, changes move quickly from idea to implementation.

### 19.3 Experience ownership

AURA can sequence motion, audio, copy, and state in a way that would be slower to coordinate across fragmented services and frontend frameworks.

### 19.4 Transparency

With JSON storage and template-driven pages, it is easy to inspect and understand what the system is doing.

### 19.5 Product-specific flexibility

Highly custom experiences such as narrated OOBE, therapy reassurance mapping, or data-driven interpretation panels can be implemented without fighting framework conventions.

---

## 20. Architectural Constraints and Scaling Considerations

The current approach is effective, but it also has predictable constraints.

### What will eventually become pressure points

- `main.py` growing too large
- template scripts becoming densely stateful
- JSON schema drift over time
- lack of stronger write coordination
- client logic duplication across pages

### Likely next technical evolution paths

If AURA expands significantly, the next sensible steps would be:

- split route domains into Flask Blueprints
- centralize shared client utilities
- formalize session and profile schemas
- introduce stronger password storage practices
- add a structured migration strategy for file-backed data

Not because the current stack is wrong, but because successful products eventually need better structure than they need more raw speed.

---

## 21. Recommended Mental Model for New Contributors

If a new engineer needs to understand AURA quickly, the correct mental model is:

1. **AURA is a unified local-first Flask application**
2. **The UI is handcrafted and behavior-heavy**
3. **Most user data is JSON-backed**
4. **The dashboard is a live runtime surface**
5. **Therapy and onboarding are sequencing systems, not static pages**
6. **Analytics is now a behavioral interpretation layer, not just charts**
7. **Visual feel is part of correctness**

That last point is important. In many products, animation polish is optional. In AURA, animation quality is part of whether the product feels coherent at all.

---

## 22. Overall Technical Assessment

AURA is best described as a **cohesive experiential application** rather than a conventional CRUD web app.

Its stack is intentionally focused:

- Python for control
- Flask for delivery
- JSON for persistence
- Jinja templates for structure
- Vanilla JavaScript for orchestration
- CSS and Chart.js for rich presentation

The result is a platform that can:

- onboard users cinematically
- react to therapy answers meaningfully
- persist behavior locally
- translate sessions into understandable analytics
- maintain a distinctive visual identity

The codebase is not trying to be abstract for abstraction’s sake. It is trying to make a specific kind of product feel alive.

That is the right way to understand both its strengths and its engineering choices.

---

## 23. Overall Product Layers at a Glance

To summarize the full system in one compact hierarchy:

- **Identity Layer**
  - user creation
  - authentication
  - corrupt-profile recovery
- **Experience Layer**
  - OOBE
  - page transitions
  - glassmorphism UI
  - typed and narrated content
- **Wellness Layer**
  - therapy prompts
  - stress adjustment
  - breathing engine
  - reassurance text/audio
- **Reflection Layer**
  - journal persistence
  - sentiment interpretation
- **Analytics Layer**
  - session counts
  - mood delta
  - response balance
  - trend interpretation
- **Infrastructure Layer**
  - Flask routes
  - JSON storage
  - logging
  - local telemetry

That layered view is the clearest way to see AURA as a software product: each part supports the others, and most of the value comes from how closely the parts are integrated.

---

## 24. Closing Note

The current AURA codebase is already more than a prototype UI. It is a functioning software environment with a real internal architecture, a disciplined visual language, persistent behavioral storage, and increasingly coherent data interpretation.

Its real technical identity is this:

**AURA is a tightly integrated, local-first, experience-driven wellness platform built for emotional calibration through software choreography.**

That identity should guide future work more than any generic industry trend. Whenever the stack evolves, the right question is not “what is fashionable,” but:

**Does this keep the product cohesive, interpretable, fast to iterate, and emotionally precise?**

If the answer stays yes, the architecture will continue to scale in the direction the product actually needs.

---

<div align="center">
  <p><i>"Engineered for calm. Structured for continuity. Designed to feel alive."</i></p>
</div>
