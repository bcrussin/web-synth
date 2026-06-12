import type Synth from './Synth'
import { SynthParam } from './SynthParameters'

export interface EnvelopeOptions {
	attack?: number
	attackCurve?: number
	decay?: number
	decayCurve?: number
	sustain?: number
	release?: number
	releaseCurve?: number
}

interface EnvelopeSegment {
	startTime: number
	startValue: number
	targetValue: number
	duration: number
}

const Defaults: Record<keyof EnvelopeOptions, number> = {
	attack: 0,
	attackCurve: 1,
	decay: 0,
	decayCurve: 1,
	sustain: 1,
	release: 0.01,
	releaseCurve: 1,
}

export function getSynthEnvelope(synth: Synth) {
	return new Envelope({
		attack: synth.params.get(SynthParam.Attack).value,
		attackCurve: synth.params.get(SynthParam.AttackCurve).value,
		decay: synth.params.get(SynthParam.Decay).value,
		decayCurve: synth.params.get(SynthParam.DecayCurve).value,
		sustain: synth.params.get(SynthParam.Sustain).value,
		release: synth.params.get(SynthParam.Release).value,
		releaseCurve: synth.params.get(SynthParam.ReleaseCurve).value,
	})
}

export default class Envelope {
	attack: number
	attackCurve: number
	decay: number
	decayCurve: number
	sustain: number
	release: number
	releaseCurve: number

	constructor(options: EnvelopeOptions) {
		this.attack = options.attack ?? Defaults.attack
		this.attackCurve = options.attackCurve ?? Defaults.attackCurve
		this.decay = options.decay ?? Defaults.decay
		this.decayCurve = options.decayCurve ?? Defaults.decayCurve
		this.sustain = options.sustain ?? Defaults.sustain
		this.release = options.release ?? Defaults.release
		this.releaseCurve = options.releaseCurve ?? Defaults.releaseCurve
	}
}
