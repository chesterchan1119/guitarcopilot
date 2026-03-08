// src/data/patternNotes.js

// Maps each pattern title → playable note sequence + duration
// Used by AIArrange.jsx to play audio for every pattern

export const patternNotesMap = {
  // 2/4 patterns
  "Simple Bass + Strum": {
    notes: ['C3', 'G3', 'E4', 'C4'], // C chord: bass + higher strum
    duration: '8n',
  },
  "Polka Bounce": {
    notes: ['G3', 'D4', 'B3', 'G3', 'D4', 'B3'], // G chord bounce (quick up-down)
    duration: '16n',
  },
  "Basic Arpeggio": {
    notes: ['G3', 'B3', 'D4', 'B3'], // Short G major arpeggio
    duration: '16n',
  },

  // 3/4 patterns
  "Classic Waltz Strum": {
    notes: ['G3', 'D4', 'B3', 'G3'], // G → D → Em feel
    duration: '8n',
  },
  "Waltz Arpeggio": {
    notes: ['G3', 'B3', 'D4', 'B3'], // G chord waltz flow
    duration: '12n',
  },
  "Broken Chord Waltz": {
    notes: ['A3', 'E4', 'C4', 'A4', 'E4', 'C4'], // Am broken chord
    duration: '16n',
  },

  // 4/4 patterns
  "Ultimate Pop/Rock Strum": {
    notes: ['G3', 'D4', 'B3', 'G3', 'E4', 'C4'], // G-D-Em-C progression pluck
    duration: '8n',
  },
  "C Major Arpeggio (Fingerstyle)": {
    notes: ['C4', 'E4', 'G4', 'C5', 'E4', 'C4'], // Classic C major roll
    duration: '16n',
  },
  "Em Broken Chord": {
    notes: ['E3', 'G3', 'B3', 'E4', 'G4', 'E4'], // Em arpeggio with bass
    duration: '16n',
  },
  "Boom-Chick Pattern": {
    notes: ['D3', 'A3', 'D4', 'A3'], // D bass + chord hit
    duration: '8n',
  },

  // 6/8 patterns
  "Classic 6/8 Swing Strum": {
    notes: ['C3', 'G3', 'E4', 'C4', 'G3'], // C → G swing
    duration: '8n',
  },
  "6/8 Arpeggio Flow": {
    notes: ['C3', 'E3', 'G3', 'C4', 'E4', 'G4'], // C major lilting flow
    duration: '12n',
  },
  "Soulful 6/8 Pattern": {
    notes: ['A3', 'E4', 'C4', 'A4', 'E4', 'C4'], // Am soulful arpeggio
    duration: '12n',
  },

  // 12/8 patterns
  "Slow Blues Strum": {
    notes: ['E3', 'B3', 'G3', 'E4', 'B3'], // E7 blues feel
    duration: '12n',
  },
  "12/8 Arpeggio Ballad": {
    notes: ['E3', 'G3', 'B3', 'E4', 'G4', 'B4', 'E5'], // E minor ballad flow
    duration: '12n',
  },

  // 5/4 patterns
  "5/4 Basic Pattern (3+2)": {
    notes: ['A3', 'E4', 'C4', 'A4', 'E4'], // Am odd-time pluck
    duration: '16n',
  },
  "5/4 Arpeggio": {
    notes: ['A3', 'C4', 'E4', 'A4', 'C4'], // Am asymmetrical roll
    duration: '16n',
  },

  // 7/8 patterns
  "7/8 Quick Strum (2+2+3)": {
    notes: ['D4', 'A4', 'F4', 'D4', 'A4', 'F4', 'D5'], // Dm quick odd feel
    duration: '16n',
  },
  "7/8 Arpeggio": {
    notes: ['D4', 'F4', 'A4', 'F4', 'D5', 'A4', 'F4'], // Dm rolling odd-time
    duration: '16n',
  },

  // Fallback for any unmapped title
  default: {
    notes: ['C4'],
    duration: '8n',
  }
};