import { useInstrumentsStore } from '@/stores/instruments'
import Synth from './Synth'
import { ref, type Ref } from 'vue'

export default class Global {
  static _CONTEXT: AudioContext

  public static get CONTEXT() {
    Global.suspended.value = Global._CONTEXT.state === 'suspended'
    return Global._CONTEXT
  }

  public static set CONTEXT(context: AudioContext) {
    Global._CONTEXT = context
  }

  static MASTER: ChannelMergerNode

  static volumeNode: GainNode
  static suspended: Ref<boolean> = ref(false)

  static NOTES: { [key: string]: Array<number> } = {
    C: [16.35, 32.7, 65.41, 130.81, 261.63, 523.25, 1046.5, 2093.0, 4186.01],
    Db: [17.32, 34.65, 69.3, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92],
    D: [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.64],
    Eb: [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03],
    E: [20.6, 41.2, 82.41, 164.81, 329.63, 659.26, 1318.51, 2637.02],
    F: [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
    Gb: [23.12, 46.25, 92.5, 185.0, 369.99, 739.99, 1479.98, 2959.96],
    G: [24.5, 49.0, 98.0, 196.0, 392.0, 783.99, 1567.98, 3135.96],
    Ab: [25.96, 51.91, 103.83, 207.65, 415.3, 830.61, 1661.22, 3322.44],
    A: [27.5, 55.0, 110.0, 220.0, 440.0, 880.0, 1760.0, 3520.0],
    Bb: [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
    B: [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07],
  }

  static WAVE_TYPES: Array<string> = ['sine', 'sawtooth', 'triangle']

  static initialize(audioContext: AudioContext) {
    Global.CONTEXT = audioContext

    Global.volumeNode = Global.CONTEXT.createGain()
    Global.volumeNode.connect(Global.CONTEXT.destination)
    Global.volumeNode.gain.value = 0.3

    Global.MASTER = Global.CONTEXT.createChannelMerger(1)
    Global.MASTER.connect(Global.volumeNode)

    const presets = useInstrumentsStore()
    presets.fetchPresets()
  }

  static updateContextState() {
    Global.suspended.value = Global.CONTEXT.state === 'suspended'
  }

  static getNoteFromMIDI(note: number) {
    return Object.keys(Global.NOTES)[note % 12]
  }

  // static getFrequency(note: string, octave: number): number {
  //   return Global.NOTES[note]?.[octave]
  // }

  static getFrequency(note: string | number, octave: number | string): number {
    if (typeof octave != 'number') octave = parseInt(octave)

    let frequency: number = 0
    if (typeof note == 'number') {
      frequency = note
    } else {
      if (octave != undefined && !isNaN(octave)) {
        frequency = Global.NOTES[note]?.[octave]
      }
    }

    return frequency
  }

  static getKeyElemAttributes(key?: Element | null) {
    const note = key?.getAttribute('data-note')
    const octave = key?.getAttribute('data-octave')

    if (key == undefined || note == undefined || octave == undefined) return {}

    return {
      note: note,
      octave: octave,
    }
  }

  static generateImpulseReponse(duration: number, decay: number, reverse: boolean) {
    const sampleRate = Global.CONTEXT.sampleRate
    const length = sampleRate * duration
    const impulse = Global.CONTEXT.createBuffer(2, length, sampleRate)
    const impulseL = impulse.getChannelData(0)
    const impulseR = impulse.getChannelData(1)

    if (!decay) decay = 2.0
    for (let i = 0; i < length; i++) {
      const n = reverse ? length - i : i
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay)
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay)
    }
    return impulse
  }

  static mapToRange(
    value: number,
    inputMin: number,
    inputMax: number,
    outputMin: number,
    outputMax: number,
  ): number {
    return ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin) + outputMin
  }
}
