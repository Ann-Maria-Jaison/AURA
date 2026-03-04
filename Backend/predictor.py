import cv2
import pickle
import numpy as np
import os
import sqlite3
from tensorflow.keras.models import load_model

class SignPredictor:
    def __init__(self, model_path='cnn_model_keras2.h5', db_path='gesture_db.db', hist_path='hist'):
        self.model_path = model_path
        self.db_path = db_path
        self.hist_path = hist_path
        self.model = None
        self.hist = None
        self.image_x, self.image_y = 50, 50 # Default, will be updated
        self.load_resources()

    def load_resources(self):
        if os.path.exists(self.model_path):
            self.model = load_model(self.model_path)
            print(f"Model loaded from {self.model_path}")
        else:
            print(f"Warning: Model not found at {self.model_path}")

        if os.path.exists(self.hist_path):
            with open(self.hist_path, "rb") as f:
                self.hist = pickle.load(f)
            print(f"Histogram loaded from {self.hist_path}")
        else:
            print(f"Warning: Histogram not found at {self.hist_path}")

        # Update image size if possible
        try:
            # Check gestures folder for a sample image
            for root, dirs, files in os.walk('gestures'):
                for file in files:
                    if file.endswith('.jpg'):
                        img = cv2.imread(os.path.join(root, file), 0)
                        if img is not None:
                            self.image_x, self.image_y = img.shape
                            print(f"Image size set to {self.image_x}x{self.image_y}")
                            return
        except Exception as e:
            print(f"Error determining image size: {e}")

    def keras_process_image(self, img):
        img = cv2.resize(img, (self.image_x, self.image_y))
        img = np.array(img, dtype=np.float32)
        img = np.reshape(img, (1, self.image_x, self.image_y, 1))
        return img

    def get_pred_text_from_db(self, pred_class):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.execute("SELECT g_name FROM gesture WHERE g_id=?", (int(pred_class),))
            row = cursor.fetchone()
            conn.close()
            return row[0] if row else "Unknown"
        except Exception as e:
            print(f"Database error: {e}")
            return "Error"

    def predict(self, frame):
        if self.model is None or self.hist is None:
            return "Model/Hist not loaded", 0.0

        # Preprocessing similar to final.py
        img = cv2.flip(frame, 1)
        imgHSV = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        dst = cv2.calcBackProject([imgHSV], [0, 1], self.hist, [0, 180, 0, 256], 1)
        disc = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (10, 10))
        cv2.filter2D(dst, -1, disc, dst)
        blur = cv2.GaussianBlur(dst, (11, 11), 0)
        blur = cv2.medianBlur(blur, 15)
        thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        
        # In the web version, we might receive just the ROI or the whole frame.
        # Assuming we work on the center for now or let the frontend crop.
        # If the frontend sends the whole frame, we crop like final.py:
        # x, y, w, h = 300, 100, 300, 300
        # However, it's better to let the model decide or have a fixed ROI.
        
        # For simplicity, let's assume the frontend sends the cropped hand image.
        # But if it sends the full frame, we need to process it.
        # Let's handle both or define a standard.
        
        # For now, let's use the provided frame as the target image (already cropped by user/frontend).
        img_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        processed = self.keras_process_image(img_gray)
        
        pred_probab = self.model.predict(processed)[0]
        pred_class = np.argmax(pred_probab)
        confidence = float(np.max(pred_probab))
        
        text = self.get_pred_text_from_db(pred_class)
        return text, confidence
