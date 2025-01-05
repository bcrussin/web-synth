let MIDI;

function onMIDISuccess(midiAccess) {
  console.log("MIDI ready!");
  MIDI = midiAccess; // store in the global (in real usage, would probably keep in an object instance)
  startLoggingMIDIInput(MIDI);
}

function onMIDIFailure(msg) {
  console.error(`Failed to get MIDI access - ${msg}`);
}

navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

function onMIDIMessage(event) {
  let str = `MIDI message received at timestamp ${event.timeStamp}[${event.data.length} bytes]: `;
  for (const character of event.data) {
    str += `0x${character.toString(16)} `;
  }
  getMIDIMessage(event);
}

function startLoggingMIDIInput(midiAccess) {
  console.log(midiAccess.inputs);
  midiAccess.inputs.forEach((entry) => {
    entry.onmidimessage = onMIDIMessage;
  });
}

function getMIDIMessage(message) {
  if (message?.data == undefined) return;

  var command = message.data[0];
  var note = message.data[1];
  var velocity = message.data.length > 2 ? message.data[2] : 0;

  let noteLetter = Audio.getNoteFromMIDI(note);
  let octave = Math.floor(note / 12) - 1;

  switch (command) {
    case 144: // noteOn
      if (velocity > 0) {
        synth.playNote(noteLetter, octave, velocity.map(0, 127, 0, 1));
      } else {
        synth.stopNote(noteLetter, octave);
      }
      break;
    case 128: // noteOff
      synth.playNote(noteLetter, octave);
      break;
  }
}
