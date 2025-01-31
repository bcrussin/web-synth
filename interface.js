const KEYS_CONTAINER = document.getElementById("synth-keys");

const OCTAVE_TEXT = document.getElementById("octave");
const VOLUME_SLIDER = document.getElementById("volume");
const NUM_OCTAVES = 2;

const mouseSynth = new Synth({ name: "Mouse", mono: true });

window.onload = () => {
  KEYS_CONTAINER.innerHTML = "";
  let octaveStart = 4 - Math.floor(NUM_OCTAVES / 2);
  for (let i = octaveStart; i <= NUM_OCTAVES + octaveStart; i++) {
    Object.keys(Audio.NOTES).forEach((note, j) => {
      let key = addKey(note, i);
      if (note.includes("b")) key.style.zIndex = 100;
    });
  }

  setOctave(0);

  document.querySelectorAll('input[name="wave-type"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      setWaveType();
    });
  });
  setWaveType();
};

/* SETTINGS DIALOG */
let currentSynth;
let currentWavetableGraph;
let wavetableSize = 0;
updateWavetableSize(16);

function updateSynthsList() {
  const container = document.getElementById("synths-list");
  container.innerHTML = "";

  console.log("_____________________");
  console.log(Synth.SYNTHS);
  Object.entries(Synth.SYNTHS).forEach(([name, synth]) => {
    const button = document.createElement("button");
    button.innerHTML = name;
    button.onclick = () => showSynthSettings(name);
    container.appendChild(button);
  });
}

function updateWavetableSize(size) {
  wavetableSize = size;
  currentWavetableGraph?.resizeWavetable(size);
  document.getElementById("wavetable-size").value = size;
}

function showSynthSettings(name) {
  let synth = Synth.SYNTHS[name];
  if (synth == undefined) return;
  currentSynth = name;
  currentWavetableGraph = new WavetableGraph(synth, 16, "wavetable-graph");

  const dialog = document.getElementById("synth-settings");
  dialog.showModal();

  document.getElementById("synth-name").textContent = name;
  document.getElementById("synth-attack").value = synth.attack;
  document.getElementById("synth-decay").value = synth.decay;
  document.getElementById("synth-sustain").value = synth.sustain;
  document.getElementById("synth-release").value = synth.release;
}

function closeSynthSettings() {
  document.getElementById("synth-settings").close();
  currentSynth = null;
}

function setSynthProperty(property, value) {
  value = parseFloat(value);
  if (currentSynth == undefined || isNaN(value)) return;
  Synth.SYNTHS[currentSynth][property] = value;
}
/* _______________ */

function addKey(note, octave) {
  const key = document.createElement("div");
  key.classList.add("key");
  if (note.includes("b")) key.classList.add("black");

  key.id = note + octave;

  key.addEventListener("mousedown", (e) => {
    e.preventDefault();
    playPianoNote(note, octave);
  });

  key.addEventListener("mouseover", (e) => {
    if (e.buttons == 1 || e.buttons == 3) {
      playPianoNote(note, octave);
    }
  });

  KEYS_CONTAINER.appendChild(key);

  return key;
}

function playPianoNote(note, octave) {
  octave = parseInt(octave);
  mouseSynth.playNote(note, octave + Global.octave);
}

document.addEventListener("mouseup", () => {
  mouseSynth.stopAll();
});

document.addEventListener("touchend", (e) => {
  mouseSynth.stopAll();
});

document.addEventListener(
  "touchstart",
  (e) => {
    let loc = e.changedTouches[0];
    let elem = document.elementFromPoint(loc.clientX, loc.clientY);
    let note = elem.id.slice(0, -1);
    let octave = elem.id.slice(-1);
    playPianoNote(note, octave);

    if (elem.classList.contains("key")) {
      e.preventDefault();
    }
  },
  { passive: false }
);

document.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    let loc = e.changedTouches[0];
    let elem = document.elementFromPoint(loc.clientX, loc.clientY);
    let note = elem.id.slice(0, -1);
    let octave = elem.id.slice(-1);
    playPianoNote(note, octave);
  },
  { passive: false }
);

document.addEventListener("contextmenu", (e) => e.preventDefault(), {
  passive: false,
});

function setOctave(octave) {
  Global.octave = octave;
  OCTAVE_TEXT.textContent = Global.octave;
}

function changeOctave(delta) {
  setOctave(Global.octave + delta);
}

function setVolume(volume) {
  GLOBAL_GAIN.gain.value = volume / 200;
  VOLUME_SLIDER.value = volume;
  localStorage.setItem("masterVolume", volume);
}
