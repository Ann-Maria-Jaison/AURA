'use client';

import { useState } from 'react';

export default function TextToSign() {
  const [inputText, setInputText] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [signs, setSigns] = useState<string[]>([]);

  const handleConvert = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text');
      return;
    }

    setIsConverting(true);
    // Convert text to sequence of characters that we have signs for
    const charSequence = inputText.toUpperCase().split('').filter(char =>
      (char >= 'A' && char <= 'Z') || char === ' '
    ).map(char => char === ' ' ? 'space' : char);

    setSigns(charSequence);
    setIsConverting(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConvert();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium">Enter Text</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type the text you want to convert to sign language..."
          className="w-full px-4 py-3 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-muted-foreground resize-none"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">Tip: Press Shift + Enter for new line, Enter to convert</p>
      </div>

      <button
        onClick={handleConvert}
        disabled={isConverting}
        className="w-full px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isConverting ? 'Converting...' : 'Convert to Sign Language'}
      </button>

      {signs.length > 0 && (
        <div className="bg-secondary/50 rounded-lg p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">Sign Language Sequence:</p>
            <div className="flex flex-wrap gap-4 justify-center">
              {signs.map((sign, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 bg-card rounded-lg border border-border overflow-hidden">
                    <img
                      src={`/signs/${sign}.jpg`}
                      alt={sign}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/222/accent?text=' + sign;
                      }}
                    />
                  </div>
                  <span className="text-lg font-bold text-accent">{sign === 'space' ? '␣' : sign}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
