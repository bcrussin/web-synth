class Audio {
  static NOTES = {
    C: [16.35, 32.7, 65.41, 130.81, 261.63, 523.25, 1046.5, 2093.0, 4186.01],
    Db: [17.32, 34.65, 69.3, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92],
    D: [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.64],
    Eb: [
      19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03,
    ],
    E: [20.6, 41.2, 82.41, 164.81, 329.63, 659.26, 1318.51, 2637.02],
    F: [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
    Gb: [23.12, 46.25, 92.5, 185.0, 369.99, 739.99, 1479.98, 2959.96],
    G: [24.5, 49.0, 98.0, 196.0, 392.0, 783.99, 1567.98, 3135.96],
    Ab: [25.96, 51.91, 103.83, 207.65, 415.3, 830.61, 1661.22, 3322.44],
    A: [27.5, 55.0, 110.0, 220.0, 440.0, 880.0, 1760.0, 3520.0],
    Bb: [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
    B: [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07],
  };

  static getFrequency(note, octave) {
    return Audio.NOTES[note]?.[octave];
  }

  static getNoteOrFrequency(note, octave) {
    let frequency = note;
    if (octave != undefined) {
      frequency = Audio.getFrequency(note, octave);
    }

    return frequency;
  }
}

// TODO: change `mono` to an integer polyphony value, add dynamic/static property for # of oscillators
class Synth {
  constructor(options) {
    options = options ?? {};

    this.type = options.type;
    this.volume = options.volume ?? 50;

    this.setMono(options.mono ?? false);
  }

  setMono(isMono) {
    this.stopAll();

    this.mono = isMono;

    if (this.mono) this.oscillators = null;
    else this.oscillators = {};
  }

  isNotePlaying(frequency) {
    return !this.mono && !!this.oscillators[frequency];
  }

  getOscillator(frequency) {
    if (this.mono) return this.oscillators;

    return this.oscillators?.[frequency];
  }

  playNote(note, octave) {
    let frequency = Audio.getNoteOrFrequency(note, octave);

    if (frequency == undefined || this.isNotePlaying(frequency)) return;

    let oscillator;
    if (this.mono && !!this.oscillators) {
      oscillator = this.oscillators;
      oscillator.setFrequency(frequency);
    } else {
      oscillator = new Oscillator(this);
      oscillator.startNote(frequency);

      if (this.mono) this.oscillators = oscillator;
      else this.oscillators[frequency] = oscillator;
    }
  }

  stopNote(note, octave) {
    let frequency = Audio.getNoteOrFrequency(note, octave);
    let oscillator = this.getOscillator(frequency);

    if (frequency == undefined || oscillator == undefined) return;

    oscillator.stop();
    if (this.mono) this.oscillators = null;
    else delete this.oscillators[frequency];
  }

  stopAll() {
    if (this.mono) {
      this.oscillators?.stop();
      this.oscillators = null;
      return;
    }

    if (this.oscillators != undefined)
      Object.values(this.oscillators).forEach((note) => note.stop());
    this.oscillators = {};
  }
}

class Oscillator extends OscillatorNode {
  constructor(synth) {
    super(AUDIO_CONTEXT);

    this.synth = synth;
    this.gainNode = AUDIO_CONTEXT.createGain();
    this.gainNode.connect(MASTER_CHANNEL);
    this.connect(this.gainNode);

    this.type = synth.type ?? "sine";
  }

  setFrequency(frequency) {
    this.frequency.value = frequency;
  }

  startNote(frequency) {
    this.setFrequency(frequency);
    this.start();
  }
}
