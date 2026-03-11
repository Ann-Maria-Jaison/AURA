import os
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
from PIL import Image
import io

# from predictor import SignPredictor (Legacy)
from yolo_predictor import YoloSignPredictor
from transcriber import AudioTranscriber

app = FastAPI()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Predictors
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# TensorFlow predictor (legacy) - Removed as requested
# predictor = SignPredictor(...)

# YOLO predictor (new)
yolo_predictor = YoloSignPredictor()

transcriber = AudioTranscriber()

@app.get("/")
async def root():
    return {"message": "Sign Language Interpreter API is running"}

@app.post("/predict-sign")
async def predict_sign(file: UploadFile = File(...)):
    """Legacy endpoint redirected to YOLO."""
    return await predict_sign_yolo(file)

@app.post("/predict-sign-yolo")
async def predict_sign_yolo(file: UploadFile = File(...)):
    """YOLO-based sign detection - faster and more accurate."""
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image")
            
        text, confidence, debug_info = yolo_predictor.predict(img)
        return {"text": text, "confidence": confidence, "debug": debug_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import traceback

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    # Save file temporarily
    temp_dir = os.path.join(ROOT_DIR, "temp")
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
        
    file_path = os.path.join(temp_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        text = transcriber.transcribe(file_path)
        return {"text": text}
    except Exception as e:
        print("Transcription Error:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
