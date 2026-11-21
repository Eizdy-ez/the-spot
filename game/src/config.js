// config.js — level data, differences, and rules for THE SPOT.
// All pictures are drawn procedurally by draw.js; there are no external assets.
// Scene coordinate space: 600 x 400. Every difference has a click point (x, y)
// and radius (r) in that space, identical on both panels (left and right).
export const SCENE_W = 600;
export const SCENE_H = 400;
export const DIFFS_PER_LEVEL = 7;
export const LEVEL_TIME = 90; // seconds per level
export const MAX_HEARTS = 3;
export const MAX_HINTS = 2;
export const POINTS_PER_FIND = 100;
export const TIME_BONUS_PER_SECOND = 5;

export const LEVELS = [
  {
    id: 'park',
    title: 'Level 1 — Morning Park',
    subtitle: 'A city park in the morning. 7 hidden differences.',
    scene: 'park',
    diffs: [
      { id: 'kacamata', label: 'Sun sunglasses', x: 88, y: 66, r: 34 },
      { id: 'awan', label: 'Second cloud', x: 428, y: 52, r: 36 },
      { id: 'bunga', label: 'Missing red flower', x: 182, y: 352, r: 28 },
      { id: 'ekor', label: 'Cat tail', x: 492, y: 318, r: 30 },
      { id: 'burung', label: 'Third bird', x: 398, y: 88, r: 26 },
      { id: 'kupu', label: 'Butterfly', x: 244, y: 316, r: 26 },
      { id: 'bantal', label: 'Bench cushion', x: 348, y: 252, r: 30 },
    ],
  },
  {
    id: 'beach',
    title: 'Level 2 — Sunset Beach',
    subtitle: 'A beach at sunset. Busier, and harder.',
    scene: 'beach',
    diffs: [
      { id: 'layar', label: 'Boat sail', x: 384, y: 186, r: 34 },
      { id: 'kelapa', label: 'Third coconut', x: 108, y: 168, r: 26 },
      { id: 'payung', label: 'Umbrella colors', x: 300, y: 238, r: 40 },
      { id: 'ember', label: 'Red bucket', x: 182, y: 332, r: 28 },
      { id: 'bintang', label: 'Starfish', x: 432, y: 342, r: 28 },
      { id: 'camar', label: 'Third seagull', x: 452, y: 76, r: 26 },
      { id: 'jejak', label: 'Footprints', x: 268, y: 352, r: 34 },
    ],
  },
  {
    id: 'cafe',
    title: 'Level 3 — Afternoon Café',
    subtitle: 'A cozy café in the afternoon. The subtlest differences.',
    scene: 'cafe',
    diffs: [
      { id: 'burungJendela', label: 'Bird at the window', x: 150, y: 110, r: 26 },
      { id: 'lampu', label: 'Lamp switched on', x: 300, y: 74, r: 34 },
      { id: 'sendok', label: 'Coffee spoon', x: 296, y: 292, r: 26 },
      { id: 'ceri', label: 'Cherry on the cake', x: 384, y: 238, r: 26 },
      { id: 'bungaTanaman', label: 'Flower on the plant', x: 516, y: 232, r: 28 },
      { id: 'poster', label: 'Poster picture', x: 474, y: 116, r: 34 },
      { id: 'ekorKucing', label: 'Sleeping cat tail', x: 168, y: 322, r: 30 },
    ],
  },
];

export const SHOT_NAMES = ['start', 'play', 'end'];
