'use client';

import { useState } from 'react';

export default function TextToSign() {
  const [inputText, setInputText] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [signDescription, setSignDescription] = useState('');

  const handleConvert = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text');
      return;
    }

    setIsConverting(true);
    try {
      // Simulate text to sign language conversion
      // In production, you'd use a sign language database or ML model
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const signDescriptions: { [key: string]: string } = {
        hello: 'Open hand touching forehead, moving forward',
        thank: 'Hand near chin, moving outward twice',
        good: 'Hand moves from mouth downward to other hand palm up',
        morning: 'One arm represents the sun, other arm moves up as if sun is rising',
        help: 'One hand formed like a fist under the other palm in a lifting motion',
        please: 'Hand on chest making circular motions',
        sorry: 'Hand making a fist, moving in circles over the heart',
        love: 'Both hands crossed over heart',
        water: 'W-shaped hand, finger move down from forehead',
        food: 'Curved hand fingers to mouth repeatedly',
      };

      let description =
        signDescriptions[inputText.toLowerCase()] ||
        `Sign for "${inputText}": Finger-spell each letter in American Sign Language (ASL) alphabet, or use context-specific hand gestures.`;

      setSignDescription(description);
    } catch (error) {
      console.error('Error converting text:', error);
    } finally {
      setIsConverting(false);
    }
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

      {signDescription && (
        <div className="bg-secondary/50 rounded-lg p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Your Text:</p>
            <p className="text-xl font-semibold text-accent">{inputText}</p>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground mb-2">Sign Language Guide:</p>
            <p className="text-base leading-relaxed">{signDescription}</p>
          </div>

          <div className="bg-secondary/30 rounded p-3 text-sm text-muted-foreground italic">
            💡 Tip: Use a mirror or video to practice the sign movements shown above.
          </div>
        </div>
      )}
    </div>
  );
}
