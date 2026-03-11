"""
YOLO-based sign language predictor for backend.
Uses trained YOLO model for detection.
"""
import cv2
import numpy as np
from ultralytics import YOLO
import os

class YoloSignPredictor:
    def __init__(self, model_path="runs/detect/train7/weights/best.pt", conf_threshold=0.4):
        # Find best model if default doesn't exist
        if not os.path.exists(model_path):
            # Try to find any trained model
            possible_paths = [
                "runs/detect/train/weights/best.pt",
                "runs/detect/train2/weights/best.pt",
                "sign_language/train/weights/best.pt",
                "sign_language/train_v2/weights/best.pt",
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    model_path = path
                    break
        
        print(f"[YOLO PREDICTOR] Loading model from: {model_path}")
        self.model = YOLO(model_path)
        self.conf_threshold = conf_threshold
        
        # Class names (29 classes: A-Z + del + nothing + space)
        self.class_names = {i: chr(65+i) for i in range(26)}  # A-Z
        self.class_names[26] = "del"
        self.class_names[27] = "nothing"
        self.class_names[28] = "space"
        
    def predict(self, img):
        """
        Predict sign from image.
        Returns: (text, confidence, debug_info)
        """
        debug_info = {}
        
        try:
            # Resize for faster inference
            img_resized = cv2.resize(img, (320, 320))
            
            # Run inference
            results = self.model(img_resized, conf=self.conf_threshold, verbose=False)
            
            # Get detections
            boxes = results[0].boxes
            
            if len(boxes) == 0:
                return "No hand detected", 0.0, debug_info
            
            # Get best detection (highest confidence)
            best_idx = boxes.conf.argmax()
            conf = float(boxes.conf[best_idx])
            cls_id = int(boxes.cls[best_idx])
            
            # Get bounding box coordinates (x1, y1, x2, y2) normalized to image size
            xyxy = boxes.xyxy[best_idx].tolist()
            img_h, img_w = img_resized.shape[:2]
            bbox = {
                'x1': float(xyxy[0]) / img_w,
                'y1': float(xyxy[1]) / img_h,
                'x2': float(xyxy[2]) / img_w,
                'y2': float(xyxy[3]) / img_h
            }
            
            # Get class name
            text = self.class_names.get(cls_id, f"Class{cls_id}")
            
            # Map nothing to "No hand detected"
            if text == "nothing":
                return "No hand detected", 0.0, debug_info
            
            debug_info['class_id'] = cls_id
            debug_info['method'] = 'yolo'
            debug_info['bbox'] = bbox  # Add bounding box to response
            
            print(f"[YOLO] Detected: {text} (confidence: {conf:.2%})")
            
            return text, round(conf, 3), debug_info
            
        except Exception as e:
            print(f"[YOLO PREDICTOR] Error: {e}")
            import traceback
            traceback.print_exc()
            return "Error", 0.0, debug_info
