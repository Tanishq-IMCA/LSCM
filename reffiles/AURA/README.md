<div align="center">
  <h1>AURA Health Arena</h1>
  <p>An exclusive, AI-driven spiritual and mental wellness interface for AR/VR environments, built with a Python backend and a modern, glassmorphism web frontend.</p>
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
</p>

<p align="center">
  <a href="#"><img alt="Python" src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"></a>
  <a href="#"><img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"></a>
  <a href="#"><img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"></a>
  <a href="#"><img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"></a>
</p>

---

## About This Project

AURA Health Arena is a state-of-the-art mental wellness and spiritual alignment software designed for UEVR (Unreal Engine VR) applications, presented through a sleek web-based application UI. Moving away from traditional decoupled architectures, this system unifies a high-performance Python backend with a breathtaking frontend, deployable via a single unified script.

The software acts as a personalized sanctuary. It completely eschews mundane user ID systems in favor of an immersive "Out-of-the-Box Experience" (OOBE). By capturing the user's name, age, religion, and emotional state, the system dynamically curates an audio-visual environment tailored to elevate their mood, utilizing culturally relevant symbols, therapy prompts, guided reflections, and adaptive musical scores.

---

## Architectural Philosophy

*   **Unified Execution Paradigm**: The entire application stack is instantiated via a single master `.py` script, which generates the HTML and serves the complete interface.
*   **High-Fidelity UI/UX**: Drawing inspiration from sleek design languages like Apple's and the "Nexus_Imca" project, the interface relies heavily on advanced **Glassmorphism**.
    *   Curviness/Border-Radius is strictly limited to an elegant `5px` for a smooth but defined aesthetic.
    *   Background layers reflect deeply through the frosted glass elements.
    *   Fully fluid and seamlessly animated (fade-ins, fade-outs, slide-ins) ensuring zero jarring transitions.
*   **Audio-Reactive Environment**: The user interface is alive. Visual elements act as visualizers, dynamically pulsing, accelerating, and shifting color palettes based on the intensity and tone of the actively playing religious or calming audio.
*   **Cultural Mandala Engine**: Dynamic generation of sacred geometries and Chakras that respond to the user's spiritual alignment and emotional state.
*   **Local-First Control**: Core user data, therapy history, and journal records are stored locally for portability, privacy, and low-friction development.

---

## Current Features

*   **Unified Server**: A single Python script (`main.py`) generates and serves the entire web application.
*   **Network Accessibility**: The server is accessible from both `localhost` and the local WiFi network, with both addresses printed to the console on startup.
*   **Dynamic OOBE**: A fully animated "Out-of-the-Box Experience" to guide the user through initial setup.
*   **Narrated OOBE Sequencing**: The onboarding flow now synchronizes dedicated OOTB text, voice lines, and progression timing.
*   **Interactive Stress Calibration**: A multi-step questionnaire that dynamically adjusts a "stress-o-meter" in real-time.
*   **AI Reflections (Journaling)**: Advanced journaling with sentiment interpretation and personalized wellbeing insights.
*   **Multi-User Social Identity**: Robust profile system with social tags (e.g., `User#0001`) and security question recovery.
*   **Hardware Telemetry**: Real-time monitoring of CPU, RAM, and GPU/Disk usage directly within the dashboard.
*   **Adaptive Music Controller**: Global, persistent audio system that plays tracks based on the user's religion and mood.
*   **Therapy Assurance Audio**: Reassurance lines inside therapy are now mapped to deterministic assurance voice assets for reliable playback.
*   **Procedural Mandala Generation**: Real-time generation of cultural symbols that visually react to the environment's audio profile.
*   **Behavior-Driven Wellness Metrics**: Dashboard vitality and coherence now respond to therapy answer quality instead of static machine stats alone.
*   **Expanded Analytics Layer**: Includes response-balance charting, mood-delta tracking, AI behavioral insights, and a guided interpretation panel.
*   **Self-Healing Storage**: Detection and automatic restoration of corrupt profile data via proprietary protocols.
*   **Animated UI Elements**: High-fidelity Glassmorphism with smooth transitions, rotating spotlights, and staged page reveal choreography.
*   **Live Reload**: The web page automatically reloads if the Python server is restarted, ensuring a smooth development experience.

---

## Detailed Documentation

For an exhaustive deep-dive into the project's architecture, mission, and technical advancements, please refer to:

*   **[about the project.md](./about%20the%20project.md)**
*   **[software techstack.md](./software%20techstack.md)**

---

## Setup & Execution

### Prerequisites
-   Python 3.x

### Launching the Arena
To run the application, execute the `main.py` script from your terminal.

```bash
# This will start the server, generate the necessary files, and open the UI in your default browser.
python main.py
```

The server will provide two URLs:

*   **Local:** `http://127.0.0.1:5000`
*   **Network:** `http://<YOUR_LOCAL_IP>:5000` (accessible from other devices on the same network)

---

## Project Roadmap & Task Tracking

See `roadmap.md` for detailed task tracking.
