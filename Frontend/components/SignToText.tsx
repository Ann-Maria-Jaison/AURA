'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import VideoPreview from './VideoPreview';
import { Camera, Copy, Trash2, XCircle, ArrowLeft, CheckCircle2, Volume2, Volume } from 'lucide-react';

export default function SignToText() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRealtime, setIsRealtime] = useState(false);
  const [detectedChar, setDetectedChar] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inferenceStatus, setInferenceStatus] = useState<string>('Standby');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [useYolo, setUseYolo] = useState(true); // Default to YOLO
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bbox, setBbox] = useState<{x1: number, y1: number, x2: number, y2: number} | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastProcessedTime = useRef<number>(0);
  const consecutiveMatchCounter = useRef<number>(0);
  const lastPotentialChar = useRef<string | null>(null);

  // Stats
  const charCount = recognizedText.length;
  const wordCount = recognizedText.trim() === '' ? 0 : recognizedText.trim().split(/\s+/).length;

  // Check backend health
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8003/');
        setBackendStatus(res.ok ? 'online' : 'offline');
      } catch {
        setBackendStatus('offline');
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  // Camera stream attachment
  useEffect(() => {
    if (isRecording && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(e => {
          console.error("Autoplay failed:", e);
          setCameraError("Autoplay blocked. Check settings.");
        });
      };
    }
  }, [isRecording, stream]);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0 || isAnalyzing || backendStatus !== 'online') return;

    // Throttle inference to every 800ms
    const now = Date.now();
    if (now - lastProcessedTime.current < 800) return;
    lastProcessedTime.current = now;

    setIsAnalyzing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      if (!blob) return;

      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      const endpoint = useYolo ? 'http://127.0.0.1:8003/predict-sign-yolo' : 'http://127.0.0.1:8003/predict-sign';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text && data.text !== "No hand detected") {
          let char = data.text;

          // Map "space" to a literal space
          if (char.toLowerCase() === 'space') {
            char = ' ';
          }

          setDetectedChar(char);
          setInferenceStatus(`${data.text} (${Math.round(data.confidence * 100)}%)`);

          // Noise Reduction: Require 2 consecutive matches before adding to text
          if (char === lastPotentialChar.current) {
            consecutiveMatchCounter.current += 1;
          } else {
            consecutiveMatchCounter.current = 1;
            lastPotentialChar.current = char;
          }

          // Store bounding box for drawing
          if (data.debug?.bbox) {
            setBbox(data.debug.bbox);
          }

          if (consecutiveMatchCounter.current >= 2) {
            setRecognizedText(prev => {
              // Debounce: don't add the same character twice in a row
              if (prev.endsWith(char)) return prev;
              return prev + char;
            });
            consecutiveMatchCounter.current = 0; // Reset after adding
          }
        } else {
          setDetectedChar(null);
          setBbox(null); // Clear bounding box
          setInferenceStatus('Searching...');
          consecutiveMatchCounter.current = 0;
          lastPotentialChar.current = null;
        }
      } else {
        setInferenceStatus('Backend Error');
      }
    } catch (error) {
      console.error('Inference error:', error);
      setInferenceStatus('Connection Error');
    } finally {
      setIsAnalyzing(false);
    }
  }, [backendStatus, isAnalyzing]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && isRealtime) {
      interval = setInterval(captureFrame, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording, isRealtime, captureFrame]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      setIsRecording(true);
      setIsRealtime(true);
      setCameraError(null);
    } catch (error) {
      setCameraError("Could not access webcam.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsRecording(false);
    setIsRealtime(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recognizedText);
    alert('Copied to clipboard!');
  };

  const deleteLastChar = () => {
    setRecognizedText(prev => prev.slice(0, -1));
  };

  const readAloud = () => {
    if (!recognizedText || recognizedText.trim() === '') return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(recognizedText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Draw bounding box on canvas
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !isRecording) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Match canvas size to video
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw bounding box if available
    if (bbox && detectedChar) {
      const x = bbox.x1 * canvas.width;
      const y = bbox.y1 * canvas.height;
      const w = (bbox.x2 - bbox.x1) * canvas.width;
      const h = (bbox.y2 - bbox.y1) * canvas.height;
      
      // Draw box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, w, h);
      
      // Draw label background
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(x, y - 30, 60, 30);
      
      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(detectedChar === ' ' ? 'SPC' : detectedChar, x + 5, y - 8);
    }
  }, [bbox, detectedChar, isRecording]);

  const clearAll = () => {
    setRecognizedText('');
    setDetectedChar(null);
    setBbox(null);
    consecutiveMatchCounter.current = 0;
    lastPotentialChar.current = null;
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto p-4 animate-in fade-in duration-700">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full mb-2 gap-4">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h2 className="text-2xl font-bold flex items-center gap-3">
        
          Sign to Text
        </h2>

        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${backendStatus === 'online' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          <div className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-green-500' : 'bg-red-500'} ${backendStatus === 'online' && 'animate-pulse'}`} />
          {backendStatus === 'online' ? 'Connected' : 'Offline'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Section: Video Feed */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative aspect-video bg-neutral-900 rounded-2xl border-2 border-white/5 overflow-hidden shadow-2xl group ring-1 ring-white/10">
            {!isRecording ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_center,_var(--color-accent)_0%,_transparent_100%)] opacity-20">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center text-accent animate-pulse">
                  <Camera size={32} />
                </div>
                <button
                  onClick={startCamera}
                  className="px-8 py-3 bg-accent text-accent-foreground rounded-xl font-bold hover:scale-105 transition-transform shadow-xl shadow-accent/20"
                >
                  Start Real-time Detection
                </button>
              </div>
            ) : (
              <>
                <VideoPreview ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" />
                
                {/* Bounding Box Canvas Overlay */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
                />

                {/* Sign Zone Guide */}
                <div className="absolute top-[20%] left-[5%] w-[45%] h-[60%] border-2 border-dashed border-accent/40 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] text-accent font-black uppercase tracking-widest bg-black/40 px-2 py-1 rounded">Sign Zone</span>
                </div>

                {/* Detected Char Overlay (Top Left) */}
                <div className="absolute top-6 left-6 p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 min-w-[120px] text-center shadow-2xl transition-all animate-in zoom-in duration-300">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black mb-1 opacity-70">Detected</p>
                  <p className="text-5xl font-black text-accent drop-shadow-[0_0_15px_rgba(var(--accent),0.5)]">
                    {detectedChar === ' ' ? '␣' : (detectedChar || '-')}
                  </p>
                </div>

                {/* Hand Detected Indicator (Bottom Left) */}
                {detectedChar && (
                  <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-accent/20 backdrop-blur-md px-4 py-2 rounded-full border border-accent/40 text-[11px] font-black uppercase text-accent animate-pulse shadow-lg">
                    <span>🖐️ Hand Detected</span>
                  </div>
                )}

                {/* Stop Button */}
                <button
                  onClick={stopCamera}
                  className="absolute bottom-6 right-6 p-3 bg-red-500/20 hover:bg-red-500 text-white rounded-full transition-all border border-red-500/50"
                  title="Stop Camera"
                >
                  <XCircle size={20} />
                </button>
              </>
            )}
          </div>

          {cameraError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs text-center font-bold uppercase tracking-tighter">
              ⚠️ {cameraError}
            </div>
          )}
        </div>

        {/* Right Section: Stats and Log */}
        <div className="lg:col-span-2 flex flex-col gap-4"> 
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/20 p-6 rounded-2xl border border-white/5 text-center shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <CheckCircle2 size={40} />
              </div>
              <p className="text-3xl font-black text-accent">{charCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">Characters</p>
            </div>
            <div className="bg-secondary/20 p-6 rounded-2xl border border-white/5 text-center shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <CheckCircle2 size={40} />
              </div>
              <p className="text-3xl font-black text-accent">{wordCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">Words</p>
            </div>
          </div>

          <div className="flex-1 bg-secondary/30 rounded-2xl border border-white/5 p-8 flex flex-col min-h-[350px] shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-black opacity-70">Recognized Text</h4>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-accent uppercase tracking-tighter">Status:</span>
                <span className="text-[9px] font-bold text-white uppercase">{inferenceStatus}</span>
              </div>
            </div>

            <div className="flex-1 text-5xl font-black tracking-tighter leading-tight overflow-y-auto break-all scrollbar-hide text-white/90">
              {recognizedText || <span className="text-white/10">Recognition active...</span>}
              {isRecording && <span className="w-1.5 h-10 bg-accent inline-block ml-2 animate-pulse align-middle rounded-full" />}
            </div>

            <div className="flex gap-3 mt-10">
              <button
                onClick={clearAll}
                className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-red-500/20 shadow-lg shadow-red-500/5 active:scale-95"
              >
                Clear
              </button>
              <button
                onClick={deleteLastChar}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-2 active:scale-95"
              >
                <Trash2 size={12} />
                Delete
              </button>
              <button
                onClick={isSpeaking ? stopSpeaking : readAloud}
                className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border flex items-center justify-center gap-2 active:scale-95 ${isSpeaking ? 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse' : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'}`}
              >
                {isSpeaking ? <Volume size={12} /> : <Volume2 size={12} />}
                {isSpeaking ? 'Stop' : 'Read'}
              </button>
              <button
                onClick={copyToClipboard}
                className="flex-[2] py-4 bg-accent text-accent-foreground rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_-5px_rgba(var(--color-accent),0.3)] border-b-4 border-black/10 active:scale-95"
              >
                <Copy size={12} />
                Copy Output
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
