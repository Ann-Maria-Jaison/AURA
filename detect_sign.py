from ultralytics import YOLO
import cv2

# Load trained model
model = YOLO("runs/detect/train7/weights/best.pt")

# Confidence threshold - only show detections above this
CONF_THRESHOLD = 0.5

# Open webcam
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Run detection
    results = model(frame, conf=CONF_THRESHOLD)

    # Get detections
    detections = results[0].boxes
    
    # Draw boxes only for high-confidence detections
    annotated_frame = results[0].plot()
    
    # Add confidence info on screen
    for box in detections:
        conf = float(box.conf)
        cls = int(box.cls)
        name = results[0].names[cls]
        print(f"Detected: {name} (confidence: {conf:.2%})")

    # Show video
    cv2.imshow("Sign Language Detection", annotated_frame)

    # Press ESC to exit
    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()