/* eslint-disable @typescript-eslint/no-explicit-any */
import Synth, { type SynthOptions } from './Synth'
import Global from './Audio'
import { useMidiStore, type MIDIParam } from '@/stores/midiStore'
import { reactive } from 'vue'

interface SynthParams {
  [synthName: string]: {
    [channel: number]: string
  }
}

export default class MidiDevice {
  static DEVICES: { [key: string]: MidiDevice } = {}
  static DEFAULTS = {
    velocityCurve: 1,
  }

  static STORE: any

  input: MIDIInput
  synths: Synth[]
  globalParams: any
  synthParams: SynthParams
  pitchBend: number
  velocityCurve: number | null = null

  constructor(input: MIDIInput) {
    this.input = input
    this.synths = [new Synth({ name: input?.name ?? undefined, midiDevice: this })]
    this.pitchBend = 0
    this.synthParams = reactive({})
  }

  static async initialize() {
    this.STORE = useMidiStore()
    await this.STORE.fetchParams()

    MidiDevice.requestDevices()
  }

  static requestDevices() {
    if (typeof navigator.requestMIDIAccess != 'function') return
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
          this.synths.forEach((synth) =>
            synth.playNote(noteLetter, octave, MidiDevice.mapToRange(velocity, 0, 127, 0, 1)),
          )
        } else {
          this.synths.forEach((synth) => synth.stopNote(noteLetter, octave))
        }
        break
      case 128: // noteOff
        this.synths.forEach((synth) => synth.stopNote(noteLetter, octave))
        break
    }

    if (command >= 224 && command <= 239) {
      this.pitchBend = MidiDevice.mapToRange(note + velocity * 128, 0, 16383, -2, 2)
      this.synths.forEach((synth) => synth.updateFrequencies())
    }

    if (command == 176) {
      Object.entries(this.synthParams).forEach(([synthName, channels]: [any, any]) => {
        if (!!channels[note]) {
          const param = channels[note]
          this.modifyParam(param, velocity / 127, Synth.getSynth(synthName))
        }
      })
    }
  }

  mapVelocityToCurve(velocity: number) {
    const curve = this.velocityCurve ?? MidiDevice.DEFAULTS.velocityCurve

    const velocityMapped = 127 * Math.pow(velocity / 127, curve)
    return velocityMapped
  }

  addSynth(synth: Synth | string) {
    if (typeof synth === 'string') synth = Synth.getSynth(synth)

    if (synth == undefined) return

    this.synths.push(synth)
  }

  removeSynth(name: string): void {
    this.synths = this.synths.filter((synth) => synth.name != name)
  }

  setChannelParam(channel: number, param: string, synth: Synth) {
    if (this.synthParams[synth.name] == undefined) {
      this.synthParams[synth.name] = {}
    }

    if (!!param) this.synthParams[synth.name][channel] = param
    else delete this.synthParams[synth.name][channel]
  }

  modifyParam(paramName: any | string, percent: number, synth?: Synth) {
    let param: MIDIParam

    if (typeof paramName === 'string') param = MidiDevice.STORE.getParam(paramName)
    else param = paramName

    const value = percent * param.max + param.min

    switch (param.type) {
      case 'synth':
        if (!!synth) {
          ;(synth as any)[param.property] = value
        } else {
          this.synths.forEach((synth: any) => (synth[param.property] = value))
        }
        break
    }
  }

  resolve(path: string | string[], obj = self, separator = '.') {
    const properties = Array.isArray(path) ? path : path.split(separator)
    return properties.reduce((prev: any, curr: any) => prev?.[curr], obj)
  }
}
