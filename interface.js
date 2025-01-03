const KEYS_CONTAINER = document.getElementById("synth-keys");
const NUM_OCTAVES = 2;

let currNote;

window.onload = () => {
  KEYS_CONTAINER.innerHTML = "";
  for (let i = 1; i <= NUM_OCTAVES + 1; i++) {
    Object.keys(NOTES).forEach((note, j) => {
      let key = addKey(note, i);
      if (note.includes("b")) key.style.zIndex = 100;
    });
  }

  setOctave(3);
};

function addKey(note, octave) {
  const key = document.createElement("div");
  key.classList.add("key");
  if (note.includes("b")) key.classList.add("black");

  key.id = note + octave;

  key.addEventListener("mousedown", (e) => {
    e.preventDefault();
    console.log(currNote, note);
    currNote?.stop();
    currNote = playTone(getFrequency(note, octave + globalOctave));
  });

  key.addEventListener("mouseover", (e) => {
    if (e.buttons == 1 || e.buttons == 3) {
      currNote?.stop();
      currNote = playTone(getFrequency(note, octave + globalOctave));
    }
  });

  //key.addEventListener("mouseup", () => stopNote(note, octave));

  KEYS_CONTAINER.appendChild(key);

  return key;
}

document.addEventListener("mouseup", () => currNote?.stop());
