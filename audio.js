class Global {
  static octave = 3;
  static noteBindings = {};

  static keyToNote(key) {
    return Global.noteBindings[key];
  }
}

Global.noteBindings = {
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

const AUDIO_CONTEXT = new AudioContext();
let oscillators = {};
let GLOBAL_GAIN = null;
GLOBAL_GAIN = AUDIO_CONTEXT.createGain();
GLOBAL_GAIN.connect(AUDIO_CONTEXT.destination);
setVolume(localStorage.getItem("masterVolume") ?? 50);

let MASTER_CHANNEL = AUDIO_CONTEXT.createChannelMerger(1);
MASTER_CHANNEL.connect(GLOBAL_GAIN);

let synth = new Synth();
setAttack(0);
setRelease(0);

document.addEventListener("keydown", (e) => {
  let key = Global.keyToNote(e.key.toUpperCase());
  if (e.repeat || key == undefined) return;

  synth.playNote(key[0], key[1] + Global.octave);
  e.preventDefault();
});

document.addEventListener("keyup", (e) => {
  let key = Global.keyToNote(e.key.toUpperCase());
  if (key == undefined) return;

  synth.stopNote(key[0], key[1] + Global.octave);
  e.preventDefault();
});

function updateWaveType() {
  const selected = document.querySelector('input[name="wave-type"]:checked');
  synth.type = selected.value;
  mouseSynth.type = selected.value;
}

function setMono(mono) {
  synth.setMono(mono);
  MONO_CHECKBOX.checked = mono;
}

function setAttack(value) {
  synth.attack = Math.max(0.001, parseFloat(value));
  mouseSynth.attack = Math.max(0.001, parseFloat(value));
  document.getElementById("attack").value = value;
}

function setRelease(value) {
  synth.release = Math.max(0.001, parseFloat(value));
  mouseSynth.release = Math.max(0.001, parseFloat(value));
  document.getElementById("release").value = value;
}
