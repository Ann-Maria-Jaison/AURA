'use client';

import { useRef, useState } from 'react';

export default function AudioToSign() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [signDescription, setSignDescription] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setTranscribedText('');
      setSignDescription('');
    } else {
      alert('Please select a valid audio file');
    }
  };

  const processAudio = async () => {
    if (!audioFile) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch('http://127.0.0.1:8003/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to transcribe audio');

      const data = await response.json();
      const transcription = data.text;
      setTranscribedText(transcription);
    } catch (error) {

      console.error('Error processing audio:', error);
      alert('Error communicating with backend. Make sure the Python server is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    setAudioFile(null);
    setTranscribedText('');
    setSignDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium">Upload Audio File</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-6 py-8 border-2 border-dashed border-border rounded-lg hover:border-accent hover:bg-secondary/30 transition-colors cursor-pointer"
        >
          <div className="text-center">
           
            <p className="font-medium">Click to select audio file</p>
            <p className="text-sm text-muted-foreground mt-1">or drag and drop</p>
          </div>
        </button>
      </div>

      {audioFile && (
        <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Selected file:</p>
              <p className="font-medium">{audioFile.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={clearFile}
              className="px-3 py-1 bg-destructive/20 text-destructive rounded hover:bg-destructive/30 text-sm"
            >
              Remove
            </button>
          </div>

          <audio controls className="w-full rounded">
            <source src={URL.createObjectURL(audioFile)} type={audioFile.type} />
            Your browser does not support the audio element.
          </audio>

          <button
            onClick={processAudio}
            disabled={isProcessing}
            className="w-full px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isProcessing ? 'Converting Audio...' : 'Convert Audio to Sign Language'}
          </button>
        </div>
      )}

      {transcribedText && (
        <div className="bg-secondary/50 rounded-lg p-6 space-y-6 border border-border/50">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Transcribed Text</p>
            <p className="text-2xl font-bold text-accent">{transcribedText}</p>
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-4">Sign Language Sequence</p>
            <div className="flex flex-wrap gap-4 items-center justify-center">
              {transcribedText.toUpperCase().split('').map((char, index) => {
                if (char === ' ') {
                  return (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div className="w-20 h-20 bg-card rounded-lg border border-border flex items-center justify-center overflow-hidden shadow-sm">
                        <img src="/signs/space.jpg" alt="space" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">SPACE</span>
                    </div>
                  );
                }
                const isAlpha = /^[A-Z]$/.test(char);
                return (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 bg-card rounded-lg border border-border flex items-center justify-center overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {isAlpha ? (
                        <img
                          src={`/signs/${char}.jpg`}
                          alt={`Sign for ${char}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/222/accent?text=' + char;
                          }}
                        />
                      ) : (
                        <span className="text-2xl font-bold">{char}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">{char}</span>
                  </div>
                );
              })}
            </div>
          </div>


          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20 flex gap-3 items-start">
            <span className="text-xl">💡</span>
            <p className="text-sm text-accent-foreground/80 leading-relaxed">
              <strong>Sign Guide:</strong> The sequence above translates each character into its corresponding American Sign Language (ASL) gesture from our dataset.
            </p>
          </div>
        </div>
      )}

      {!audioFile && (
        <div className="bg-secondary/20 rounded-lg p-4 text-sm text-muted-foreground">
          <p>Supported formats: MP3, WAV, OGG, M4A, and other common audio formats</p>
        </div>
      )}
    </div>
  );
}
