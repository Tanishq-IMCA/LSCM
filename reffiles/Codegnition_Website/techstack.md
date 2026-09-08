<h1 align="center">Software Architecture & Tech Stack</h1>
<br>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Decoupled_Hybrid-critical?style=for-the-badge" alt="Architecture">
  <img src="https://img.shields.io/badge/Deployment-Vercel_%2B_AWS-orange?style=for-the-badge" alt="Deployment">
  <img src="https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54" alt="Python">
  <img src="https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next JS">
  <img src="https://img.shields.io/badge/Framer%20Motion-black?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion">
</p>

> [!CAUTION] 
> PROPRIETARY AND CONFIDENTIAL 
> This project, along with the associated codebase, constitutes the proprietary and strictly confidential intellectual property of CODEGNITION. UNAUTHORIZED USE IS STRICTLY PROHIBITED. You may not copy, distribute, transmit, reproduce, publish, modify, or create derivative works from this source material without the explicit, documented authorization of the chief developer. Any unauthorized replication, reverse engineering, or dissemination of these proprietary systems will be subject to immediate legal action and aggressive prosecution under applicable intellectual property laws. 
> This repository does NOT grant an open-source license. All rights are explicitly reserved.

## 1. Executive Overview
CODEGNITION operates on a heavily optimized, decoupled architecture. Unlike standard monolithic setups, we utilize a blazing-fast React-based frontend to handle complex visual choreographies, paired with a robust Python backend to handle heavy data processing and API orchestration. 

This is not a template site. It is a highly interactive, bespoke web application that relies on local-first development principles, GitHub version control, and multi-stage deployment to ensure zero downtime and maximum performance.

---

## 2. Master Folder Architecture
Since we are using modern frontend tools with a powerful Python backend, we are splitting the repository into two distinct domains to keep the codebase clean.

```text
CODEGNITION_SANCTUARY/
├── frontend/                     # The Glassmorphism UI & Animation Engine
│   ├── public/                   # Static assets (images, dynamic wallpapers)
│   ├── src/
│   │   ├── app/                  # Next.js App Router (The 3 Phases)
│   │   │   ├── (landing)/        # Home, Marketplace, About Us
│   │   │   ├── (client)/         # Signed-in User Dashboard (Account, Checkout)
│   │   │   └── (admin)/          # Administrative Control Panel
│   │   ├── components/           # Reusable UI (Sleek Header, Glass Panels)
│   │   ├── lib/                  # Helper functions and type definitions
│   │   └── styles/               # Tailwind CSS & global variables
│   ├── package.json
│   └── next.config.js
├── backend/                      # The Python Computational Engine
│   ├── api/                      # Route handlers and REST endpoints
│   ├── core/                     # Business logic & security hardening
│   ├── database/                 # Database connection logic
│   ├── main.py                   # The unified backend initialization script
│   └── requirements.txt          # Python dependencies
├── docs/                         # Developer Handbooks & Artifacts
│   ├── README.md                 
│   ├── roadmap.md                
│   └── techstack.md              
└── .gitignore                    # Excludes node_modules, .env, and local caches

---
```
## 3. Setup & Execution Pipeline
To run the application locally on your machine:

1. **Environment Setup:**
   Create a `.env` file in the project root and add your `NGROK_AUTHTOKEN` if you wish to use the public sharing feature:
   ```
   NGROK_AUTHTOKEN=your_authtoken_here
   ```

2. **Run the Application:**
   From the project root, simply run:
   ```bash
   python main.py
   ```
   The script will automatically handle all Node.js and Python dependencies.

---

## 4. Core Stack Summary

| Layer | Primary Technology | Function |
| ------ | ------ | ------ |
| **Frontend Framework** | React + Next.js | Handles client-side routing, component state, and server-side rendering for optimal load speeds. |
| **Styling & UI** | Tailwind CSS | Utility-first framework used to construct the custom Glassmorphism tokens and dark-mode aesthetics. |
| **Animation Engine** | Framer Motion | Replaces standard CSS transitions with high-performance, timeline-based DOM choreographies. |
| **Backend Runtime** | Python (Uvicorn/FastAPI) | Executes heavy computational logic, API routing, and backend security validations. |
| **Database & Auth** | Supabase (PostgreSQL) | Manages identity, user sessions, client order data, and administrative ticket storage. |
| **Version Control** | Git + GitHub | The absolute source of truth for the codebase, enabling synchronized workflow across team devices. |

---

## 5. Frontend Rendering & Animation Model
The visual identity of CODEGNITION relies heavily on **Glassmorphism** and cinematic pacing. The UI is not a static canvas; it is a fluid environment.
* **The Header:** A sleek, minimalist header with dynamic elements and user-centric navigation.
* **The Engine:** Framer Motion is utilized to manage complex scroll-triggers, dynamic wallpapers, and page transitions, mirroring the fluidity seen on top-tier agency portfolios.

---

## 6. The Three-Phase Environment Strategy
To protect our infrastructure and ensure flawless updates, CODEGNITION uses a strict deployment pipeline:
* **Development (Local):** Written inside JetBrains IDEs on local hardware. Immediate live-reloading and zero-cost iteration.
* **Preview (Repl.it Sandbox):** Code is pulled from GitHub to Repl.it to simulate a live cloud environment, verify API handshakes, and test mobile responsiveness.
* **Production (AWS/Vercel):** The finalized, bulletproof code is deployed to the live domain. AWS EC2 handles the Python backend (strictly monitored to prevent overages), while Vercel auto-hosts the Next.js frontend globally.

---

## 7. Security & Operational Characteristics
* Authentication is strictly managed via HTTP-only session cookies and Supabase Row Level Security (RLS).
* The Administrative Panel is heavily gated, ensuring that client tickets and order telemetry are never exposed to the public landing routes.

---