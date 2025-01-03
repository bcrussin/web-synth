const NOTES = {
  C: [16.35, 32.7, 65.41, 130.81, 261.63, 523.25, 1046.5, 2093.0, 4186.01],
  Db: [17.32, 34.65, 69.3, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92],
  D: [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.64],
  Eb: [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03],
  E: [20.6, 41.2, 82.41, 164.81, 329.63, 659.26, 1318.51, 2637.02],
  F: [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
  Gb: [23.12, 46.25, 92.5, 185.0, 369.99, 739.99, 1479.98, 2959.96],
  G: [24.5, 49.0, 98.0, 196.0, 392.0, 783.99, 1567.98, 3135.96],
  Ab: [25.96, 51.91, 103.83, 207.65, 415.3, 830.61, 1661.22, 3322.44],
  A: [27.5, 55.0, 110.0, 220.0, 440.0, 880.0, 1760.0, 3520.0],
  Bb: [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
  B: [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07],
};

const KEYS = {
  // Bottom Row
  Z: ["C", 1],
  S: ["Db", 1],
  X: ["D", 1],
  D: ["Eb", 1],
  C: ["E", 1],
  V: ["F", 1],
  G: ["Gb", 1],
  B: ["G", 1],
  H: ["Ab", 1],
  N: ["A", 1],
  J: ["Bb", 1],
  M: ["B", 1],
  ",": ["C", 2],
  L: ["Db", 2],
  ".": ["D", 2],
  ";": ["Eb", 2],
  "/": ["E", 2],

  // Top Row
  Q: ["C", 2],
  2: ["Db", 2],
  W: ["D", 2],
  3: ["Eb", 2],
  E: ["E", 2],
  R: ["F", 2],
  5: ["Gb", 2],
  T: ["G", 2],
  6: ["Ab", 2],
  Y: ["A", 2],
  7: ["Bb", 2],
  U: ["B", 2],
  I: ["C", 3],
  9: ["Db", 3],
  O: ["D", 3],
  0: ["Eb", 3],
  P: ["E", 3],
  "[": ["F", 3],
};

const OCTAVE_TEXT = document.getElementById("octave");

const audioContext = new AudioContext();
let oscillators = {};
let mainGainNode = null;
mainGainNode = audioContext.createGain();
mainGainNode.connect(audioContext.destination);
mainGainNode.gain.value = 0.1;

let globalOctave = 3;

function playTone(freq) {
  const osc = audioContext.createOscillator();
  osc.connect(mainGainNode);

  let type = document.querySelector('input[name="wave-type"]:checked').value;
  osc.type = type ?? "sine";

  osc.frequency.value = freq;
  osc.start();
  console.log(osc);
  return osc;
}

function getFrequency(note, octave) {
  return NOTES[note]?.[octave];
}

function playNote(note, octave) {
  if (note == undefined || octave == undefined) return;

  let noteOct = note + octave;
  console.log("playing " + noteOct);
  let freq = getFrequency(note, octave);

  console.log(oscillators[noteOct]);
  if (freq == undefined || !!oscillators[noteOct]) return;

  let oscillator = playTone(freq);
  oscillators[noteOct] = oscillator;

  return oscillator;
}

function stopNote(note, octave) {
  if (note == undefined || octave == undefined) return;

  let noteOct = note + octave;
  console.log("stopping " + noteOct);
  let oscillator = oscillators[noteOct];

  if (!!oscillator) {
    oscillator.stop();
    delete oscillators[noteOct];
  }

  return oscillator;
}

function stopAll() {
  Object.values(oscillators).forEach((oscillator) => oscillator.stop());
  oscillators = {};
}

document.addEventListener("keydown", (e) => {
  let key = KEYS[e.key.toUpperCase()];
  if (e.repeat || key == undefined) return;

  playNote(key[0], key[1] + globalOctave);
  e.preventDefault();
});

document.addEventListener("keyup", (e) => {
  let key = KEYS[e.key.toUpperCase()];
  if (key == undefined) return;

  stopNote(key[0], key[1] + globalOctave);
  e.preventDefault();
});

function setOctave(octave) {
  globalOctave = octave;
  OCTAVE_TEXT.textContent = globalOctave;
  stopAll();
}

function changeOctave(delta) {
  setOctave(globalOctave + delta);
}
