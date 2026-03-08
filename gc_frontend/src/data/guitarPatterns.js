// src/data/guitarPatterns.js

// Complete guitar patterns data - using ES6 template literals for readable multiline tabs
// This file is imported as a module, NOT parsed as JSON

export default {
  "2/4": {
    description: "March/polka feel – 2 strong beats per bar. Less common for full songs, but great for sections.",
    suggestions: [
      {
        title: "Simple Bass + Strum",
        pattern: "Bass D (classic march feel)",
        tab: `   C
e |---0---0---|
B |---1---1---|
G |---0---0---|
D |---2---2---|
A |-3---------|
E |-----------|`
      },
      {
        title: "Polka Bounce",
        pattern: "D U D U (quick upbeat)",
        tab: `   G
e |---3---3---|
B |---0---0---|
G |---0---0---|
D |---0---0---|
A |---2---2---|
E |-3---------|`
      },
      {
        title: "Basic Arpeggio",
        pattern: "T 1 2 (short and rhythmic)",
        tab: `e |---------0---------|
B |-------1---1-------|
G |-----0-------0-----|
D |-------------------|
A |---2---------------|
E |-3-----------------|`
      }
    ]
  },

  "3/4": {
    description: "Waltz time – flowing triple feel, accent on beat 1. Common in ballads and folk.",
    suggestions: [
      {
        title: "Classic Waltz Strum",
        pattern: "D D U (gentle waltz)",
        tab: `   G       D       Em
e |---3---|---2---|---0---|
B |---0---|---3---|---0---|
G |---0---|---2---|---0---|
D |---0---|---0---|---2---|
A |---2---|-------|---2---|
E |-3-----|-2-----|-0-----|`
      },
      {
        title: "Waltz Arpeggio",
        pattern: "T 1 2 1 (flowing triple)",
        tab: `e |-------0-------|
B |-----1---1-----|
G |---0-------0---|
D |---------------|
A |---------------|
E |-3-------------|`
      },
      {
        title: "Broken Chord Waltz",
        pattern: "T 1 3 2 1 (romantic feel)",
        tab: `   Am
e |---------0-----------|
B |-------1---1---------|
G |-----2-------2-------|
D |---2-----------2-----|
A |-0-------------------|
E |---------------------|`
      }
    ]
  },

  "4/4": {
    description: "Most common time signature in pop, rock, folk, indie. Straight feel, 4 beats per bar.",
    suggestions: [
      {
        title: "Ultimate Pop/Rock Strum",
        pattern: "D D U U D U (classic)",
        tab: `   G       D       Em      C
e |---3---|---2---|---0---|---0---|
B |---0---|---3---|---0---|---1---|
G |---0---|---2---|---0---|---0---|
D |---0---|---0---|---2---|---2---|
A |---2---|-------|---2---|---3---|
E |-3-----|-2-----|-0-----|-------|`
      },
      {
        title: "C Major Arpeggio (Fingerstyle)",
        pattern: "T 1 2 3 2 1 (slow roll up)",
        tab: `e |-----0-----------0-----|
B |---1---1-------1---1---|
G |-0-------0---0-------0-|
D |-----------2-----------|
A |-----------------------|
E |-----------------------|`
      },
      {
        title: "Em Broken Chord",
        pattern: "T 1 2 3 2 1 _ (thumb bass)",
        tab: `e |-----------------0-----------------|
B |-------------0-----0---------------|
G |---------0-----------0-------------|
D |-----2-----------------2-----------|
A |---2-----------------------2-------|
E |-0-----------------------------0---|`
      },
      {
        title: "Boom-Chick Pattern",
        pattern: "Bass D _ D (country/rock)",
        tab: `   D
e |---2---2---|
B |---3---3---|
G |---2---2---|
D |-0---------|
A |-----------|
E |-----------|`
      }
    ]
  },

  "6/8": {
    description: "Compound time – feels like 2 big beats (dotted quarter). Swing/lilting feel, common in ballads & folk.",
    suggestions: [
      {
        title: "Classic 6/8 Swing Strum",
        pattern: "D U D U D U (gentle cycle)",
        tab: `   C       G
e |---0---|---3---|
B |---1---|---0---|
G |---0---|---0---|
D |---2---|---0---|
A |-3-----|---2---|
E |-------|-3-----|`
      },
      {
        title: "6/8 Arpeggio Flow",
        pattern: "T 1 2 3 2 1 (lilting)",
        tab: `e |-----------0---------------|
B |-------1-------1-----------|
G |-----0---0-------0---------|
D |---2---------------2-------|
A |-3-------------------3-----|
E |---------------------------|`
      },
      {
        title: "Soulful 6/8 Pattern",
        pattern: "D _ U D U _ (emphasize 1 & 4)",
        tab: `   Am
e |---0-------0---|
B |---1-------1---|
G |---2-------2---|
D |---2-------2---|
A |-0-------------|
E |---------------|`
      }
    ]
  },

  "12/8": {
    description: "Slow blues/rock ballad feel – 4 groups of triplets (very similar to slow 4/4 with swing).",
    suggestions: [
      {
        title: "Slow Blues Strum",
        pattern: "D D U D U (triplet feel)",
        tab: `   E7
e |---0---0---|
B |---3---3---|
G |---1---1---|
D |---2---2---|
A |-----------|
E |-0---------|`
      },
      {
        title: "12/8 Arpeggio Ballad",
        pattern: "T 1 2 1 3 1 2 1 (flowing triplets)",
        tab: `e |---------------0---------------|
B |-----------0-------0-----------|
G |-------1---------------1-------|
D |-----2-------------------2-----|
A |---2-----------------------2---|
E |-0-----------------------------|`
      }
    ]
  },

  "5/4": {
    description: "Odd time – 5 beats per bar. Often feels like 3+2 or 2+3 grouping. Progressive rock / modern.",
    suggestions: [
      {
        title: "5/4 Basic Pattern (3+2)",
        pattern: "D D U D U",
        tab: `   Am
e |---0---0---|
B |---1---1---|
G |---2---2---|
D |---2---2---|
A |-0---------|
E |-----------|`
      },
      {
        title: "5/4 Arpeggio",
        pattern: "T 1 2 3 1 (asymmetrical roll)",
        tab: `e |-----0-----0-----|
B |---1-----1-----1-|
G |-2---------2-----|
D |-----------------|
A |-----------------|
E |-----------------|`
      }
    ]
  },

  "7/8": {
    description: "Fast odd time – usually grouped 2+2+3 or 3+2+2. Balkan, progressive, jazz fusion feel.",
    suggestions: [
      {
        title: "7/8 Quick Strum (2+2+3)",
        pattern: "D U D U D U D",
        tab: `   Dm
e |---1---1---|
B |---3---3---|
G |---2---2---|
D |-0---------|
A |-----------|
E |-----------|`
      },
      {
        title: "7/8 Arpeggio",
        pattern: "T 1 2 1 3 1 2 (rolling odd feel)",
        tab: `e |-------0---------------|
B |-----1---1-------------|
G |---2-------2-----------|
D |-0-----------0---------|
A |-----------------3-----|
E |-----------------------|`
      }
    ]
  }
};