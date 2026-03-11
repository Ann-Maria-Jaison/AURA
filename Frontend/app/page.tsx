'use client';

import { useState } from 'react';
import SignToText from '@/components/SignToText';
import TextToSign from '@/components/TextToSign';
import AudioToSign from '@/components/AudioToSign';
import SignBook from '@/components/SignBook';
import Settings from '@/components/Settings';

const tabs = [
  { id: 'sign-to-text', label: 'Sign → Text', icon: '🖐️', short: 'SIGN' },
  { id: 'text-to-sign', label: 'Text → Sign', icon: '⌨️', short: 'TEXT' },
  { id: 'audio-to-sign', label: 'Audio → Sign', icon: '🎤', short: 'AUDIO' },
  { id: 'sign-book', label: 'Sign Book', icon: '📖', short: 'BOOK' },
  { id: 'settings', label: 'Settings', icon: '⚙️', short: 'CFG' },
] as const;

type TabId = typeof tabs[number]['id'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('sign-to-text');
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #080b0f;
          --surface: #0d1117;
          --surface-2: #131920;
          --border: #1e2a36;
          --border-bright: #2a3d52;
          --accent: #00d4ff;
          --accent-dim: rgba(0, 212, 255, 0.12);
          --accent-glow: rgba(0, 212, 255, 0.3);
          --text: #e8edf2;
          --text-muted: #4a6070;
          --text-mid: #7a96a8;
          --danger: #ff4060;
          --gold: #f0a020;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .page-root {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        /* Background grid */
        .bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        /* Top corner accent */
        .bg-glow {
          position: fixed;
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .bg-glow-2 {
          position: fixed;
          bottom: -300px;
          left: -150px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(240,160,32,0.04) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .container {
          position: relative;
          z-index: 1;
          max-width: 960px;
          margin: 0 auto;
          padding: 48px 24px 64px;
        }

        /* Header */
        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 56px;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .header-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.2em;
          color: var(--accent);
          text-transform: uppercase;
        }

        .eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .header-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1;
          color: var(--text);
        }

        .header-title span {
          color: var(--accent);
        }

        .header-subtitle {
          font-size: 12px;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin-top: 4px;
        }

        .header-badge {
          font-size: 10px;
          letter-spacing: 0.15em;
          color: var(--text-muted);
          border: 1px solid var(--border);
          padding: 6px 14px;
          text-transform: uppercase;
          font-weight: 500;
        }

        /* Tab nav */
        .tab-nav {
          display: flex;
          gap: 2px;
          margin-bottom: 2px;
          position: relative;
        }

        .tab-btn {
          position: relative;
          padding: 12px 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          outline: none;
        }

        .tab-btn.inactive {
          background: var(--surface);
          color: var(--text-muted);
          border: 1px solid var(--border);
          border-bottom: none;
        }

        .tab-btn.inactive:hover {
          background: var(--surface-2);
          color: var(--text-mid);
          border-color: var(--border-bright);
        }

        .tab-btn.active {
          background: var(--surface-2);
          color: var(--accent);
          border: 1px solid var(--border-bright);
          border-bottom: 1px solid var(--surface-2);
          z-index: 2;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--surface-2);
        }

        .tab-icon {
          font-size: 14px;
          line-height: 1;
        }

        .tab-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent-glow);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.2s ease;
        }

        .tab-btn.active .tab-indicator {
          transform: scaleX(1);
        }

        /* Content panel */
        .panel {
          position: relative;
          background: var(--surface-2);
          border: 1px solid var(--border-bright);
          padding: 40px;
          min-height: 400px;
        }

        /* Top-right corner decoration */
        .panel::before {
          content: '';
          position: absolute;
          top: -1px;
          right: 60px;
          width: 40px;
          height: 1px;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent-glow);
        }

        .panel::after {
          content: '';
          position: absolute;
          top: -6px;
          right: 59px;
          width: 6px;
          height: 6px;
          border: 1px solid var(--accent);
          background: var(--bg);
          transform: rotate(45deg);
          box-shadow: 0 0 6px var(--accent-glow);
        }

        /* Corner labels */
        .panel-corner-tl {
          position: absolute;
          top: 16px;
          left: 16px;
          font-size: 9px;
          color: var(--text-muted);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .panel-corner-br {
          position: absolute;
          bottom: 16px;
          right: 16px;
          font-size: 9px;
          color: var(--text-muted);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22dd88;
          box-shadow: 0 0 6px #22dd88;
          animation: pulse 3s ease-in-out infinite;
        }

        /* Status bar at bottom */
        .status-bar {
          margin-top: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
        }

        .status-left {
          display: flex;
          align-items: center;
          gap: 20px;
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-divider {
          width: 1px;
          height: 12px;
          background: var(--border);
        }

        .status-right {
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--border-bright); }
        ::-webkit-scrollbar-thumb:hover { background: var(--accent-dim); }
      `}</style>

      <div className="page-root">
        <div className="bg-grid" />
        <div className="bg-glow" />
        <div className="bg-glow-2" />

        <div className="container">
          {/* Header */}
          <header className="header">
            <div className="header-left">
              <div className="header-eyebrow">
                <div className="eyebrow-dot" />
                System Active — v2.4.1
              </div>
              <h1 className="header-title">
                Sign<span>Lang</span><br />Translator
              </h1>
              <p className="header-subtitle">// bridge communication across modalities</p>
            </div>
            <div className="header-badge">ASL · PSE · ISL</div>
          </header>

          {/* Tab Navigation */}
          <div className="tab-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`tab-btn ${activeTab === tab.id ? 'active' : 'inactive'}`}
              >
                <div className="tab-indicator" />
                <span className="tab-icon">{tab.icon}</span>
                <span>{tab.short}</span>
              </button>
            ))}
          </div>

          {/* Content Panel */}
          <div className="panel">
            <div className="panel-corner-tl">
              {tabs.find(t => t.id === activeTab)?.label}
            </div>
            <div className="panel-corner-br">
              <div className="status-dot" />
              READY
            </div>

            {activeTab === 'sign-to-text' && <SignToText />}
            {activeTab === 'text-to-sign' && <TextToSign />}
            {activeTab === 'audio-to-sign' && <AudioToSign />}
            {activeTab === 'sign-book' && <SignBook />}
            {activeTab === 'settings' && <Settings />}
          </div>

          {/* Status Bar */}
          <div className="status-bar">
            <div className="status-left">
              <div className="status-item">
                <span style={{ color: '#22dd88' }}>●</span>
                <span>MODEL ONLINE</span>
              </div>
              <div className="status-divider" />
              <div className="status-item">
                <span>LATENCY 12ms</span>
              </div>
              <div className="status-divider" />
              <div className="status-item">
                <span>CONFIDENCE 94.2%</span>
              </div>
            </div>
            <div className="status-right">SYS_OK</div>
          </div>
        </div>
      </div>
    </>
  );
}
