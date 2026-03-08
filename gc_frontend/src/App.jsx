// src/App.jsx
import { useState } from 'react';

import TunerTab from './components/TunerTab.jsx';   // adjust path if different
import AIArrangeTab from './components/AIArrange/AIArrange.jsx';
export default function App() {
  const [activeTab, setActiveTab] = useState('tuner');

  return (
    <>
      {/* Header */}
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="logo-circle">🎸</div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.025em' }}>
              Guitar Copilot
            </h1>
            <p style={{ fontSize: '0.625rem', color: '#34d399', marginTop: '-0.25rem' }}>
              your pocket guitar buddy
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main>
        {activeTab === 'tuner' && <TunerTab />}
        {activeTab === 'metronome' && <div className="card">Metronome coming soon… ⏱️</div>}
        {activeTab === 'reels'     && <div className="card">Reels coming soon… 🎥</div>}
        {activeTab === 'scales'    && <AIArrangeTab />}
        {activeTab === 'jot'       && <div className="card">Tab jotter coming soon… ✍️</div>}
      </main>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        <button 
          onClick={() => setActiveTab('tuner')}
          className={`nav-btn ${activeTab === 'tuner' ? 'active' : ''}`}
        >
          <span style={{ fontSize: '1.5rem' }}>🎸</span>
          Tuner
        </button>
        <button 
          onClick={() => setActiveTab('metronome')}
          className={`nav-btn ${activeTab === 'metronome' ? 'active' : ''}`}
        >
          <span style={{ fontSize: '1.5rem' }}>⏱</span>
          Metro
        </button>
        <button 
          onClick={() => setActiveTab('reels')}
          className={`nav-btn ${activeTab === 'reels' ? 'active' : ''}`}
        >
          <span style={{ fontSize: '1.5rem' }}>🎥</span>
          Reels
        </button>
        <button 
          onClick={() => setActiveTab('scales')}
          className={`nav-btn ${activeTab === 'scales' ? 'active' : ''}`}
        >
          <span style={{ fontSize: '1.5rem' }}>🎼</span>
          Arrangement
        </button>
        <button 
          onClick={() => setActiveTab('jot')}
          className={`nav-btn ${activeTab === 'jot' ? 'active' : ''}`}
        >
          <span style={{ fontSize: '1.5rem' }}>✍️</span>
          Jot
        </button>
      </nav>
    </>
  );
}