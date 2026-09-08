<h1 align="center">CODEGNITION: The Hybrid Nexus</h1>
<br>

> [!CAUTION] 
> PROPRIETARY AND CONFIDENTIAL 
> This project, along with the associated codebase, constitutes the proprietary and strictly confidential intellectual property of CODEGNITION. UNAUTHORIZED USE IS STRICTLY PROHIBITED. You may not copy, distribute, transmit, reproduce, publish, modify, or create derivative works from this source material without the explicit, documented authorization of the chief developer. Any unauthorized replication, reverse engineering, or dissemination of these proprietary systems will be subject to immediate legal action and aggressive prosecution under applicable intellectual property laws. 
> This repository does NOT grant an open-source license. All rights are explicitly reserved.

<p align="center">
  <img src="https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next JS">
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React">
  <img src="https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54" alt="Python">
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Framer%20Motion-black?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion">
</p>

## About This Project
CODEGNITION is a state-of-the-art hybrid agency platform, acting as the digital storefront and operational dashboard for our dual software and game development services. Designed with a breathtaking, minimalistic dark-mode aesthetic, it leverages highly optimized Glassmorphism and fluid DOM choreographies to deliver an unmatched user experience.

The platform is divided into three primary operational phases:
1. **The Landing Page:** The public face (Home, Marketplace, About Us) showcasing our products with dynamic wallpapers and smooth scrolling.
2. **The Client Portal:** A secure, authenticated dashboard for users to track orders, manage accounts, and interact with our services.
3. **The Administrative Panel:** The internal command center for managing customer tickets, parsing data, and overseeing deployments.

## Architectural Philosophy
- **Decoupled Execution:** The frontend is driven by a blazing-fast Next.js/React environment for seamless SPA transitions, while a heavy-duty Python backend handles intense computational logic and secure database bridging.
- **High-Fidelity UI/UX:** The interface relies heavily on advanced Glassmorphism. Corner radii are strictly limited, and background layers reflect deeply through frosted glass elements.
- **Cinematic Interactivity:** Powered by GSAP and Framer Motion, the UI features dynamic wallpapers, staggered fade-ins, and element choreography that responds to user intent without sacrificing performance.

## Setup & Execution

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- Git

### Launching the Development Environment
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
   
###