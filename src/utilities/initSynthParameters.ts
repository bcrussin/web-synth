import type Synth from '@/classes/Synth'
import SynthParameters, { SynthParam } from '@/classes/SynthParameters'

export default function initSynthParameters(synth: Synth, params: SynthParameters) {
	params.register({
		id: SynthParam.Attack,
		displayName: 'Synth Attack',
		baseValue: 1,
		min: 1,
		max: 1000,
		step: 10,
	})
	params.register({
		id: SynthParam.AttackCurve,
		displayName: 'Synth Attack Curve',
		baseValue: 1,
		min: 0.1,
		max: 5,
		step: 0.1,
	})
	params.register({
		id: SynthParam.Decay,
		displayName: 'Synth Decay',
		baseValue: 1,
		min: 1,
		max: 1000,
		step: 10,
	})
	params.register({
		id: SynthParam.DecayCurve,
		displayName: 'Synth Decay Curve',
		baseValue: 1,
		min: 0.1,
		max: 5,
		step: 0.1,
	})
	params.register({
		id: SynthParam.Sustain,
		displayName: 'Synth Sustain',
		baseValue: 1,
		min: 0,
		max: 1,
	})
	params.register({
		id: SynthParam.Release,
		displayName: 'Synth Release',
		baseValue: 1,
		min: 1,
		max: 1000,
		step: 10,
	})
	params.register({
		id: SynthParam.ReleaseCurve,
		displayName: 'Synth Release Curve',
		baseValue: 1,
		min: 0.1,
		max: 5,
		step: 0.1,
	})

	params.register({
		id: SynthParam.TransposeSemitones,
		displayName: 'Synth Transpose (Semitones)',
		baseValue: 0,
		min: -32,
		max: 32,
		step: 1,

		get: () => {
			let n = synth.state.transpose % 12

			if (n > 11) n -= 12
			if (n < -11) n += 12
			return n
		},
		set: (value) => {
			const extraOctaves = Math.floor(value / 12)
			value = ((value % 12) + 12) % 12
			if (value > 11) value -= 12

			synth.state.transpose = (synth.state.octaves + extraOctaves) * 12 + value
			return value
		},
	})
	params.register({
		id: SynthParam.TransposeOctaves,
		displayName: 'Synth Transpose (Octaves)',
		baseValue: 0,
		min: -32,
		max: 32,
		step: 1,

		get: () => {
			let semitones = synth.state.transpose % 12

			if (semitones > 0) return Math.floor(synth.state.transpose / 12)
			else return Math.ceil(synth.state.transpose / 12)
		},
		set: (value) => {
			let semitones = synth.state.transpose % 12

			synth.state.transpose = value * 12 + semitones
			return value
		},
	})
}
