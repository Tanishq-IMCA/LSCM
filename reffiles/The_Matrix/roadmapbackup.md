# Project Matrix: Decentralized Collaborative Environment

## Architectural Roadmap & Implementation Strategy

This document serves as the master blueprint for the development, architecture, and deployment of a fully decentralized, peer-to-peer collaborative workspace. The core philosophy centers on user autonomy, local-first data retention, and seamless network communication without relying on centralized server infrastructure. The user interface will heavily feature fluid, dynamic dot-matrix aesthetics, rendering high-performance mathematical animations to convey system state.

---

## Technology Stack & Infrastructure

The project utilizes a hybrid architecture (Path A), coupling a high-performance Python backend for network and system operations with a modern web technology stack for advanced graphic rendering.

*   **Backend Application Server:** ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
*   **Core Language:** ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
*   **Database & Persistence:** ![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
*   **P2P Networking & Media:** ![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white) `aiortc`
*   **Frontend Technologies:** ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
*   **Graphics & Animation Engine:** ![WebGL](https://img.shields.io/badge/WebGL-990000?style=for-the-badge&logo=webgl&logoColor=white) / HTML5 Canvas API
*   **Desktop Packaging:** `PyWebView` / `PyInstaller`

---

## System Architecture

The application is structured as a locally hosted micro-server bundled alongside an embedded browser window. This isolates the heavy computational requirements of fluid dynamics and graphical rendering from the low-latency requirements of peer-to-peer network packet handling.

### 1. The Local-First Backend Engine
The Python process acts as the brain of the application. Upon launch, it binds to a local port and serves a RESTful API and WebSocket endpoints via FastAPI. This server orchestrates local database reads/writes, manages background threads for connection polling, and handles the cryptographic verification of peer identities.

### 2. Peer-to-Peer Protocol
Communication relies entirely on WebRTC. While WebRTC requires a signaling mechanism to establish the initial connection (the "handshake"), our architecture will implement decentralized signaling using direct out-of-band data exchanges (e.g., sharing a cryptographic identity string). Once the signaling phase completes, WebRTC establishes secure UDP tunnels (or TCP fallbacks) through NATs and firewalls. Data channels will handle text chat and state synchronization, while media streams will handle eventual audio/video capabilities.

### 3. Distributed State Synchronization
Because there is no central database, the application must resolve state conflicts locally. If User A and User B both modify a task while offline, the system will utilize a simplified implementation of Conflict-Free Replicated Data Types (CRDTs) or an event-sourcing ledger. Every action (create, update, delete) is treated as an immutable event, timestamped, and broadcasted to known peers upon reconnection.

### 4. Rendering and Aesthetics
The interface will abandon traditional desktop paradigms. The background will consist of a WebGL-accelerated interactive dot-matrix. This involves mapping a grid of particles and applying fluid dynamic algorithms (such as Navier-Stokes approximations or simple spring-mass dampers) to react to user inputs, system events, and timers (e.g., simulating water physics or digital sand).

---

## Detailed Implementation Roadmap

### Phase 1: Local Foundation & Core Backend
The objective of this phase is to build the isolated, single-player experience. Before nodes can communicate, they must be able to function independently and persist data.

- [ ] Initialize Python virtual environment and dependency lockfile.
- [ ] Configure the FastAPI application structure (routes, models, controllers).
- [ ] Implement SQLite database initialization and schema generation.
- [ ] Design the local data models (SQLAlchemy or raw SQL wrappers).
    - `Peers` table: identity strings, public keys, last known IP, nickname.
    - `Tasks` table: UUID, payload, status, timestamp, author.
    - `EventLedger` table: sequential log of all local actions for future syncing.
- [ ] Create REST endpoints for creating, reading, updating, and deleting local tasks.
- [ ] Implement local logging mechanisms for debugging application state without console output.

### Phase 2: Frontend Bootstrapping & IPC Setup
Establishing the bridge between the Python backend and the HTML/JS frontend.

- [ ] Set up the static file serving via FastAPI (serving `index.html`, `main.js`, `styles.css`).
- [ ] Implement `PyWebView` to launch the application in a chromeless, native-feeling window.
- [ ] Establish WebSocket connections between the Javascript frontend and the Python backend for real-time local updates.
- [ ] Create the foundational HTML structure, ensuring a strictly dark-themed, minimalist canvas.
- [ ] Bind frontend API calls (fetch) to the backend to display local database records.

### Phase 3: The Dot-Matrix Rendering Engine (Aesthetics)
Developing the visual identity of the software before complex network logic clutters the frontend.

- [ ] Initialize a full-screen HTML5 Canvas or WebGL context.
- [ ] Implement a procedural grid generation script to create the dot matrix.
- [ ] Develop the physics loop (requestAnimationFrame) to handle particle updates.
- [ ] Implement collision detection and mouse-hover repulsion (the "Nothing" glyph interactive feel).
- [ ] Create the "Timer Fluid" simulation: algorithms to transition dot colors and states to simulate rising/falling liquid based on external timer data.
- [ ] Optimize the rendering loop to ensure it does not consume excessive CPU/GPU, leaving resources for WebRTC.
- [ ] Overlay the standard UI elements (task lists, text inputs) using highly translucent, heavily blurred CSS backdrops (glassmorphism) over the canvas.

### Phase 4: Peer-to-Peer Networking & NAT Traversal
The most complex technical phase. Establishing the invisible network between independent instances.

- [ ] Integrate `aiortc` into the Python backend.
- [ ] Develop the Identity Generation module (generating unique cryptographic keypairs for a new installation).
- [ ] Create the Manual Handshake mechanism.
    - Export local WebRTC SDP offers to a base64 encoded string.
    - UI for pasting a remote SDP string.
    - Generate and export SDP answers.
- [ ] Implement STUN server configurations (using public Google STUN servers) to resolve public IPs.
- [ ] Establish reliable WebRTC Data Channels once the handshake completes.
- [ ] Develop connection keep-alive polling and silent auto-reconnection for known peers.

### Phase 5: Distributed State Synchronization (The Hive Mind)
Ensuring all connected nodes share the exact same view of the task board and chat history.

- [ ] Define the JSON schema for network messages (e.g., type: "TASK_UPDATE", payload: {...}).
- [ ] Implement the Event Publisher: whenever a local task is modified, serialize the event and push it to all active WebRTC Data Channels.
- [ ] Implement the Event Subscriber: listen for incoming network messages, validate their cryptographic signature, and write changes to the local SQLite database.
- [ ] Develop the Initial Sync protocol: when a peer connects, compare ledger timestamps and request missing events.
- [ ] Build conflict resolution logic (e.g., Last-Writer-Wins based on precise UTC timestamps).

### Phase 6: Collaborative Tooling & Workspace
Fleshing out the actual usable features of the application over the established P2P network.

- [ ] Build the Chat UI: rendering text messages over the dot-matrix background.
- [ ] Implement real-time typing indicators via volatile WebRTC messages (messages not saved to the database).
- [ ] Build the Collaborative Task Board UI (Kanban style or advanced list views).
- [ ] Implement drag-and-drop task management, triggering network sync events on drop.
- [ ] Add visual indicators for remote peer presence (e.g., highlighting a task if another user is currently interacting with it).

### Phase 7: Media Streaming & Direct File Transfer
Expanding the capabilities of the network beyond simple text and JSON payloads.

- [ ] File Transfer Protocol: chunking large files locally, transmitting chunks over WebRTC data channels, and reassembling them on the recipient's machine.
- [ ] Implement progress bars integrated into the fluid dot-matrix UI.
- [ ] Setup WebRTC Media Streams for eventual audio/video communication.
- [ ] Module Expansion: (Feature-set Report Pending).

### Phase 8: Advanced Security, Encryption, and Auditing
Securing the application against malicious peers and network interception.

- [ ] Enforce End-to-End Encryption (E2EE) on all payloads before they enter the WebRTC channel, utilizing NaCl or standard AES-GCM.
- [ ] Implement local database encryption (SQLCipher) so onboard device storage remains secure if the physical device is compromised.
- [ ] Audit all input fields to prevent injection attacks (both SQL injection on the backend and XSS on the frontend canvas overlays).
- [ ] Develop peer-blocking functionality to ignore untrusted cryptographic signatures.

### Phase 9: Build Pipeline, Packaging, and Distribution
Transforming the raw code into a double-click executable for end-users.

- [ ] Write the `PyInstaller` specification file (`.spec`).
- [ ] Configure static asset bundling (ensuring HTML/JS/CSS and SQLite binaries are included in the final executable).
- [ ] Test the build process on Windows environments, handling anti-virus false positives and code signing.
- [ ] Test the build process on macOS environments, compiling to `.app` and generating `.dmg` installers.
- [ ] Implement an auto-updater mechanism that checks a known repository (e.g., GitHub Releases) for new versions and prompts the user.

### Phase 10: Future Trajectories
Areas of expansion once the core application stabilizes.

- [ ] Mesh Routing: allowing User A to talk to User C by routing traffic through User B (Feature-set Report Pending).
- [ ] Mobile Application Ports: compiling the web frontend to React Native or similar, interfacing with a mobile-optimized P2P stack (Feature-set Report Pending).
- [ ] Advanced Workspace Integrations: calendar syncing, external API webhooks (Feature-set Report Pending).

---

## Architectural Guidelines & Coding Standards

1.  **Asynchronous by Default:** All network and database operations in Python must utilize `async`/`await`. Blocking the main thread will cause the UI to stutter and WebRTC connections to drop.
2.  **Graceful Degradation:** If network connectivity fails, the application must remain entirely functional. The user should be able to create tasks and write messages; the system will queue these and resolve them quietly once a connection is re-established.
3.  **Aesthetic Primacy:** The visual experience is a core product feature. The dot-matrix animations must maintain a strict 60 FPS. If heavy computation is required, it must be offloaded to Web Workers in JavaScript or background threads in Python.
4.  **Zero Trust Configuration:** Never assume incoming data from a peer is safe. Validate all JSON schemas, sanitize all strings, and verify all timestamps before applying changes to the local state.
5.  **Immutability in State:** Avoid updating existing records in the ledger. Append new state-change events. This makes debugging synchronization issues significantly easier and allows for time-travel debugging.
