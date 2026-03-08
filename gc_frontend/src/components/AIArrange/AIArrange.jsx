// src/components/AIArrange/AIArrange.jsx
import { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import guitarPatterns from '../../data/guitarPatterns';
import { patternNotesMap } from '../../data/patternNotes';
import "./AIArrange.css";

export default function AIArrangeTab() {
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioStatus, setAudioStatus] = useState('Not started');
  const [playingIndex, setPlayingIndex] = useState(null);
  const [progress, setProgress] = useState(0);

  const pluckSynthRef = useRef(null);
  const sequenceRef = useRef(null);
  const rafRef = useRef(null);

  const initAudioIfNeeded = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      setAudioStatus('AudioContext resumed');
      console.log('AudioContext resumed');
    }

    if (!pluckSynthRef.current) {
      pluckSynthRef.current = new Tone.PluckSynth({
        attackNoise: 2.5,
        dampening: 5200,
        resonance: 0.91,
      }).toDestination();

      const reverb = new Tone.Reverb({ decay: 2.2, wet: 0.18 }).toDestination();
      const chorus = new Tone.Chorus({
        frequency: 1.4,
        delayTime: 3.5,
        depth: 0.45,
        wet: 0.15,
      }).toDestination();

      pluckSynthRef.current.chain(chorus, reverb);
      console.log('PluckSynth ready');
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

      // Stop & clean previous playback
      if (sequenceRef.current) {
        sequenceRef.current.stop();
        sequenceRef.current.dispose();
        sequenceRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      setPlayingIndex(index);
      setProgress(0);

      // Get notes & duration
      const config = patternNotesMap[title] || patternNotesMap.default;
      const arpNotes = config.notes;
      const noteDuration = config.duration;

      const totalDuration = Tone.Time(noteDuration).toSeconds() * arpNotes.length;

      // New sequence
      sequenceRef.current = new Tone.Sequence(
        (time, note) => {
          pluckSynthRef.current.triggerAttack(note, time);
        },
        arpNotes,
        noteDuration
      );

      const startTime = Tone.now() + 0.03;
      sequenceRef.current.start(startTime);
      sequenceRef.current.loop = false;

      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
      }

      // Progress bar logic — more reliable timing
      const progressStart = Tone.now();
      const updateProgress = () => {
        const now = Tone.now();
        const elapsed = now - progressStart;
        let prog = (elapsed / totalDuration) * 100;
        prog = Math.min(100, prog);

        setProgress(prog);

        if (prog < 100 && sequenceRef.current) {
          rafRef.current = requestAnimationFrame(updateProgress);
        } else {
          setPlayingIndex(null);
          setProgress(0);
        }
      };

      rafRef.current = requestAnimationFrame(updateProgress);

      console.log(`Playing "${title}" | ${arpNotes.join(' → ')} | ${noteDuration}`);
    } catch (err) {
      console.error('Playback error:', err);
      alert('Audio playback failed. Check console.');
    }
  };

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

              {/* Neon progress bar – always render when playing */}
              {playingIndex === index && (
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${progress}%` }}
                  />
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