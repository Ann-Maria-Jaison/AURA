import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

class AudioTranscriber:
    def __init__(self, model_size="saaras:v3"):
        # For Sarvam, model_size refers to the model name
        self.model_name = model_size
        self.api_key = os.environ.get("SARVAM_API_KEY")
        self.api_url = "https://api.sarvam.ai/speech-to-text"

    def transcribe(self, file_path):
        if not self.api_key or self.api_key == "your_sarvam_api_key_here":
            return "Error: Sarvam API Key not set in .env file"
            
        if not os.path.exists(file_path):
            return "File not found"
        
        print(f"Transcribing using Sarvam AI: {file_path}")
        
        try:
            with open(file_path, "rb") as audio_file:
                # Use a tuple to specify filename and potentially content-type
                files = {
                    'file': (os.path.basename(file_path), audio_file, 'application/octet-stream')
                }
                data = {
                    'model': self.model_name,
                    'mode': 'transcribe'
                }
                headers = {
                    'api-subscription-key': self.api_key
                }
                
                print(f"Sending request to Sarvam AI with model: {self.model_name}")
                response = requests.post(self.api_url, files=files, data=data, headers=headers)
                
                if response.status_code == 200:
                    result = response.json()
                    # Response format: {"request_id": "...", "transcript": "...", ...}
                    transcript = result.get("transcript", "")
                    print(f"Transcription successful: {transcript[:50]}...")
                    return transcript.strip()
                else:
                    error_msg = f"Sarvam AI Error: {response.status_code} - {response.text}"
                    print(error_msg)
                    return error_msg
                    
        except Exception as e:
            import traceback
            traceback.print_exc()
            return f"Exception during transcription: {str(e)}"
