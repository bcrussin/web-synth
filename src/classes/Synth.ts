/* eslint-disable @typescript-eslint/no-explicit-any */
import Global from '@/classes/Audio'
import Oscillator from '@/classes/Oscillator'
import { reactive, ref, type Ref } from 'vue'
import FFT from './FFT'
import Tuna, { type TunaAudioNode } from 'tunajs'

export interface SynthOptions {
  name?: string
  type?: string
  volume?: number
  attack?: number
  decay?: number
  sustain?: number
  release?: number
  midiDevice?: any
}

// TODO: change `mono` to an integer polyphony value, add dynamic/static property for # of oscillators
export default class Synth {
  static SYNTHS: Ref<{ [key: string]: Synth }> = ref({})

  midiDevice: any
  name: string
  type: string
  preset: string | undefined
  volume: number
  attack: number
  decay: number
  sustain: number
  release: number

  mono: boolean = false
  oscillators: { [key: number]: Oscillator } = reactive({})
  notes: Set<string> = reactive(new Set<string>())
  wavetable: Array<number> | null = null
  periodicWave: PeriodicWave | null = null

  inputNode: ChannelMergerNode
  outputNode: DynamicsCompressorNode
  tuna: Tuna
  effects: Tuna.TunaAudioNode[] = reactive([])

  constructor(options: SynthOptions = {}) {
    options = options ?? {}

    this.midiDevice = options?.midiDevice

    this.type = options.type ?? 'sine'
    this.volume = options.volume ?? 1

    this.attack = 0.001
    this.release = 0.05
    this.sustain = 1
    this.decay = 0.5

    this.tuna = new Tuna(Global.CONTEXT)

    this.inputNode = Global.CONTEXT.createChannelMerger(1)

    this.outputNode = Global.CONTEXT.createDynamicsCompressor()
    this.outputNode.threshold.setValueAtTime(-10, Global.CONTEXT.currentTime)
    this.outputNode.ratio.setValueAtTime(10, Global.CONTEXT.currentTime)
    this.outputNode.connect(Global.MASTER)

    this.updateEffectNodes()

    this.name = options.name ?? `Synth ${Object.keys(Synth.SYNTHS).length + 1}`
    Synth.SYNTHS.value[this.name] = this
    // updateSynthsList()
  }

  static getSynths(): { [key: string]: Synth } {
    return Synth.SYNTHS.value
  }

  static getSynth(name: string): Synth {
    return Synth.SYNTHS.value[name]
  }

  updateEffectNodes() {
    this.inputNode.disconnect()

    if (this.effects.length <= 0) {
      this.inputNode.connect(this.outputNode)
      return
    }

    this.effects.forEach((effect, index) => {
      if (index <= 0) this.inputNode.connect(effect)

      if (index >= this.effects.length - 1) effect.connect(this.outputNode)
      else effect.connect(this.effects[index + 1])
    })
  }

  getEffect(index: number): Tuna.TunaAudioNode {
    return this.effects?.[index]
  }

  addEffect(effect: string, options: any = {}) {
    options.bypass = false
    let effectNode

    switch (effect.toLowerCase()) {
      case 'reverb':
        options.wetLevel = options.wetLevel ?? 0.5
        effectNode = new this.tuna.Convolver(options)
        effectNode.convolver.buffer = Global.generateImpulseReponse(1, 1, false)
        break
      case 'chorus':
        effectNode = new this.tuna.Chorus(options)
        break
      case 'delay':
        options.wetLevel = options.wetLevel ?? 1
        options.delayTime = options.delayTime ?? 300
        effectNode = new this.tuna.Delay(options)
        break
      default:
        return
    }

    this.effects.push(effectNode)

    this.updateEffectNodes()
  }

  deleteEffect(index: number) {
    if (index < 0 || index >= this.effects.length) return

    // TODO: Properly disconnect/dispose effect
    this.effects[index].bypass = true
    this.effects.splice(index, 1)
    this.updateEffectNodes()
  }

  setEffectProperty(
    id: number,
    property: string,
    value: number,
    treatAsAudioParam: boolean = false,
  ) {
    const effect = this.effects[id] as Record<string, any>

    if (treatAsAudioParam) effect[property].value = value
    else effect[property] = value
  }

  setProperty(property: string, value: string | number): void {
    if (typeof value != 'number') value = parseFloat(value)
    if (isNaN(value)) return
    ;(this as any)[property] = value
  }

  getPresetOrType(): string {
    return this.preset ?? this.type
  }

  isPlaying(): boolean {
    return Object.keys(this.oscillators).length > 0
  }

  isNotePlaying(frequency: number): boolean {
    if (this.oscillators == undefined) return false
    return !!this.oscillators[frequency]
  }

  getOscillator(frequency: number) {
    return this.oscillators?.[frequency]
  }

  playNote(note: string, octave: number | string, volume?: number) {
    if (typeof octave != 'number') octave = parseInt(octave)
    const frequency = Global.getNoteOrFrequency(note, octave)

    if (frequency == undefined || this.isNotePlaying(frequency)) return

    const oscillator = new Oscillator(this)
    oscillator.attack(frequency, volume)
    this.oscillators[frequency] = oscillator
    this.notes.add(note + octave)

    // this.indicatorElement.classList.add('playing')
  }

  stopNote(note: string, octave: number | string) {
    const frequency = Global.getNoteOrFrequency(note, octave)
    const oscillator = this.getOscillator(frequency)

    if (frequency == undefined || oscillator == undefined) return

    // oscillator.stop();
    oscillator.release()
    delete this.oscillators[frequency]
    this.notes.delete(note + octave)

    // if (this.mono || Object.keys(this.oscillators).length <= 0)
    //   this.indicatorElement.classList.remove('playing')
  }

  stopAll() {
    if (this.oscillators != undefined)
      Object.entries(this.oscillators).forEach(([name, note]) => {
        note.release()
        delete this.oscillators[parseFloat(name)]
        // this.oscillators = {}
      })
    this.notes.clear()
  }

  updateFrequencies() {
    const oscillators = Object.values(this.oscillators)

    oscillators.forEach((oscillator) => oscillator.setFrequency())
  }

  setWaveType(type: string): void {
    this.preset = undefined

    if (this.type == type) return
    this.type = type
  }

  setPreset(preset?: string) {
    if (this.preset == preset) return

    this.type = 'custom'
    this.preset = preset ?? undefined
  }

  setWavetable(wavetable: Array<number>) {
    if (wavetable == undefined || wavetable.length <= 0) {
      wavetable = [0, 1]
      this.wavetable = new Array(16).fill(0)
    } else {
      this.wavetable = [...wavetable]
    }

    // Presets assume stretch value of 4
    const transformed = FFT(wavetable, 4)

    // Create a PeriodicWave
    this.periodicWave = Global.CONTEXT.createPeriodicWave(transformed.real, transformed.imag)
  }

  clearWavetable() {
    this.wavetable = null
    this.periodicWave = null
  }
}
