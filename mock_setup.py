import os
import cv2
import numpy as np
import pickle
import sqlite3

def create_mock_data():
    print("Creating mock data...")
    
    # 1. Create Directories
    if not os.path.exists("gestures"):
        os.mkdir("gestures")
    
    # Create a few classes
    classes = ['0', '1', '2']
    for c in classes:
        path = os.path.join("gestures", c)
        if not os.path.exists(path):
            os.mkdir(path)
        
        # 2. Create Dummy Images
        # Need enough images for train/test split in load_images.py (it uses 5/6 split etc)
        # load_images.py sorts and globs "gestures/*/*.jpg"
        # It needs at least ~1200 images per class normally, but we can do less for testing, 
        # provided it's enough for the slicings.
        # Let's create 100 images per class.
        print(f"Generating images for class {c}...")
        for i in range(100):
            # Random noise image 50x50
            img = np.random.randint(0, 255, (50, 50), dtype=np.uint8)
            cv2.imwrite(os.path.join(path, f"{i}.jpg"), img)

    # 3. Create Dummy Histogram
    print("Creating dummy histogram...")
    # hist is usually created by calcHist. Shape is usually (180, 256).
    hist = np.random.rand(180, 256).astype(np.float32)
    # Normalize it
    cv2.normalize(hist, hist, 0, 255, cv2.NORM_MINMAX)
    with open("hist", "wb") as f:
        pickle.dump(hist, f)

    # 4. Create Database
    print("Creating database...")
    if os.path.exists("gesture_db.db"):
        os.remove("gesture_db.db")
        
    conn = sqlite3.connect("gesture_db.db")
    create_table_cmd = "CREATE TABLE gesture ( g_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, g_name TEXT NOT NULL )"
    conn.execute(create_table_cmd)
    
    # Insert mappings
    # Map 0 -> 'Zero', 1 -> 'One', etc.
    conn.execute("INSERT INTO gesture (g_id, g_name) VALUES (0, 'Zero')")
    conn.execute("INSERT INTO gesture (g_id, g_name) VALUES (1, 'One')")
    conn.execute("INSERT INTO gesture (g_id, g_name) VALUES (2, 'Two')")
    
    conn.commit()
    conn.close()
    
    print("Mock data creation complete.")

if __name__ == "__main__":
    create_mock_data()
