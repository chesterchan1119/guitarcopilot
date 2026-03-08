// src/components/AIArrange/AIArrange.jsx
import { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import guitarPatterns from '../../data/guitarPatterns'; // your .js file
import "./AIArrange.css";

export default function AIArrangeTab() {
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioStatus, setAudioStatus] = useState('Not started');
  const [playingIndex, setPlayingIndex] = useState(null); // which pattern is playing
  const [progress, setProgress] = useState(0);           // 0–100%

  const pluckSynthRef = useRef(null);
  const sequenceRef = useRef(null);
  const rafRef = useRef(null); // animation frame for progress

  // Initialize audio system (only once)
  const initAudioIfNeeded = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      setAudioStatus('AudioContext resumed');
      console.log('AudioContext resumed on user gesture');
    }

    if (!pluckSynthRef.current) {
      // Tuned PluckSynth for realistic fingerstyle guitar sound
      pluckSynthRef.current = new Tone.PluckSynth({
        attackNoise: 2.5,      // crisp string attack
        dampening: 5200,       // bright but natural decay
        resonance: 0.91,       // good string sustain & fade
      }).toDestination();

      // Add subtle reverb + chorus for acoustic depth
      const reverb = new Tone.Reverb({
        decay: 2.2,
        wet: 0.18,
      }).toDestination();

      const chorus = new Tone.Chorus({
        frequency: 1.4,
        delayTime: 3.5,
        depth: 0.45,
        wet: 0.15,
      }).toDestination();

      pluckSynthRef.current.chain(chorus, reverb);

      console.log('PluckSynth ready – guitar-like fingerstyle tone');
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const selected = guitarPatterns[timeSignature]?.suggestions || [];
      setSuggestions(selected);
      setIsGenerating(false);
    }, 800);
  };

  const playPattern = async (title, pattern, index) => {
    try {
      await initAudioIfNeeded();

      // 1. Stop & clean any existing sequence
      if (sequenceRef.current) {
        sequenceRef.current.stop();
        sequenceRef.current.dispose();
        sequenceRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      // Reset UI for this card
      setPlayingIndex(index);
      setProgress(0);

      if (title.includes('C Major Arpeggio')) {
        const arpNotes = ['C4', 'E4', 'G4', 'C5', 'E4', 'C4'];
        const noteDuration = '16n'; // fast arpeggio (use '12n' or '8n' for slower)
        const totalDuration = Tone.Time(noteDuration).toSeconds() * arpNotes.length;

        // Create brand-new sequence every time
        sequenceRef.current = new Tone.Sequence(
          (time, note) => {
            pluckSynthRef.current.triggerAttack(note, time);
          },
          arpNotes,
          noteDuration
        );

        // Schedule from "now" + tiny offset (prevents scheduling in the past)
        const startTime = Tone.now() + 0.03;

        sequenceRef.current.start(startTime);
        sequenceRef.current.loop = false;

        // Start Transport only if not already running
        if (Tone.Transport.state !== 'started') {
          Tone.Transport.start();
        }

        // Real-time progress bar animation
        const updateProgress = () => {
          const elapsed = Tone.Transport.seconds - startTime;
          const prog = Math.min(100, (elapsed / totalDuration) * 100);
          setProgress(prog);

          if (prog < 100 && sequenceRef.current) {
            rafRef.current = requestAnimationFrame(updateProgress);
          } else {
            setPlayingIndex(null); // hide progress when finished
          }
        };
        rafRef.current = requestAnimationFrame(updateProgress);

        console.log(`Playing C Major Arpeggio at ${startTime.toFixed(2)}s | ${arpNotes.join(' → ')}`);
      } else {
        // Fallback for other patterns
        pluckSynthRef.current.triggerAttackRelease('C4', '8n');
        alert(`Basic pluck demo for:\n${title}\n(Full pattern not implemented yet)`);
      }
    } catch (err) {
      console.error('Playback error:', err);
      alert('Audio playback failed. Check console for details.');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sequenceRef.current) {
        sequenceRef.current.stop();
        sequenceRef.current.dispose();
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (pluckSynthRef.current) pluckSynthRef.current.dispose();
    };
  }, []);

  return (
    <div className="ai-arrange-tab">
      <h2>AI Pattern Suggester</h2>
      <p className="subtitle">
        Choose time signature → get suitable strumming & arpeggio patterns
        <br />
        <small style={{ color: '#00f0ff' }}>Audio status: {audioStatus}</small>
      </p>

      <div className="form-card">
        <div className="form-group">
          <label>Time Signature</label>
          <select
            value={timeSignature}
            onChange={(e) => {
              setTimeSignature(e.target.value);
              setSuggestions([]);
            }}
          >
            <option value="2/4">2/4 (March / Polka)</option>
            <option value="3/4">3/4 (Waltz)</option>
            <option value="4/4">4/4 (Pop / Rock / Folk)</option>
            <option value="6/8">6/8 (Compound / Ballad)</option>
            <option value="12/8">12/8 (Slow Blues / Shuffle)</option>
            <option value="5/4">5/4 (Progressive / Odd)</option>
            <option value="7/8">7/8 (Balkan / Complex)</option>
          </select>
        </div>

        {/* Optional: keep for future */}
        <div className="form-group">
          <label>Upload Song (optional)</label>
          <input type="file" accept="audio/*" disabled />
        </div>
        <div className="form-group">
          <label>Or Paste Song Link (optional)</label>
          <input type="url" placeholder="https://..." disabled />
        </div>

        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Show Patterns'}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="suggestions-panel">
          <h3>
            Patterns for {timeSignature}
            {guitarPatterns[timeSignature]?.description && (
              <small> – {guitarPatterns[timeSignature].description}</small>
            )}
          </h3>

          {suggestions.map((sug, index) => (
            <div
              key={index}
              className={`pattern-card ${playingIndex === index ? 'playing' : ''}`}
            >
              <strong className="pattern-title">{sug.title}</strong>
              <div className="pattern-meta">{sug.pattern}</div>
              <pre className="tab-display">{sug.tab}</pre>

              <button
                className="play-overlay-btn"
                onClick={() => playPattern(sug.title, sug.pattern, index)}
                aria-label={`Play ${sug.title}`}
              >
                ▶
              </button>

              {/* Neon progress bar at bottom edge */}
              {playingIndex === index && (
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {suggestions.length === 0 && !isGenerating && (
        <p className="placeholder-text">
          Select a time signature and click "Show Patterns" to see ideas...
        </p>
      )}
    </div>
  );
}