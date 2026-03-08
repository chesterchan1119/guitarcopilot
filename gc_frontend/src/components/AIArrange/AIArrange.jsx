// src/components/AIArrange/AIArrange.jsx
import { useState } from 'react';
import guitarPatterns from '../../data/guitarPatterns'; // Adjust path if needed
import "./AIArrange.css";

export default function AIArrangeTab() {
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [songFile, setSongFile] = useState(null);
  const [songLink, setSongLink] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);

    // Simulate "AI generation" delay
    setTimeout(() => {
      // Get suggestions for the selected time signature
      const selectedPatterns = guitarPatterns[timeSignature]?.suggestions || [];

      if (selectedPatterns.length === 0) {
        console.warn(`No patterns found for ${timeSignature}`);
      }

      setSuggestions(selectedPatterns);
      setIsGenerating(false);
    }, 800);
  };

  const playPattern = (title, pattern) => {
    // In real app → use Tone.js / Web Audio to play according to pattern & time signature
    console.log(`Playing: ${title} → ${pattern} in ${timeSignature}`);
    alert(`Simulated playback:\n${title}\nPattern: ${pattern}\nTime: ${timeSignature}`);
    // Future: real audio logic here
  };

  return (
    <div className="ai-arrange-tab">
      <h2>AI Pattern Suggester</h2>
      <p className="subtitle">
        Choose time signature → get suitable strumming & arpeggio patterns
      </p>

      <div className="form-card">
        <div className="form-group">
          <label>Time Signature</label>
          <select
            value={timeSignature}
            onChange={(e) => {
              setTimeSignature(e.target.value);
              setSuggestions([]); // Clear previous results when changing signature
            }}
          >
            <option value="2/4">2/4 (March / Polka)</option>
            <option value="3/4">3/4 (Waltz)</option>
            <option value="4/4" selected>4/4 (Pop / Rock / Folk)</option>
            <option value="6/8">6/8 (Compound / Ballad)</option>
            <option value="12/8">12/8 (Slow Blues / Shuffle)</option>
            <option value="5/4">5/4 (Progressive / Odd)</option>
            <option value="7/8">7/8 (Balkan / Complex)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Upload Song (optional)</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setSongFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="form-group">
          <label>Or Paste Song Link (optional)</label>
          <input
            type="url"
            placeholder="https://youtube.com/..."
            value={songLink}
            onChange={(e) => setSongLink(e.target.value)}
          />
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
            <div key={index} className="pattern-card">
              <strong className="pattern-title">{sug.title}</strong>
              <div className="pattern-meta">{sug.pattern}</div>
              <pre className="tab-display">{sug.tab}</pre>

              {/* Play overlay button */}
              <button
                className="play-overlay-btn"
                onClick={() => playPattern(sug.title, sug.pattern)}
                aria-label={`Play ${sug.title} pattern`}
              >
                ▶
              </button>
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