const KEYS_CONTAINER = document.getElementById("synth-keys");

const OCTAVE_TEXT = document.getElementById("octave");
const VOLUME_SLIDER = document.getElementById("volume");
const NUM_OCTAVES = 2;

const mouseSynth = new Synth({ mono: true });

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
      updateWaveType();
    });
  });
  updateWaveType();
};

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
