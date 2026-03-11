'use client';

import { useState } from 'react';
import SignToText from '@/components/SignToText';
import TextToSign from '@/components/TextToSign';
import AudioToSign from '@/components/AudioToSign';
import SignBook from '@/components/SignBook';
import Settings from '@/components/Settings';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'sign-to-text' | 'text-to-sign' | 'audio-to-sign' | 'sign-book' | 'settings'>('sign-to-text');

  const tabs = [
    { id: 'sign-to-text', label: 'Sign → Text', icon: ' ' },
    { id: 'text-to-sign', label: 'Text → Sign', icon: ' ' },
    { id: 'audio-to-sign', label: 'Audio → Sign', icon: ' ' },
    { id: 'sign-book', label: 'Sign Book', icon: ' ' },
    { id: 'settings', label: 'Settings', icon: ' ' },  
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 text-balance">AURA</h1>
          <p className="text-muted-foreground text-balance">Bridge communication with sign language and text conversion</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id
                ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
          {activeTab === 'sign-to-text' && <SignToText />}
          {activeTab === 'text-to-sign' && <TextToSign />}
          {activeTab === 'audio-to-sign' && <AudioToSign />}
          {activeTab === 'sign-book' && <SignBook />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </div>
    </main>
  );
}
