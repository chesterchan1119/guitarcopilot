// src/components/TunerTab.jsx
import { useState, useEffect, useRef } from 'react';
import guitarHead from '/guitarHead.png'; // Adjust if your import path is different → '/guitarHead.png'

const STANDARD_TUNING = [
  { note: 'E', freq: 329.63, string: 'High E', num: 1 }, // right column - top
  { note: 'B', freq: 246.94, string: 'B',     num: 2 }, // right column - middle
  { note: 'G', freq: 196.00, string: 'G',     num: 3 }, // right column - bottom
  { note: 'D', freq: 146.83, string: 'D',     num: 4 }, // left column - top
  { note: 'A', freq: 110.00, string: 'A',     num: 5 }, // left column - middle
  { note: 'E', freq:  82.41, string: 'Low E', num: 6 }, // left column - bottom
];

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Split for visual layout: left = low strings, right = high strings
const LEFT_COLUMN  = [STANDARD_TUNING[3], STANDARD_TUNING[4], STANDARD_TUNING[5]]; // D, A, Low E
const RIGHT_COLUMN = [STANDARD_TUNING[0], STANDARD_TUNING[1], STANDARD_TUNING[2]]; // High E, B, G

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

  const deviation = currentCents;
  const needlePos = 50 + deviation;

  return (
    <div style={{
      padding: '1.5rem',
      maxWidth: '480px',
      margin: '0 auto',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Guitar Tuner</h2>
      <p style={{ color: '#10b981', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
        Standard tuning — EADGBE
      </p>

      {/* Two-column layout with headstock in center */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '1rem auto',
      
      }}>
        {/* LEFT column — D A Low E */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.3rem',
          marginBottom: '80px'
        }}>
          {LEFT_COLUMN.map(str => (
            <button
              key={str.note + str.num}
              onClick={() => playReference(str.freq)}
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                border: '2.5px solid #10b981',
                background: 'rgba(16, 185, 129, 0.08)',
                color: '#10b981',
                fontWeight: 'bold',
                fontSize: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 12px rgba(0,0,0,0.25)',
                transition: 'all 0.14s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {str.note}
              <small style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '5px' }}>
                {str.string.includes('Low') ? 'E' : str.note}
              </small>
            </button>
          ))}
        </div>

        {/* Headstock image */}
        <div style={{
          width: '280px',
          height: '450px',
          flexShrink: 0,
        }}>
          <img
            src={guitarHead}
            alt="Guitar headstock"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 5px 18px rgba(0,0,0,0.35)',
            }}
          />
        </div>

       {/* RIGHT column — now bottom to top: G → B → High E */}
<div style={{
  display: 'flex',
  flexDirection: 'column',
  gap: '1.3rem',
     marginBottom: '80px'
}}>
  {RIGHT_COLUMN.slice().reverse().map(str => (   // ← added .slice().reverse()
    <button
      key={str.note + str.num}
      onClick={() => playReference(str.freq)}
      style={{
        width: '76px',
        height: '76px',
        borderRadius: '50%',
        border: '2.5px solid #10b981',
        background: 'rgba(16, 185, 129, 0.08)',
        color: '#10b981',
        fontWeight: 'bold',
        fontSize: '1.4rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 3px 12px rgba(0,0,0,0.25)',
        transition: 'all 0.14s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {str.note}
      <small style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '5px' }}>
        {str.string.includes('High') ? 'e' : str.note}
      </small>
    </button>
  ))}
</div>
      </div>

      {/* Detected note & cents */}
      <div style={{
        fontSize: '5.8rem',
        fontWeight: '900',
        color: '#10b981',
        minHeight: '7rem',
        lineHeight: '1',
        margin: '0.5rem 0',
      }}>
        {currentNote}
      </div>

      <div style={{
        fontSize: '1.35rem',
        color: currentCents === 0 ? '#10b981' : currentCents > 0 ? '#ef4444' : '#3b82f6',
        marginBottom: '1.8rem',
      }}>
        {currentCents > 0 ? '+' : ''}{currentCents} cents
      </div>

      {/* Tuning meter */}
      <div style={{
        height: '14px',
        background: '#1f2937',
        borderRadius: '7px',
        margin: '1.5rem auto',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: '400px',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, #3b82f6, #10b981, #ef4444)',
          transform: `translateX(${deviation < 0 ? deviation : 0}%)`,
          transition: 'transform 0.08s ease-out',
        }} />
        <div style={{
          position: 'absolute',
          width: '5px',
          height: '220%',
          background: '#ffffff',
          left: `${Math.max(2, Math.min(98, needlePos))}%`,
          top: '-60%',
          transform: 'translateX(-50%)',
          boxShadow: '0 0 12px rgba(255,255,255,0.9)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Start / Stop button */}
      <button
        onClick={isListening ? stopListening : startListening}
        style={{
          padding: '1.1rem 3rem',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          margin: '2rem 0 1.5rem',
          borderRadius: '999px',
          background: isListening ? '#ef4444' : '#10b981',
          color: 'white',
          border: 'none',
          boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          transition: 'all 0.16s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {isListening ? 'STOP LISTENING' : 'START AUTO TUNE'}
      </button>

      {error && (
        <p style={{ color: '#ef4444', margin: '1rem 0', fontWeight: '500' }}>
          {error}
        </p>
      )}

      <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '2rem' }}>
        Tap any button to hear reference tone • Hold mic button for live detection
      </p>
    </div>
  );
}