/* eslint-disable @typescript-eslint/no-explicit-any */
import Global from './Audio'
import Synth from './Synth'
import EnvGen from './EnvGen'
import { inject } from 'vue'

export default class Oscillator extends OscillatorNode {
	created: Date
	synth: Synth

	baseSemitone: number

	frequencyValue: number
	frequencyOffset: number

	// volumeNode: GainNode
	velocityNode: GainNode
	gainNode: GainNode
	lowPassFilter: BiquadFilterNode
	eg: any
	emptyEg: any

	constructor(synth: Synth) {
		super(Global.CONTEXT)

		this.created = new Date()
		this.synth = synth

		this.frequencyValue = 0
		this.frequencyOffset = 0

		this.baseSemitone = 0

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

		this.emptyEg = new EnvGen(Global.CONTEXT, this.gainNode.gain)
		this.emptyEg.mode = 'ASR'
		this.emptyEg.attackTime = 0.01
		this.emptyEg.releaseTime = 0.05
	}

	getEnv(empty: boolean = false) {
		if (empty) {
			return this.emptyEg
		}

		return this.eg
	}

	gateOff(): void {
		this.disconnect()
	}

	gateOn(): void {
		this.connect(this.gainNode)
	}

	envAttack(skipEnv: boolean = false): void {
		this.getEnv(skipEnv).gateOn()
	}

	envRelease(skipEnv: boolean = false): void {
		this.getEnv(skipEnv).gateOff()
	}

	semitonesToFrequencyOffset(semitones: number) {
		return this.frequencyValue * (Math.pow(2, semitones / 12) - 1)
	}

	setFrequencyValueAndOffset(frequency?: number) {
		if (frequency != undefined) {
			this.frequencyValue = frequency
		}

		if (!!this.synth.midiDevice) {
			this.frequencyOffset = this.semitonesToFrequencyOffset(this.synth.midiDevice.pitchBend)
		}
	}

	setSemitone(semitone?: number) {
		if (semitone != undefined) this.baseSemitone = semitone

		this.setFrequency(this.semitoneToFrequency(this.baseSemitone))
	}

	setFrequency(frequency?: number) {
		this.setFrequencyValueAndOffset(frequency)

		if (frequency == undefined) {
			frequency = this.frequencyValue
		}

		this.frequency.value = frequency + this.frequencyOffset
	}

	noteToFrequency(note: string, octave: number) {
		const transposed = Global.transposeNote(note, octave, this.synth.transpose)
		const frequency = Global.noteToFrequency(transposed.note, transposed.octave)

		return frequency
	}

	semitoneToFrequency(semitone: number) {
		const frequency = Global.semitoneToFrequency(semitone + this.synth.transpose)

		return frequency
	}

	glideToNote(semitone: number, duration: number) {
		this.baseSemitone = semitone

		this.glideToFrequency(this.semitoneToFrequency(semitone), duration)
	}

	glideToFrequency(frequency: number, duration: number) {
		this.setFrequencyValueAndOffset()

		this.frequency.setValueAtTime(this.frequency.value, Global.CONTEXT.currentTime)
		this.frequency.cancelScheduledValues(Global.CONTEXT.currentTime + 0.001)
		this.frequency.linearRampToValueAtTime(
			frequency + this.frequencyOffset,
			Global.CONTEXT.currentTime + duration,
		)
		this.frequencyValue = frequency
	}

	setVelocity(velocity: number) {
		this.velocityNode.gain.value = velocity
	}

	glideToVelocity(velocity: number, duration: number) {
		this.velocityNode.gain.setValueAtTime(this.velocityNode.gain.value, Global.CONTEXT.currentTime)
		this.velocityNode.gain.cancelScheduledValues(Global.CONTEXT.currentTime + 0.001)
		this.velocityNode.gain.linearRampToValueAtTime(velocity, Global.CONTEXT.currentTime + duration)
	}

	startNote(frequency?: number, volume?: number) {
		this.velocityNode.gain.value = volume ?? 1
		this.setFrequency(frequency)
		this.start()
	}

	attack(semitone: number, volume?: number) {
		this.baseSemitone = semitone

		this.velocityNode.gain.value = volume ?? 1

		this.setFrequency(this.semitoneToFrequency(semitone))
		this.envAttack()
		this.start()
	}

	release(stopNote: boolean = true) {
		this.envRelease()

		// Magic number currently, otherwise synth stops before release fully plays out
		const stopDelay = this.synth.release > 0.005 ? this.synth.release * 5 : 0.01
		this.stop(Global.CONTEXT.currentTime + stopDelay)
	}

	stopNote() {
		this.envRelease()
		this.stop()
	}
}
