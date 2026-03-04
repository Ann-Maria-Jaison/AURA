import os
import sys
import time
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

# ─────────────────────────────────────────────
#  Supported audio formats
# ─────────────────────────────────────────────
SUPPORTED_FORMATS = {".mp3", ".wav", ".ogg", ".mp4", ".m4a", ".flac", ".opus", ".webm", ".aac", ".mpeg", ".mpg"}

def transcribe_audio_sarvam(file_path: str, model_name: str = "saaras:v3") -> dict:
    """
    Transcribe an audio file using Sarvam AI.
    """
    path = Path(file_path)
    api_key = os.environ.get("SARVAM_API_KEY")

    if not api_key or api_key == "your_sarvam_api_key_here":
        raise ValueError("SARVAM_API_KEY not found in .env file")

    if not path.exists():
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    if path.suffix.lower() not in SUPPORTED_FORMATS:
        raise ValueError(
            f"Unsupported format '{path.suffix}'. "
            f"Supported: {', '.join(SUPPORTED_FORMATS)}"
        )

    print(f"[INFO] Transcribing with Sarvam AI: {path.name}")
    start = time.time()

    api_url = "https://api.sarvam.ai/speech-to-text"
    headers = {
        'api-subscription-key': api_key
    }
    
    with open(file_path, "rb") as audio_file:
        files = {'file': audio_file}
        data = {
            'model': model_name,
            'mode': 'transcribe' # Can be 'translate' to get English output from Indic speech
        }
        
        response = requests.post(api_url, files=files, data=data, headers=headers)
        
        if response.status_code != 200:
            raise Exception(f"Sarvam AI Error: {response.status_code} - {response.text}")
            
        result = response.json()
        
    elapsed = time.time() - start
    print(f"[INFO] Done in {elapsed:.1f}s\n")

    return result


def save_transcript(text: str, output_path: str):
    """Save plain-text transcript to a .txt file."""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text.strip())
    print(f"[SAVED] Transcript -> {output_path}")


def transcribe_file(audio_path: str, model_name: str = "saaras:v3", save_txt: bool = True):
    """
    Full pipeline: transcribe using Sarvam AI → save output.
    """
    # Transcribe
    result = transcribe_audio_sarvam(audio_path, model_name)
    transcript = result.get("transcript", "").strip()

    # Determine output base name
    base = str(Path(audio_path).with_suffix(""))

    # Save outputs
    if save_txt:
        save_transcript(transcript, base + "_transcript.txt")

    # Print to console
    print("-" * 60)
    print("TRANSCRIPTION RESULT:")
    print("-" * 60)
    print(transcript)
    print("-" * 60)

    return transcript


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python audio_to_text.py <audio_file> [model_name]")
        print("       model_name options: saaras:v3 (default)")
        sys.exit(1)

    audio_file = sys.argv[1]
    model_name = sys.argv[2] if len(sys.argv) > 2 else "saaras:v3"

    try:
        transcribe_file(audio_file, model_name=model_name)
    except Exception as e:
        print(f"Error: {e}")
