// src/components/TunerTab.jsx
import { useState, useEffect, useRef } from 'react';
import guitarHead from '/guitarHead.png'; // Adjust path if needed

const STANDARD_TUNING = [
  { note: 'E', freq: 329.63, string: 'High E', num: 1 },
  { note: 'B', freq: 246.94, string: 'B',     num: 2 },
  { note: 'G', freq: 196.00, string: 'G',     num: 3 },
  { note: 'D', freq: 146.83, string: 'D',     num: 4 },
  { note: 'A', freq: 110.00, string: 'A',     num: 5 },
  { note: 'E', freq:  82.41, string: 'Low E', num: 6 },
];

const LEFT_COLUMN  = [STANDARD_TUNING[3], STANDARD_TUNING[4], STANDARD_TUNING[5]];
const RIGHT_COLUMN = [STANDARD_TUNING[0], STANDARD_TUNING[1], STANDARD_TUNING[2]];

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
  const [selectedString, setSelectedString] = useState(null);
  const [tunedStrings, setTunedStrings] = useState(new Set());
  const [currentCents, setCurrentCents] = useState(0);
  const [currentNote, setCurrentNote] = useState('—');
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

    let sumSquares = 0;
    for (let i = 0; i < SIZE; i++) {
      sumSquares += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sumSquares / SIZE);

    if (rms < 0.0065) return -1; // slightly lowered noise floor

    const normalized = new Float32Array(SIZE);
    for (let i = 0; i < SIZE; i++) {
      normalized[i] = buffer[i] / (rms || 1);
    }

    let maxCorrelation = 0;
    let bestLag = -1;

    for (let lag = 18; lag < SIZE / 2; lag++) {
      let correlation = 0;
      for (let i = 0; i < SIZE - lag; i++) {
        correlation += normalized[i] * normalized[i + lag];
      }
      correlation /= (SIZE - lag);

      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestLag = lag;
      }
    }

    if (bestLag < 1 || maxCorrelation < 0.065) return -1;

    return sampleRate / bestLag;
  };

  const updatePitch = () => {
    if (!analyserRef.current || !isListening) {
      rafRef.current = requestAnimationFrame(updatePitch);
      return;
    }

    const bufferLength = analyserRef.current.fftSize;
    const dataArray = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(dataArray);

    // Quick level diagnostics
    let maxAbs = 0;
    let sumSq = 0;
    for (let val of dataArray) {
      const abs = Math.abs(val);
      if (abs > maxAbs) maxAbs = abs;
      sumSq += val * val;
    }
    const rms = Math.sqrt(sumSq / bufferLength);

    const pitch = getPitch(dataArray, audioContextRef.current.sampleRate);

    if (pitch > 0) {
      // ─── Every detected pitch is logged ───────────────────────────────
      console.log(
        `%c[PITCH] ${pitch.toFixed(1)} Hz   (rms: ${rms.toFixed(5)}, peak: ${maxAbs.toFixed(4)})`,
        'background:#1e293b; color:#c084fc; padding:3px 7px; border-radius:4px; font-weight:500;'
      );

      if (pitch > 65 && pitch < 1450) {
        const detected = closestStringNote(pitch);

        console.log(
          `   → ${detected.note}${detected.num} (${detected.string})   ${detected.cents >= 0 ? '+' : ''}${detected.cents} cents`
        );

        // When it matches the currently selected string
        if (selectedString && detected.num === selectedString.num) {
          setCurrentCents(detected.cents);
          setCurrentNote(`${detected.note}${detected.num} (${detected.string})`);

          console.log(
            `%c   MATCH → ${selectedString.string}   ${detected.cents >= 0 ? '+' : ''}${detected.cents} cents`,
            'color:#60a5fa; font-weight:bold; background:#1e293b; padding:2px 6px; border-radius:3px;'
          );

          if (Math.abs(detected.cents) <= 6) {
            console.log(
              `%c   TUNED! ${selectedString.string} (±6 cents)`,
              'background:#065f46; color:#d1fae5; padding:4px 9px; border-radius:5px; font-weight:bold;'
            );
            setTunedStrings(prev => new Set([...prev, selectedString.num]));
          }
        }
      }
    }

    rafRef.current = requestAnimationFrame(updatePitch);
  };

  const startListening = async () => {
    if (!selectedString) {
      setError('請先選擇要調的弦');
      return;
    }

    try {
      setError(null);
      setIsListening(true);
      console.log(
        `%c[START LISTENING]  Target: ${selectedString.string} (${selectedString.note}${selectedString.num})`,
        'background:#065f46; color:white; padding:4px 10px; border-radius:6px; font-weight:bold;'
      );

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      console.log('%c[MIC] Access granted', 'color:#34d399;');

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;

      source.connect(analyserRef.current);
      console.log('%c[AUDIO] Analyser ready', 'color:#60a5fa;');

      updatePitch();
    } catch (err) {
      setError('無法開啟麥克風');
      setIsListening(false);
      console.error('[MIC ERROR]', err);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      console.log('%c[STOP] Microphone released', 'color:#f87171; font-weight:500;');
    }
  };

  const handleStringClick = (str) => {
    setSelectedString(str);
    playReference(str.freq);
    setCurrentCents(0);
    setCurrentNote('—');
    console.log(`[SELECT] ${str.string} • ${str.note}${str.num} @ ${str.freq} Hz`);
  };

  const resetTuning = () => {
    setTunedStrings(new Set());
    setSelectedString(null);
    setCurrentCents(0);
    setCurrentNote('—');
    console.log('%c[RESET] All progress cleared', 'color:#fbbf24;');
  };

  useEffect(() => {
    return () => {
      stopListening();
      if (audioContextRef.current) audioContextRef.current.close();
      console.log('%c[CLEANUP] AudioContext closed', 'color:#9ca3af;');
    };
  }, []);

  // Needle position (non-linear response)
  const deviation = currentCents;
  const needlePos = 50 + Math.sign(deviation) * Math.pow(Math.abs(deviation) / 50, 0.7) * 50;

  const getStringButtonStyle = (str) => {
    let borderColor = '#4b5563';
    let textColor = '#9ca3af';
    let bg = 'rgba(75,85,99,0.1)';

    if (tunedStrings.has(str.num)) {
      borderColor = '#10b981';
      textColor = '#10b981';
      bg = 'rgba(16,185,129,0.18)';
    } else if (selectedString?.num === str.num) {
      borderColor = '#3b82f6';
      textColor = '#3b82f6';
      bg = 'rgba(59,130,246,0.18)';
    }

    return {
      border: `2.5px solid ${borderColor}`,
      color: textColor,
      background: bg,
      width: '76px',
      height: '76px',
      borderRadius: '50%',
      fontWeight: 'bold',
      fontSize: '1.4rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 3px 12px rgba(0,0,0,0.25)',
      transition: 'all 0.18s ease',
      cursor: 'pointer',
    };
  };

  return (
    <div style={{
      padding: '1.5rem',
      maxWidth: '480px',
      margin: '0 auto',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h2 style={{ marginBottom: '0.5rem' }}>吉他調音器</h2>
      <p style={{ color: '#10b981', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
        標準調弦 — EADGBE
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '1rem auto',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem', marginBottom: '80px' }}>
          {LEFT_COLUMN.map(str => (
            <button key={str.num} onClick={() => handleStringClick(str)} style={getStringButtonStyle(str)}>
              {str.note}
              <small style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '5px' }}>
                {str.string.includes('Low') ? 'E' : str.note}
              </small>
            </button>
          ))}
        </div>

        <div style={{ width: '280px', height: '450px', flexShrink: 0 }}>
          <img
            src={guitarHead}
            alt="Guitar headstock"
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 5px 18px rgba(0,0,0,0.35)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem', marginBottom: '80px' }}>
          {RIGHT_COLUMN.slice().reverse().map(str => (
            <button key={str.num} onClick={() => handleStringClick(str)} style={getStringButtonStyle(str)}>
              {str.note}
              <small style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '5px' }}>
                {str.string.includes('High') ? 'e' : str.note}
              </small>
            </button>
          ))}
        </div>
      </div>

      <div style={{
        fontSize: '5.8rem',
        fontWeight: '900',
        color: tunedStrings.size === 6 ? '#10b981' : '#e5e7eb',
        minHeight: '7rem',
        lineHeight: '1',
        margin: '0.5rem 0',
      }}>
        {currentNote}
      </div>

      <div style={{
        fontSize: '1.35rem',
        color: currentCents === 0 ? '#9ca3af' : currentCents > 0 ? '#ef4444' : '#3b82f6',
        marginBottom: '1.8rem',
      }}>
        {currentCents !== 0 && (currentCents > 0 ? '+' : '')}{currentCents} cents
      </div>

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

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '1.5rem 0' }}>
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={!selectedString}
          style={{
            padding: '1.1rem 2.2rem',
            fontSize: '1.15rem',
            fontWeight: 'bold',
            borderRadius: '999px',
            background: isListening ? '#ef4444' : selectedString ? '#10b981' : '#4b5563',
            color: 'white',
            border: 'none',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            cursor: selectedString ? 'pointer' : 'not-allowed',
            transition: 'all 0.16s ease',
            opacity: selectedString ? 1 : 0.6,
          }}
        >
          {isListening ? '停止監聽' : '開始調音'}
        </button>

        <button
          onClick={resetTuning}
          style={{
            padding: '1.1rem 1.8rem',
            fontSize: '1.15rem',
            fontWeight: 'bold',
            borderRadius: '999px',
            background: '#374151',
            color: '#e5e7eb',
            border: '1px solid #4b5563',
            cursor: 'pointer',
            transition: 'all 0.16s ease',
          }}
        >
          重置
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', margin: '1rem 0', fontWeight: '500' }}>{error}</p>}

      {tunedStrings.size === 6 && (
        <p style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: '600', marginTop: '1.5rem' }}>
          ✓ 吉他已全部調好！
        </p>
      )}

      <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '2rem' }}>
        點擊弦按鈕聽參考音 • 選擇弦後開始監聽
      </p>
    </div>
  );
}