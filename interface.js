const KEYS_CONTAINER = document.getElementById("synth-keys");

const OCTAVE_TEXT = document.getElementById("octave");
const VOLUME_SLIDER = document.getElementById("volume");
const NUM_OCTAVES = 2;

const mouseSynth = new Synth({ name: "Mouse" });

KEY_WIDTH = 30;
window.onload = () => {
  initializeKeys();

  setOctave(0);

  document.querySelectorAll('input[name="wave-type"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      setWaveType();
    });
  });
  setWaveType();
};

window.addEventListener("resize", () => initializeKeys());

function initializeKeys() {
  KEYS_CONTAINER.innerHTML = "";
  let maxNotes = Math.floor(window.innerWidth / KEY_WIDTH) - 3;

  let octaveStart = 4 - Math.floor(NUM_OCTAVES / 2);
  let counter = 0;
  for (let i = octaveStart; i <= NUM_OCTAVES + octaveStart; i++) {
    Object.keys(Audio.NOTES).forEach((note, j) => {
      if (counter >= maxNotes) return;

      let key = addKey(note, i);
      if (note.includes("b")) key.style.zIndex = 100;
      else counter++; // only include white notes in total width calculation
    });
  }
}

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
    button.classList.add("synth-button");
    button.innerHTML = name;
    button.onclick = () => showSynthSettings(name);
    container.appendChild(button);

    synth.indicatorElement = button;
  });
}

function updateWavetableSize(size) {
  wavetableSize = size;
  currentWavetableGraph?.resizeWavetable(size);
  document.getElementById("wavetable-size").value = size;
}

const WAVE_TYPES = ["sine", "sawtooth", "triangle"];
let presets;
fetch("presets.json").then((response) => {
  response.json().then((jsonResponse) => {
    presets = jsonResponse;

    Object.entries(presets.instruments).forEach(([name, data]) => {
      const option = document.createElement("option");
      option.value = name;
      option.text = data.displayName;
      document.getElementById("wavetable-presets").appendChild(option);
    });
  });
});

function setWaveType(type) {
  if (currentSynth == undefined) return;

  Synth.SYNTHS[currentSynth].type = type;
  if (type != "custom" && !WAVE_TYPES.includes(type.toLowerCase())) {
    loadPreset(type);
  }

  document.getElementById("wavetable-presets").value =
    Synth.SYNTHS[currentSynth].type;

  if (type == "custom")
    Synth.getSynth(currentSynth).setWavetable(currentWavetableGraph.wavetable);

  document.getElementById("wavetable-graph").style.opacity =
    WAVE_TYPES.includes(type) ? 0.5 : 1;
}

function loadPreset(presetName) {
  let preset = presets.instruments[presetName];
  let synth = Synth.SYNTHS[currentSynth];

  synth.type = presetName;
  currentWavetableGraph.setWavetable(preset.wavetable);
  document.getElementById("wavetable-size").value = preset.wavetable.length;
  setSynthProperty("attack", preset.attack);
  setSynthProperty("decay", preset.decay);
  setSynthProperty("sustain", preset.sustain);
  setSynthProperty("release", preset.release);
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

  document.getElementById("wavetable-presets").value = synth.type;
  document.getElementById("wavetable-graph").style.opacity =
    WAVE_TYPES.includes(synth.type) ? 0.5 : 1;
}

function closeSynthSettings() {
  document.getElementById("synth-settings").close();
  currentSynth = null;
}

function setSynthProperty(property, value) {
  value = parseFloat(value);
  if (currentSynth == undefined || isNaN(value)) return;
  Synth.SYNTHS[currentSynth][property] = value;

  let elem = document.getElementById("synth-" + property);
  if (!!elem) elem.value = value;
}
/* _______________ */

function addKey(note, octave) {
  const key = document.createElement("div");
  key.classList.add("key");
  if (note.includes("b")) key.classList.add("black");

  key.id = note + octave;
  key.style.width = KEY_WIDTH + "px";

  key.addEventListener("mousedown", (e) => {
    e.preventDefault();
    playPianoNote(note, octave);
  });

  key.addEventListener("mouseover", (e) => {
    if (e.buttons == 1 || e.buttons == 3) {
      playPianoNote(note, octave);
    }
  });

  key.addEventListener("mouseout", (e) => {
    if (e.buttons == 1 || e.buttons == 3) {
      stopPianoNote(note, octave);
    }
  });

  KEYS_CONTAINER.appendChild(key);

  return key;
}

function playPianoNote(note, octave) {
  octave = parseInt(octave);
  mouseSynth.playNote(note, octave + Global.octave);
}

function stopPianoNote(note, octave) {
  octave = parseInt(octave);
  mouseSynth.stopNote(note, octave + Global.octave);
}

document.addEventListener("mouseup", () => {
  mouseSynth.stopAll();
});

const touchedKeys = {};

document.addEventListener("touchend", (e) => {
  let loc = e.changedTouches[0];
  let elem = document.elementFromPoint(loc.clientX, loc.clientY);
  if (elem == undefined || !elem.classList.contains("key")) return;

  delete touchedKeys[elem.id];

  let [note, octave] = getNoteAndOctaveFromId(elem.id);
  stopPianoNote(note, octave);
});

document.addEventListener(
  "touchstart",
  (e) => {
    let loc = e.changedTouches[0];
    let elem = document.elementFromPoint(loc.clientX, loc.clientY);
    if (elem == undefined || !elem.classList.contains("key")) return;

    touchedKeys[elem.id] = elem;

    let [note, octave] = getNoteAndOctaveFromId(elem.id);
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

    Object.keys(touchedKeys).forEach((key) => {
      if (
        !Object.values(e.touches).some(
          (touch) =>
            document.elementFromPoint(touch.clientX, touch.clientY).id == key
        )
      ) {
        let [keyNote, keyOctave] = getNoteAndOctaveFromId(key);
        stopPianoNote(keyNote, keyOctave);
        delete touchedKeys[key];
      }
    });

    if (elem == undefined || !elem.classList.contains("key")) return;

    touchedKeys[elem.id] = elem;
    let [note, octave] = getNoteAndOctaveFromId(elem.id);
    playPianoNote(note, octave);
  },
  { passive: false }
);

document.addEventListener("contextmenu", (e) => e.preventDefault(), {
  passive: false,
});

function getNoteAndOctaveFromId(id) {
  let note = id.slice(0, -1);
  let octave = id.slice(-1);

  return [note, octave];
}

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
