// src/utils/useGuitarPlayer.js
import * as Tone from 'tone';
import { useEffect, useRef } from 'react';

// Minimal guitar samples (you'll need real .mp3/.wav files)
// For demo you can use free guitar samples from https://freesound.org or https://99sounds.org
// Or start with Tone's built-in synth for quick testing
const guitarSamples = {
  'C3': '/samples/guitar-c3.mp3',   // low C (adjust octaves as needed)
  'E3': '/samples/guitar-e3.mp3',
  'G3': '/samples/guitar-g3.mp3',
  'C4': '/samples/guitar-c4.mp3',
  'E4': '/samples/guitar-e4.mp3',
  'G4': '/samples/guitar-g4.mp3',
  // Add more notes for better range (A2, D3, etc.)
};

export function useGuitarPlayer() {
  const samplerRef = useRef(null);
  const sequenceRef = useRef(null);

  useEffect(() => {
    // Create sampler once
    samplerRef.current = new Tone.Sampler({
      urls: guitarSamples,
      release: 1,       // let notes ring a bit
      baseUrl: '',      // if samples are in public/
    }).toDestination();

    // Clean up on unmount
    return () => {
      if (sequenceRef.current) sequenceRef.current.dispose();
      samplerRef.current.dispose();
    };
  }, []);

  const playArpeggio = async (notes = ['C4', 'E4', 'G4', 'C5', 'E4', 'C4'], duration = '8n') => {
    if (Tone.context.state !== 'running') {
      await Tone.start(); // resume audio context on user gesture
    }

    // Stop any previous sequence
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current.dispose();
    }

    // Create new sequence for arpeggio
    sequenceRef.current = new Tone.Sequence((time, note) => {
      samplerRef.current.triggerAttackRelease(note, '8n', time);
    }, notes, duration); // duration = time between notes

    sequenceRef.current.loop = false; // play once
    sequenceRef.current.start(0);

    // Optional: start transport if not already
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }
  };

  const stop = () => {
    if (sequenceRef.current) {
      sequenceRef.current.stop();
    }
  };

  return { playArpeggio, stop };
}