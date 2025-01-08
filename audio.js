class Global {
  static octave = 3;
  static noteBindings = {};

  static keyToNote(key) {
    return Global.noteBindings[key];
  }
}

Global.noteBindings = {
  // Bottom Row
  Z: ["C", 4],
  S: ["Db", 4],
  X: ["D", 4],
  D: ["Eb", 4],
  C: ["E", 4],
  V: ["F", 4],
  G: ["Gb", 4],
  B: ["G", 4],
  H: ["Ab", 4],
  N: ["A", 4],
  J: ["Bb", 4],
  M: ["B", 4],
  ",": ["C", 5],
  L: ["Db", 5],
  ".": ["D", 5],
  ";": ["Eb", 5],
  "/": ["E", 5],

  // Top Row
  Q: ["C", 5],
  2: ["Db", 5],
  W: ["D", 5],
  3: ["Eb", 5],
  E: ["E", 5],
  R: ["F", 5],
  5: ["Gb", 5],
  T: ["G", 5],
  6: ["Ab", 5],
  Y: ["A", 5],
  7: ["Bb", 5],
  U: ["B", 5],
  I: ["C", 6],
  9: ["Db", 6],
  O: ["D", 6],
  0: ["Eb", 6],
  P: ["E", 6],
  "[": ["F", 6],
};

const AUDIO_CONTEXT = new AudioContext();
let oscillators = {};
let GLOBAL_GAIN = null;
GLOBAL_GAIN = AUDIO_CONTEXT.createGain();
GLOBAL_GAIN.connect(AUDIO_CONTEXT.destination);
setVolume(localStorage.getItem("masterVolume") ?? 30);

let MASTER_CHANNEL = AUDIO_CONTEXT.createChannelMerger(1);
MASTER_CHANNEL.connect(GLOBAL_GAIN);

let synth = new Synth();

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;

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
  if (!!synth && typeof synth !== "undefined") synth.type = selected.value;
  if (!!mouseSynth && typeof mouseSynth !== "undefined")
    mouseSynth.type = selected.value;
  Object.values(MidiDevice.DEVICES).forEach((device) => {
    device.synth.type = selected.value;
  });
}

function setMono(mono) {
  synth.setMono(mono);
  MONO_CHECKBOX.checked = mono;
}

function setVolume(volume) {
  GLOBAL_GAIN.gain.value = volume / 200;
  VOLUME_SLIDER.value = volume;
  localStorage.setItem("masterVolume", volume);
}

function setAttack(value) {
  value = Math.max(0.001, parseFloat(value));

  synth.attack = value;
  mouseSynth.attack = value;
  Object.values(MidiDevice.DEVICES).forEach((device) => {
    device.synth.attack = value;
  });
  document.getElementById("attack").value = value;
}

function setRelease(value) {
  value = Math.max(0.005, parseFloat(value));

  synth.release = value;
  mouseSynth.release = value;
  Object.values(MidiDevice.DEVICES).forEach((device) => {
    device.synth.release = value;
  });
  document.getElementById("release").value = value;
}
