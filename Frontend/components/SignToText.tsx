'use client';

import { useRef, useState } from 'react';
import VideoPreview from './VideoPreview';

export default function SignToText() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [detectedText, setDetectedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access denied. Please enable camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const captureFrame = async () => {
    if (!videoRef.current) return;

    setIsLoading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg'));
      if (!blob) return;

      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      const response = await fetch('http://localhost:8000/predict-sign', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to detect sign');

      const data = await response.json();
      setDetectedText(data.text);
    } catch (error) {
      console.error('Error detecting sign:', error);
      alert('Error communicating with backend. Make sure the Python server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(detectedText);
    alert('Text copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-secondary/30 rounded-lg p-1">
        {isRecording ? (
          <VideoPreview ref={videoRef} />
        ) : (
          <div className="w-full aspect-video bg-secondary rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Camera will appear here</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        {!isRecording ? (
          <button
            onClick={startCamera}
            className="flex-1 min-w-fit px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={captureFrame}
              disabled={isLoading}
              className="flex-1 min-w-fit px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Detecting...' : 'Detect Sign'}
            </button>
            <button
              onClick={stopCamera}
              className="flex-1 min-w-fit px-6 py-3 bg-destructive/20 text-destructive rounded-lg font-medium hover:bg-destructive/30 transition-colors"
            >
              Stop Camera
            </button>
          </>
        )}
      </div>

      {detectedText && (
        <div className="bg-secondary/50 rounded-lg p-6 space-y-4 border border-border/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Detected Result</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const speech = new SpeechSynthesisUtterance(detectedText);
                  window.speechSynthesis.speak(speech);
                }}
                className="p-2 bg-accent/20 text-accent rounded-full hover:bg-accent/30 transition-colors"
                title="Speak text"
              >
                🔊
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(detectedText);
                  alert('Text copied to clipboard!');
                }}
                className="p-2 bg-accent/20 text-accent rounded-full hover:bg-accent/30 transition-colors"
                title="Copy to clipboard"
              >
                📋
              </button>
            </div>
          </div>
          <p className="text-4xl font-bold text-center py-4 text-accent">{detectedText}</p>
        </div>
      )}
    </div>
  );
}
