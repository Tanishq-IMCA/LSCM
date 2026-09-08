***

### Roadmap & Status

<h1 align="center">Status & Tech Roadmap</h1>
<br>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge" alt="Roadmap">
  <img src="https://img.shields.io/badge/Phase-03_Client_Portal-blue?style=for-the-badge" alt="Sprint">
</p>

> [!CAUTION] 
> PROPRIETARY AND CONFIDENTIAL 
> This project, along with the associated codebase, constitutes the proprietary and strictly confidential intellectual property of CODEGNITION. UNAUTHORIZED USE IS STRICTLY PROHIBITED.

## Project Phases

### Phase 1: Foundation & The UI Skeleton
The initial setup of the decoupled architecture and the raw navigational shell.

- [x] **Repository Initialization**: Established the `frontend/`, `backend/`, and `docs/` split with placeholder backend directories for later expansion.
- [x] **Header Shell**: Implemented a slim public navigation for `Home`, `Marketplace`, and `About Us`, with the CODEGNITION wordmark linking into the admin route.
- [x] **Glassmorphism Base Engine**: Added restrained frosted-panel styling with shallow blur to avoid the performance issues called out in the planning notes.
- [x] **Routing Framework**: Setup the Next.js App Router for the three public pages and an internal `/admin` route, plus a stub client directory for the next phase.

### Phase 2: Immersive User Experience (Landing Page & Marketplace)
Crafting the first impressions, dynamic wallpapers, and animation libraries.

- [x] **Dynamic Wallpaper System**: Implemented a multi-layered, animated blob wallpaper that provides a subtle, high-end feel.
- [x] **GSAP/Framer Motion Integration**: Wired up animation libraries for smooth page transitions, text reveals, and interactive hover effects.
- [x] **UI Polish**: Refined the UI with consistent glass morphism, sharp corners, and dynamic accent lines.
- [x] **Responsive Scaling**: Ensured the glass panels and animations scale flawlessly across desktop and mobile devices.
- [x] **Marketplace Refinement**: Optimized grid layouts, implemented real-time filtering, sticky sidebars, and integrated the "Custom Build" workflow gateway.

### Phase 3: Identity & The Client Portal
Refining multi-user support, authentication, and the private dashboard workflows.

- [ ] **Supabase Auth Hookup**: Connecting the frontend to secure PostgreSQL backend logic for user registration/login. [DELAYED] [SUBJECT TO CHANGE TO B3 INSTANCES FROM AWS]
- [x] **Client Dashboard UI (Account Page)**: Built the authenticated portal interface for managing editable profile data (Phone, Gender, Age, Company), handling up to 3 shipping addresses, and dynamic save state detection.
- [x] **Custom Order Funnel**: Engineered a multi-stage, animated intake process (`/custom-order`) with dynamic thematic coloring, progress tracking, and live pricing calculations.
- [x] **Checkout Flow UI**: Refined the checkout experience with an empty cart state redirect, dynamic payment method cycling, and address selection integration.
- [ ] **State Management**: Ensuring seamless data flow between the Python backend and the React frontend. [WIP]

### Phase 4: The Administrative Command Center
The internal portal for the agency's daily operations.

- [ ] **Ticket Management System**: Interface for viewing and responding to client requests.
- [ ] **Order Tracking Pipeline**: Visualizing incoming project requests and deployment statuses.
- [x] **Telemetry Stub**: Added a basic admin summary endpoint and first-pass internal dashboard cards.

### Phase 5: Polish & Deployment Rehearsal
Final refinements and testing the multi-environment pipeline.

- [ ] **Repl.it Preview Rehearsal**: Pulling the GitHub repo to Repl.it to test cloud functionality and simulate a production rollout. [NEEDA INVESTIGATE THIS FURTHER FOR A BETTER ALTERNATIVE]
- [x] **Unified Local Launcher**: Added a root `main.py` that resolves backend and frontend dependencies before booting both services.
- [ ] **Performance Audit**: Ensuring animations do not cause memory leaks or layout thrashing.
- [ ] **Production Push**: Final migration to Vercel (Frontend)[FRONTEND MANAGEMENT IS SUBJECT TO CHANGE] and AWS EC2 (Backend) once the product is pristine.