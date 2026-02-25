// src/components/TunerTab.jsx
import { useState, useEffect, useRef } from 'react';

const STANDARD_TUNING = [
  { note: 'E', freq: 329.63, string: 'High E', num: 1 },
  { note: 'B', freq: 246.94, string: 'B',     num: 2 },
  { note: 'G', freq: 196.00, string: 'G',     num: 3 },
  { note: 'D', freq: 146.83, string: 'D',     num: 4 },
  { note: 'A', freq: 110.00, string: 'A',     num: 5 },
  { note: 'E', freq:  82.41, string: 'Low E', num: 6 },
];

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function frequencyToNote(frequency) {
  if (frequency <= 0) return { note: '-', cents: 0 };

  const noteNumber = 12 * Math.log2(frequency / 440) + 69;
  const n = Math.round(noteNumber);
  const note = NOTES[n % 12];
  const cents = Math.round(100 * (noteNumber - n));

  return { note, cents };
}

function closestStringNote(frequency) {
  let minDiff = Infinity;
  let closest = STANDARD_TUNING[0];
  let cents = 0;

  STANDARD_TUNING.forEach(str => {
    const diff = Math.abs(Math.log2(frequency / str.freq)) * 1200;
    if (diff < minDiff) {
      minDiff = diff;
      closest = str;
      cents = Math.round(100 * (Math.log2(frequency / str.freq) * 12));
    }
  });

  return { ...closest, cents };
}

export default function TunerTab() {
  const [currentNote, setCurrentNote] = useState('-');
  const [currentCents, setCurrentCents] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  // Play reference tone
  const playReference = (freq) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.25;

    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);

    osc.start();
    osc.stop(audioContextRef.current.currentTime + 1.2);
  };

  // Autocorrelation pitch detection (simple but decent version)
  const getPitch = (buffer, sampleRate) => {
    const SIZE = buffer.length;
    let maxCorrelation = 0;
    let bestLag = -1;

    for (let lag = 20; lag < SIZE / 2; lag++) {
      let correlation = 0;
      for (let i = 0; i < SIZE - lag; i++) {
        correlation += buffer[i] * buffer[i + lag];
      }
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestLag = lag;
      }
    }

    if (bestLag < 1 || maxCorrelation < 0.01) return -1;
    return sampleRate / bestLag;
  };

  const updatePitch = () => {
    if (!analyserRef.current || !isListening) return;

    const bufferLength = analyserRef.current.fftSize;
    const dataArray = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(dataArray);

    const pitch = getPitch(dataArray, audioContextRef.current.sampleRate);

    if (pitch > 60 && pitch < 1500) {
      // Option A: show closest musical note (chromatic)
      // const { note, cents } = frequencyToNote(pitch);
      // setCurrentNote(note);
      // setCurrentCents(cents);

      // Option B: show closest guitar string + deviation
      const { note, cents, string, num } = closestStringNote(pitch);
      setCurrentNote(`${note}${num} (${string})`);
      setCurrentCents(cents);
    }

    rafRef.current = requestAnimationFrame(updatePitch);
  };

  const startListening = async () => {
    try {
      setError(null);
      setIsListening(true);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;

      source.connect(analyserRef.current);

      updatePitch();
    } catch (err) {
      setError('Microphone access denied or not available.');
      setIsListening(false);
      console.error(err);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    return () => {
      stopListening();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const deviation = currentCents; // -50..50 cents → -50% .. +50%
  const needlePos = 50 + deviation; // 0..100 %

  return (
    <div className="tuner-container">
      <h2>Guitar Tuner</h2>
      <p style={{ color: '#34d399', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
        Standard tuning EADGBE
      </p>

      <div style={{ fontSize: '6rem', fontWeight: '900', color: '#10b981', minHeight: '7rem' }}>
        {currentNote}
      </div>

      <div style={{ fontSize: '1.1rem', color: currentCents === 0 ? '#10b981' : currentCents > 0 ? '#ef4444' : '#3b82f6' }}>
        {currentCents > 0 ? '+' : ''}{currentCents} cents
      </div>

      <div className="tuning-meter">
        <div className="meter-fill" style={{ transform: `translateX(${deviation < 0 ? deviation : 0}%)` }} />
        <div
          className="needle"
          style={{ left: `${Math.max(2, Math.min(98, needlePos))}%` }}
        />
      </div>

      <div className="string-buttons">
        {STANDARD_TUNING.map(str => (
          <button
            key={str.note + str.num}
            className="string-btn"
            onClick={() => playReference(str.freq)}
          >
            {str.note} <small style={{ opacity: 0.7 }}>{str.string}</small>
          </button>
        ))}
      </div>

      <button
        className={`start-btn ${isListening ? 'listening' : ''}`}
        onClick={isListening ? stopListening : startListening}
      >
        {isListening ? 'STOP LISTENING' : 'START AUTO TUNE'}
      </button>

      {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}

      <p style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '2rem' }}>
        Tap string to hear reference • Hold mic button for live detection
      </p>
    </div>
  );
}