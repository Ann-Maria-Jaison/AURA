import whisper
import os
import shutil

def test_whisper():
    try:
        print("Checking FFmpeg...")
        if not shutil.which("ffmpeg"):
            print("FFmpeg not found in PATH. Adding CapCut path...")
            p = r"C:\Users\Ann\AppData\Local\CapCut\Apps\7.6.0.3123"
            os.environ["PATH"] = p + os.pathsep + os.environ.get("PATH", "")
        
        if shutil.which("ffmpeg"):
            print(f"FFmpeg found at: {shutil.which('ffmpeg')}")
        else:
            print("FFmpeg STILL NOT FOUND!")

        print("Loading tiny model...")
        model = whisper.load_model("tiny")
        print("Model loaded.")
        
        # Test with an empty or small file if possible, or just loading is enough for now
        print("Whisper test successful.")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_whisper()
