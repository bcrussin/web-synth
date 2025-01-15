class MidiDevice {
  static DEVICES = {};
  static DEFAULTS = {
    velocityCurve: 1,
  };

  constructor(input) {
    this.input = input;
    this.synth = new Synth({ midiDevice: this });
    this.pitchBend = 0;
  }

  static requestDevices() {
    navigator.requestMIDIAccess().then(MidiDevice.success, MidiDevice.failure);
  }

  static success(midiAccess) {
    midiAccess.inputs.forEach((input) => {
      let device = new MidiDevice(input);
      MidiDevice.DEVICES[input.id] = device;
      device.startCapturing();
    });

    // Temporary until UI is overhauled
    updateWaveType();
  }

  static failure(event) {
    console.error(`Failed to get MIDI access - ${msg}`);
  }

  startCapturing() {
    this.input.onmidimessage = (event) => this.getMessage(event);
  }

  stopCapturing() {
    this.input.onmidimessage = null;
  }

  getMessage(message) {
    if (message?.data == undefined) return;

    var command = message.data[0];
    var note = message.data[1];
    var velocity = message.data.length > 2 ? message.data[2] : 0;

    let noteLetter = Audio.getNoteFromMIDI(note);
    let octave = Math.floor(note / 12) - 1;

    switch (command) {
      case 144: // noteOn
        if (velocity > 0) {
          velocity = this.mapVelocityToCurve(velocity);
          this.synth.playNote(noteLetter, octave, velocity.map(0, 127, 0, 1));
        } else {
          this.synth.stopNote(noteLetter, octave);
        }
        break;
      case 128: // noteOff
        this.synth.playNote(noteLetter, octave);
        break;
    }

    if (command >= 224 && command <= 239) {
      this.pitchBend = (note + velocity * 128).map(0, 16383, -2, 2);
      this.synth.updateFrequencies();
    }
  }

  mapVelocityToCurve(velocity) {
    let curve = this.velocityCurve ?? MidiDevice.DEFAULTS.velocityCurve;

    let velocityMapped = 127 * Math.pow(velocity / 127, curve);
    return velocityMapped;
  }
}

// User input is needed for MIDI devices to work, show button for users to click
function detectMidiDevices() {
  MidiDevice.requestDevices();
}

MidiDevice.requestDevices();
