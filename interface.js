const KEYS_CONTAINER = document.getElementById("synth-keys");

const OCTAVE_TEXT = document.getElementById("octave");
const VOLUME_SLIDER = document.getElementById("volume");
const NUM_OCTAVES = 2;

const mouseSynth = new Synth({ mono: true });

window.onload = () => {
  KEYS_CONTAINER.innerHTML = "";
  for (let i = 1; i <= NUM_OCTAVES + 1; i++) {
    Object.keys(Audio.NOTES).forEach((note, j) => {
      let key = addKey(note, i);
      if (note.includes("b")) key.style.zIndex = 100;
    });
  }

  setOctave(3);

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
    mouseSynth.playNote(note, octave + Global.octave);
  });

  key.addEventListener("mouseover", (e) => {
    if (e.buttons == 1 || e.buttons == 3) {
      mouseSynth.playNote(note, octave + Global.octave);
    }
  });

  KEYS_CONTAINER.appendChild(key);

  return key;
}

document.addEventListener("mouseup", () => mouseSynth.stopAll());

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
