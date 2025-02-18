/* eslint-disable @typescript-eslint/no-explicit-any */
import Global from './Audio'
import Synth from './Synth'
import EnvGen from './EnvGen'
import { inject } from 'vue'

export default class Oscillator extends OscillatorNode {
  synth: Synth
  frequencyValue: number
  frequencyOffset: number

  // volumeNode: GainNode
  velocityNode: GainNode
  gainNode: GainNode
  lowPassFilter: BiquadFilterNode
  eg: any

  constructor(synth: Synth) {
    super(Global.CONTEXT)

    this.synth = synth

    this.frequencyValue = 0
    this.frequencyOffset = 0

    this.velocityNode = Global.CONTEXT.createGain()
    this.velocityNode.gain.value = 1
    this.velocityNode.connect(synth.inputNode)

    this.gainNode = Global.CONTEXT.createGain()
    this.gainNode.gain.value = 0
    this.gainNode.connect(this.velocityNode)

    this.lowPassFilter = Global.CONTEXT.createBiquadFilter()
    this.lowPassFilter.type = 'lowpass'
    this.lowPassFilter.frequency.setTargetAtTime(2000, Global.CONTEXT.currentTime, 0)
    this.lowPassFilter.connect(this.gainNode)

    this.connect(this.lowPassFilter)

    if (!!this.synth.periodicWave && !Global.WAVE_TYPES.includes(synth.type)) {
      this.setPeriodicWave(this.synth.periodicWave)
    } else {
      this.type = (synth.type as OscillatorType) ?? 'sine'
    }

    this.eg = new EnvGen(Global.CONTEXT, this.gainNode.gain)

    this.eg.mode = 'ADSR'
    this.eg.attackTime = synth.attack
    this.eg.releaseTime = synth.release
    this.eg.decayTime = synth.decay
    this.eg.sustainLevel = synth.sustain
  }

  semitonesToFrequencyOffset(semitones: number) {
    return this.frequencyValue * (Math.pow(2, semitones / 12) - 1)
  }

  setFrequency(frequency?: number) {
    if (frequency == undefined) {
      frequency = this.frequencyValue
    } else {
      this.frequencyValue = frequency
    }

    if (!!this.synth.midiDevice) {
      this.frequencyOffset = this.semitonesToFrequencyOffset(this.synth.midiDevice.pitchBend)
    }

    this.frequency.value = frequency + this.frequencyOffset
  }

  startNote(frequency?: number, volume?: number) {
    this.velocityNode.gain.value = volume ?? 1
    this.setFrequency(frequency)
    this.start()
  }

  attack(frequency?: number, volume?: number) {
    this.velocityNode.gain.value = volume ?? 1
    this.setFrequency(frequency)
    this.eg.gateOn()
    this.start()
  }

  release() {
    this.eg.gateOff()

    // Magic number currently, otherwise synth stops before release fully plays out
    const stopDelay = this.synth.release > 0.005 ? this.synth.release * 5 : 0.01
    this.stop(Global.CONTEXT.currentTime + stopDelay)
  }
}
