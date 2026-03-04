'use client';

import { useState, useEffect } from 'react';

export default function Settings() {
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [language, setLanguage] = useState('en-US');
  const [testText, setTestText] = useState('Hello, this is a test of text to speech');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in your browser');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.lang = language;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Text-to-Speech Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Text-to-Speech Settings</h3>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Enable Text-to-Speech</label>
          <button
            onClick={() => setTextToSpeechEnabled(!textToSpeechEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              textToSpeechEnabled ? 'bg-accent' : 'bg-secondary'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                textToSpeechEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {textToSpeechEnabled && (
          <div className="space-y-4 bg-secondary/30 rounded-lg p-4">
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="it-IT">Italian</option>
                <option value="pt-BR">Portuguese (Brazil)</option>
                <option value="ja-JP">Japanese</option>
                <option value="zh-CN">Chinese (Simplified)</option>
              </select>
            </div>

            {/* Speech Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Speech Rate</label>
                <span className="text-xs text-muted-foreground">{speechRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Speech Pitch */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Speech Pitch</label>
                <span className="text-xs text-muted-foreground">{speechPitch.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechPitch}
                onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Test Text-to-Speech */}
            <div>
              <label className="block text-sm font-medium mb-2">Test Text-to-Speech</label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full px-4 py-2 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              {!isSpeaking ? (
                <button
                  onClick={() => speak(testText)}
                  className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Test Speech
                </button>
              ) : (
                <button
                  onClick={stopSpeaking}
                  className="flex-1 px-4 py-2 bg-destructive/20 text-destructive rounded-lg font-medium hover:bg-destructive/30"
                >
                  Stop Speaking
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* App Information */}
      <div className="space-y-4 bg-secondary/20 rounded-lg p-4">
        <h3 className="text-lg font-semibold">About This App</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Version:</span> <span className="font-medium">1.0.0</span>
          </p>
          <p>
            <span className="text-muted-foreground">Purpose:</span>
            <span className="font-medium"> Bridge communication with sign language and text conversion</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This application helps convert between sign language, text, and audio. It supports multiple languages and
            provides text-to-speech functionality for accessibility.
          </p>
        </div>
      </div>

      {/* Browser Support Info */}
      <div className="space-y-2 bg-secondary/20 rounded-lg p-4 text-sm">
        <h3 className="font-semibold mb-2">Browser Support</h3>
        <div className="space-y-1 text-muted-foreground">
          <p>✓ Camera access (Sign to Text): Requires HTTPS</p>
          <p>✓ File upload (Audio to Sign): Works in all browsers</p>
          <p>✓ Text-to-Speech: Supported in modern browsers</p>
        </div>
      </div>
    </div>
  );
}
