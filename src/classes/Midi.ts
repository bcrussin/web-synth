import Synth, { type SynthOptions } from './Synth'
import Global from './Audio'

export default class MidiDevice {
  static DEVICES: { [key: string]: MidiDevice } = {}
  static DEFAULTS = {
    velocityCurve: 1,
  }

  input: MIDIInput
  synth: Synth
  pitchBend: number
  velocityCurve: number | null = null

  constructor(input: MIDIInput) {
    this.input = input
    this.synth = new Synth({ name: input?.name ?? undefined, midiDevice: this })
    this.pitchBend = 0
  }

  static requestDevices() {
    navigator.requestMIDIAccess().then(MidiDevice.success, MidiDevice.failure)
  }

  static success(midiAccess: MIDIAccess) {
    midiAccess.inputs.forEach((input) => {
      const device = new MidiDevice(input)
      MidiDevice.DEVICES[input.id] = device

      device.startCapturing()
    })

    // Temporary until UI is overhauled
    // setWaveType()
  }

  static failure(event: DOMException) {
    console.error(`Failed to get MIDI access - ${event.message}`)
  }

  static mapToRange(
    value: number,
    in_min: number,
    in_max: number,
    out_min: number,
    out_max: number,
  ) {
    return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
  }

  startCapturing() {
    this.input.onmidimessage = (event) => this.getMessage(event)
  }

  stopCapturing() {
    this.input.onmidimessage = null
  }

  getMessage(message: MIDIMessageEvent) {
    if (message?.data == undefined) return

    const command = message.data[0]
    const note = message.data[1]
    let velocity = message.data.length > 2 ? message.data[2] : 0

    const noteLetter = Global.getNoteFromMIDI(note)
    const octave = Math.floor(note / 12) - 1

    switch (command) {
      case 144: // noteOn
        if (velocity > 0) {
          velocity = this.mapVelocityToCurve(velocity)
          this.synth.playNote(noteLetter, octave, MidiDevice.mapToRange(velocity, 0, 127, 0, 1))
        } else {
          this.synth.stopNote(noteLetter, octave)
        }
        break
      case 128: // noteOff
        this.synth.stopNote(noteLetter, octave)
        break
    }

    if (command >= 224 && command <= 239) {
      this.pitchBend = MidiDevice.mapToRange(note + velocity * 128, 0, 16383, -2, 2)
      this.synth.updateFrequencies()
    }
  }

  mapVelocityToCurve(velocity: number) {
    const curve = this.velocityCurve ?? MidiDevice.DEFAULTS.velocityCurve

    const velocityMapped = 127 * Math.pow(velocity / 127, curve)
    return velocityMapped
  }
}
