import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_sarvam():
    api_key = os.environ.get("SARVAM_API_KEY")
    if not api_key or api_key == "your_sarvam_api_key_here":
        print("Error: Please set SARVAM_API_KEY in .env file")
        return

    print("Testing Sarvam AI Speech-to-Text API...")
    # We can't easily test without a real audio file, but we can check the API connectivity/key
    # by sending a malformed request or just checking if the key is present.
    
    # Actually, let's just show how to use it.
    print(f"API Key found: {api_key[:5]}...{api_key[-5:] if len(api_key) > 10 else ''}")
    print("To run a full test, use: python audio_to_text.py <path_to_audio_file>")

if __name__ == "__main__":
    test_sarvam()
