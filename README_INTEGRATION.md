# Sign Language Interpreter - Integration Guide

This project integrates a machine learning model for sign language detection with a Next.js frontend via a FastAPI backend.

## Project Structure

- `/Backend`: FastAPI server that handles ML predictions and audio transcription.
- `/Frontend`: Next.js web application.
- Root: Contains original ML scripts, mock data generators, and trained models.

## How to Run

### 1. Prerequisites
Ensure you have Python and Node.js installed.
Install Python dependencies:
```bash
pip install fastapi uvicorn python-multipart opencv-python numpy tensorflow whisper-openai pillow
```

### 2. Setup Data (Optional / First Time)
If you don't have a trained model or database yet, run:
```bash
python mock_setup.py
python create_dummy_model.py
```

### 3. Start the Backend
Navigate to the root and run:
```bash
python Backend/main.py
```
The backend will run on `http://localhost:8000`.

### 4. Start the Frontend
Navigate to the `Frontend` directory and run:
```bash
cd Frontend
npm install
npm run dev
```
The web app will be available at `http://localhost:3000`.

## Features
- **Sign → Text**: Uses the webcam to detect sign language.
- **Audio → Sign**: Upload audio files for transcription and sign guide.
- **Text → Sign**: (In progress) Converts text to sign descriptions.
