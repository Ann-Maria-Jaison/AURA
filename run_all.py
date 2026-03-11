# c:\Users\Ann\Desktop\try\Sign-Language-Interpreter\run_all.py
import subprocess
import os
import time
import signal

BASE = r"C:\Users\Ann\Desktop\try\Sign-Language-Interpreter"

def start_backend():
    cmd = ["python", "main.py"]
    return subprocess.Popen(cmd, cwd=os.path.join(BASE, "Backend"))

def start_frontend():
    # npm must be installed; we use `npm run dev`
    cmd = ["npm", "run", "dev"]
    return subprocess.Popen(cmd, cwd=os.path.join(BASE, "Frontend"))

def start_app():
    cmd = ["python", "detect_sign.py"]
    return subprocess.Popen(cmd, cwd=BASE)

if __name__ == "__main__":
    print("🚀 Starting backend …")
    backend = start_backend()
    time.sleep(2)          # give it a moment to bind the port

    print("🚀 Starting frontend …")
    frontend = start_frontend()
    time.sleep(5)          # let Next.js compile

    print("🚀 Starting the sign‑to‑text app …")
    app = start_app()

    try:
        # Wait for the app to finish (it exits on `q`/`t`)
        app.wait()
    finally:
        print("\n🛑 Stopping all services …")
        # Gracefully terminate backend & frontend
        for p in (backend, frontend):
            p.send_signal(signal.CTRL_BREAK_EVENT)   # Windows friendly
            p.wait(timeout=5)
        print("All stopped.")
