<div align="center">

# ⚡ Solaris Core | Energy Predictive Dashboard

<!-- Status Badges -->
[![Maintained](https://img.shields.io/badge/Maintained%3F-yes-brightgreen.svg?style=for-the-badge)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](#)
[![Made with Python](https://img.shields.io/badge/Made%20with-Python%203.10+-1f425f.svg?style=for-the-badge&logo=python&logoColor=white)](#)

<!-- Tech Stack Badges -->
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Vite](https://img.shields.io/badge/Vite-B73CE4?style=for-the-badge&logo=vite&logoColor=FFD62E)](#)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=threedotjs&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
[![Scikit-Learn](https://img.shields.io/badge/Scikit_Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](#)

*An advanced, AI-driven glassmorphic interface designed to predict, visualize, and analyze residential energy consumption and solar yield in real-time.*

<br/>

</div>

## 🌌 Overview

Solaris Core is a dual-architecture web application designed to bridge the gap between heavy data science and sleek, modern user interfaces. By utilizing a **FastAPI** backend to run a **Random Forest Regressor** machine learning model, the system predicts future energy demands and plots them directly into a cyber-styled, hardware-accelerated **React** frontend.

The crown jewel of the system is the **Premises Overview**, utilizing WebGL and **Three.js** to render a fully interactive, live-updating 3D model of the user's infrastructure—complete with data nodes mapping real-time grid draws directly onto the vehicles, powerwalls, and solar arrays.

---

## 🛠️ Tech Stack & Architecture

### **Frontend: The Interface**
- **React.js & Vite:** Component-based architecture bundled with Vite for near-instant HMR and optimized build sizes.
- **Three.js & WebGL:** Renders the interactive 3D environment, complete with dynamic lighting, reflections, and CSS2D HTML tracking labels.
- **Chart.js:** Powers the animated, area-filled line charts for telemetry data.
- **Vanilla CSS3:** Custom-built glassmorphism engine with dynamic blur layers, `backdrop-filter` rendering, and animated text overlays (no bloated CSS frameworks).

### **Backend: The Engine**
- **Python & FastAPI:** High-performance, asynchronous REST API serving as the bridge between the ML model and the browser.
- **Scikit-Learn (Random Forest):** A robust ensemble learning method chosen for its ability to handle non-linear tabular data (weather, time, rates) without the massive overhead or overfitting risks of deep learning neural networks.
- **Pandas & NumPy:** Handles structural formatting, CSV generation, and telemetry cleaning.

---

## 🚀 Getting Started

To get the Solaris Core running on your local machine, you will need to spin up both the API server and the Frontend development server.

### 1. Initialize the AI Backend
Open a terminal at the project root and navigate to the backend directory:
```bash
cd backend
```
*(Optional but recommended: Activate your Python virtual environment)*

Install the required Python modules:
```bash
pip install -r api/requirements.txt
```

Generate the dataset, train the Random Forest model, and spin up the API:
```bash
python data/generator.py
python model/train_model.py
uvicorn api.app:app --reload --port 8000
```
> **Note:** Leave this terminal running! The API is now listening on `http://localhost:8000`

### 2. Initialize the Web Frontend
Open a **new** terminal at the project root and navigate to the frontend directory:
```bash
cd frontend
```

Install the Node modules and launch the Vite development server:
```bash
npm install
npm run dev
```
> The dashboard is now live! Open your browser to the URL provided by Vite (usually `http://localhost:5173`).

---

## 🧠 Why Random Forest?
When designing the predictive system, we opted for **Random Forest Regression** over deep learning (like LSTMs).

1. **Efficiency:** Random Forest constructs a multitude of decision trees during training and outputs the average prediction. It trains in seconds.
2. **Tabular Superiority:** Energy consumption relies heavily on discrete, structured variables (Time of Day, Weather condition, Grid Rates). Random Forest inherently excels at routing these variables without requiring the massive, highly-normalized datasets that neural networks demand.
3. **Resilience:** It is incredibly robust against overfitting and handles missing or highly variable telemetry nodes with ease.

---

## 📂 Directory Structure

```text
├── Guide/
│   └── Command_Instructions.txt  # Comprehensive guide for academic explanation
├── backend/                      # Python API & ML Models
│   ├── api/                      # FastAPI implementation
│   ├── data/                     # Generation scripts and CSV databases
│   └── model/                    # Model training logic and exported .pkl files
└── frontend/                     # React UI
    ├── public/                   # Static assets, fonts, and 3D (.glb) models
    └── src/
        ├── components/           # Modular React components (Dashboard, 3D House, Charts)
        └── styles/               # Glassmorphism CSS engine
```

---
<div align="center">
  <sub>Built for the future of energy infrastructure.</sub>
</div>