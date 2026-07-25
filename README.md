# 📸 AuraStudio AI — Photobooth & Tactile Studio Workbench

> A modern, high-performance AI-powered Photobooth web application built with **Vite, React 19, TypeScript, Tailwind CSS v4**, and powered directly by **Pollinations AI**.

---

## 🌟 Overview

**AuraStudio AI** brings the authentic Korean Y2K photobooth experience directly to your browser, augmented by generative AI. It features hands-free wave gesture shutters, real-time live camera filter previews, dynamic AI pose recommendations with SVG silhouette overlays, true Image-to-Image style transformations, and a 100% customizable Canvas photo strip editor.

---

## ✨ Key Features

### 🖐️ 1. Hands-Free Gesture Shutter (`GESTURE SHUTTER`)
- **Real-Time Motion Energy Meter**: Wave your hand or move in front of the camera to fill the energy meter ($0\% \rightarrow 100\%$).
- **Auto-Countdown Trigger**: Reaching the motion threshold automatically triggers a 3-2-1 countdown shutter hands-free.
- **Smart Cooldown & Single-Shot Lock**: Automatically disarms after capture to prevent infinite repeating shutter loops.

### 🎨 2. Style Engine Presets & Smart Custom Stylist
- **Live Real-Time Viewfinder Preview**: Applied instantly on the camera feed using CSS filter pipelines (*Cyberpunk 2077, 90s Korean Film, Anime Studio, 3D Pixar, Neon Noir*).
- **True Image-to-Image AI Transformation**: Uploads captured webcam photos to Pollinations Media Storage and processes them with Pollinations Image AI (`model=flux`).
- **Smart Custom Prompt Engine**: Type any prompt (e.g. *"1920s Noir"*, *"Golden Sunset"*) — the app automatically derives matching camera color matrices and generates custom preset cards.

### 💃 3. AI Pose Stylist & Dynamic SVG Silhouette Guide
- **Personalized Vibe Input**: Enter your desired mood or photo style (e.g., *"Cozy Korean cafe date"*).
- **Pollinations LLM Pose Generation**: Calls Pollinations Text API to generate 3 unique step-by-step pose instructions.
- **Dynamic SVG Overlay**: Draws glowing silhouette pose guidelines directly over your webcam stream for body alignment.

### 🎞️ 4. 100% Customizable Y2K Photo Strip Canvas Studio
- **Format Layouts**: Choose between **Vertical Strip (1x4)** or **Korean Grid (2x2)** formats.
- **Custom Color Picker**: Preset aesthetic palettes or direct Hex Color Picker (`<input type="color">`) for background frames and text.
- **Sticker Packs**: Render aesthetic Y2K stickers (*Stars, Kawaii, Cyber*) directly onto the HTML5 Canvas.
- **Typography & Export**: Custom Title Text, Date Stamp, Font selector (`MONO`, `SANS`, `SERIF`), and 1-click PNG high-res exporter with celebration confetti 🎉.

### 📱 5. Mobile QR Code Share & Direct Download
- **App Access QR**: Instant QR Code for smartphone camera scanning.
- **Direct Photo Share**: Generates direct QR Code links for your latest AI-transformed photo.
- **Blob Direct Downloader**: Converts cloud image URLs to local Blobs for seamless `.png` file downloads.

### 🔑 6. Frontend API Key Manager
- **No `.env` Setup Needed**: Users can enter their Pollinations API Key (`sk_...`) directly in the header settings modal.
- **Local Storage Persistence**: Safely saved in `localStorage.pollinations_api_key` for immediate real-time API synchronization.

---

## 🛠️ Tech Stack

- **Core**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`), Custom CSS Studio Tokens
- **Icons & Effects**: Lucide React, Canvas Confetti
- **HTTP & AI Integration**: Axios, Pollinations AI (OpenAI-compatible Chat & Image APIs)

---

## 📁 Project Structure

```text
photobooth-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ApiKeyModal.tsx           # Pollinations API Key configuration modal
│   │   │   ├── FilterSelector.tsx        # Style engine presets & custom prompt bar
│   │   │   ├── GalleryDrawer.tsx         # Captured shots reel with AI vs Original toggle
│   │   │   ├── Header.tsx                # Studio masthead, filter status, and action triggers
│   │   │   ├── PhotoStripBuilder.tsx     # Y2K Photo Strip HTML5 Canvas editor
│   │   │   ├── PoseRecommendationCard.tsx# AI Pose Stylist & preference input
│   │   │   ├── QRCodeModal.tsx           # Mobile QR Code sharing modal
│   │   │   └── WebcamViewport.tsx        # Live camera stream, SVG pose guide & gesture shutter
│   │   ├── lib/
│   │   │   └── presets.ts                # Default poses and AI filter configurations
│   │   ├── services/
│   │   │   └── pollinations.ts           # Pollinations AI service wrapper (Text, Image, Upload)
│   │   ├── types/
│   │   │   └── photobooth.ts             # TypeScript interfaces for photobooth domain
│   │   ├── App.tsx                       # Main Studio application shell
│   │   ├── main.tsx                      # Vite React entry point
│   │   └── index.css                     # Hallmark Midnight theme & Tailwind CSS v4 rules
│   ├── .env.example                      # Environment variables template
│   ├── package.json                      # Project dependencies & scripts
│   └── vite.config.ts                    # Vite configuration
└── README.md                             # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation & Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/photobooth-ai.git
   cd photobooth-ai/frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** *(Optional)*:
   Create a `.env` file in the `frontend/` directory (or use the built-in UI API Key Modal):
   ```env
   VITE_POLLINATIONS_API_KEY=your_pollinations_api_key_here
   VITE_IMAGE_MODEL_ID=flux
   VITE_LLM_MODEL_ID=openai
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/` (or `http://localhost:5174/`).

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📝 License

This project is open-source under the **MIT License**.

Built with ❤️ for AI Photobooth enthusiasts.
