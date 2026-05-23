import initSynthParameters from '@/utilities/initSynthParameters'
import type { ParameterOptions, SerializedParameter } from './Parameter'
import Parameter from './Parameter'
import type { SerialisedSynthParams } from './SynthSerializer'
import type Synth from './Synth'

export enum SynthParam {
	Attack = 'attack',
	Sustain = 'sustain',
	Decay = 'decay',
	Release = 'release',
	TransposeSemitones = 'transposeSemitones',
	TransposeOctaves = 'transposeOctaves',
}

export default class SynthParameters {
	params: Map<SynthParam, Parameter>
	readonly synth: Synth

	constructor(synth: Synth) {
		this.synth = synth
		this.params = new Map<SynthParam, Parameter>()
		initSynthParameters(synth, this)
	}

	register(options: ParameterOptions) {
		const param = new Parameter(options)
		this.params.set(param.id, param)
	}

	get(id: SynthParam) {
		return this.params.get(id)!
	}

	set(id: SynthParam, value: number) {
		const p = this.params.get(id)
		if (!p) return
		p.value = value
	}

	all() {
		return this.params.values()
	}

	serialize() {
		const data: SerialisedSynthParams = {}
		this.params.forEach((parameter) => {
			data[parameter.id] = parameter.serialize()
		})

		return data
	}

	deserialize(data?: SerialisedSynthParams) {
		console.log(data)
		this.params.forEach((parameter) => {
			parameter.deserialize(data?.[parameter.id])
		})
	}
}
