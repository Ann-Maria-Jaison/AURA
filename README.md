# AURA 🤟

### AI-Powered Multi-Modal Sign Language Communication System

<p align="center">
  <img src="https://img.shields.io/badge/status-active-brightgreen" alt="Status" />
  <img src="https://img.shields.io/badge/python-3.9%2B-blue" alt="Python" />
  <img src="https://img.shields.io/badge/next.js-14-black" alt="Next.js" />
</p>

---

##  Table of Contents

- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [Interface Screenshots](#interface-screenshots)
- [System Architecture](#system-architecture)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Team](#team)
- [Vision](#vision)

---

## The Problem

Communication between **sign language users and non-signers** remains a significant barrier.

Most existing systems only address **one side** of the conversation:

- Sign ➜ Text  
- Text ➜ Sign  

But **real conversations** require **two-way communication**—and sometimes even **three ways** (sign, text, and speech).

---

## Our Solution

We built **AURA**, a **multi-modal communication system** that seamlessly connects:

**Sign Language**  
**Text**  
**Speech**

AURA allows users to communicate through **three different input modes**:

- Sign ➜ Text  
- Text ➜ Sign  
- Audio ➜ Sign  

Instead of forcing people to adapt to technology,  
**AURA adapts to the way humans naturally communicate.**

---

## Key Features

- Real-time **Sign Language Detection** using computer vision.
- **Speech-to-Sign** translation via Sarvam AI STT.
- **Text-to-Sign** mapping with a dynamic gesture library.
- Interactive **web interface** built with Next.js.
- Real-time **video processing pipeline** with OpenCV and TensorFlow.

---

## Interface Screenshots

Take a look at AURA in action:

<div align="center">
  <img src="Images/1.png" alt="Sign to Text Translation" width="400"/>
  <p><em>Sign to Text – Real-time gesture recognition</em></p>
</div>

<div align="center">
  <img src="Images/2.png" alt="Text to Sign Translation" width="400"/>
  <p><em>Text to Sign – Typed message converted to sign animations</em></p>
</div>

<div align="center">
  <img src="Images/3.png" alt="Audio to Sign Translation" width="400"/>
  <p><em>Audio to Sign – Speech transcribed and mapped to signs</em></p>
</div>

<div align="center">
  <img src="Images/4.png" alt="Signbook Library" width="400"/>
  <p><em>Signbook – Browse and learn common signs</em></p>
</div>

---

## System Architecture

AURA follows a **full-stack AI architecture** with clear separation of concerns:

```mermaid
flowchart TD
    A[Webcam / Audio / Text Input] --> B[Frontend<br>Next.js + TypeScript]
    B --> C[FastAPI Backend]
    C --> D[ML Processing Layer<br>OpenCV + TensorFlow]
    D --> E[Gesture / Text Prediction]
    E --> F[Visual Output on Frontend]
    
    style A fill:black,color:white,stroke:#333,stroke-width:2px
    style B fill:black,color:white,stroke:#333,stroke-width:2px
    style C fill:black,color:white,stroke:#333,stroke-width:2px
    style D fill:black,color:white,stroke:#333,stroke-width:2px
    style E fill:black,color:white,stroke:#333,stroke-width:2px
    style F fill:black,color:white,stroke:#333,stroke-width:2px
```

### Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant ML_Engine
    participant STT_Service as Sarvam AI STT

    User->>Frontend: Choose input mode (Sign/Text/Audio)
    
    alt Sign Mode
        User->>Frontend: Show sign gesture via webcam
        Frontend->>Backend: Stream video frames
        Backend->>ML_Engine: Run inference
        ML_Engine-->>Backend: Predicted text/gesture
        Backend-->>Frontend: Send result
        Frontend->>User: Display translation
    else Text Mode
        User->>Frontend: Type message
        Frontend->>Backend: Text input
        Backend->>ML_Engine: Map to sign animation
        ML_Engine-->>Backend: Sign sequence data
        Backend-->>Frontend: Sign animation
        Frontend->>User: Show avatar performing signs
    else Audio Mode
        User->>Frontend: Speak
        Frontend->>Backend: Audio stream
        Backend->>STT_Service: Convert speech to text
        STT_Service-->>Backend: Transcribed text
        Backend->>ML_Engine: Map text to sign
        ML_Engine-->>Backend: Sign sequence
        Backend-->>Frontend: Sign animation
        Frontend->>User: Show avatar performing signs
    end
```

---

## How It Works

1. **Input Capture** – User selects input modality: webcam (sign), microphone (speech), or keyboard (text).
2. **Processing** – Data is sent to the FastAPI backend.
   - For video, OpenCV extracts frames and TensorFlow predicts gestures.
   - For audio, Sarvam AI STT converts speech to text.
   - For text, it's directly passed to the mapping module.
3. **Translation** – Gestures are mapped to text; text is mapped to sign animations.
4. **Output** – Results are displayed in the frontend: either as text or as an avatar performing sign language.

---

## Tech Stack

| Category       | Technologies                                                                 |
|----------------|------------------------------------------------------------------------------|
| **Machine Learning** | TensorFlow / Keras, OpenCV, NumPy                                            |
| **Backend**    | FastAPI, Uvicorn ASGI Server, Python                                         |
| **Frontend**   | Next.js, React, TypeScript, TailwindCSS, Radix UI                            |
| **AI Services**| Sarvam AI Speech-to-Text (`saaras:v3`)                                       |
| **DevOps**     | Docker (optional), Git, npm, pip                                             |

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn
- Webcam (for sign detection)
- Microphone (optional, for speech input)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/aura.git
   cd aura/Backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   python main.py
   ```

   Backend will be available at `http://localhost:8000`.

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Frontend will be available at `http://localhost:3000`.

---

##  Team

### Ann Maria Jaison
- Frontend
- Machine learning
- Backend: Audio-to-Text Module, Sign-to-Text and Text-to-Sign Module
- Documentation
### Ashlin Joy Varghese
- Research
- Documentation
- Presentation
- Backend Development: Audio-to-Text Module

### Catherine Susan Rajesh
- Documentation
- Presentation
- Research
- Backend Development: Sign-to-Text and Text-to-Sign Module

### Neha Joshy
- Research
- Documentation
- Presentation
- Backend Development: Audio-to-Text Module
---

## Vision

AURA aims to make communication **inclusive**, **accessible**, and **intelligent** by bridging the gap between **spoken language and sign language** using cutting-edge AI.

We envision a world where no one is left out of a conversation because of a language barrier—whether spoken or signed.

---

<p align="center">
  Made with ❤️ by the AURA Team
</p>
