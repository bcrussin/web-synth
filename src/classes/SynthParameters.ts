import type { ParameterOptions, SerializedParameter } from './Parameter'
import Parameter from './Parameter'
import type { SerialisedSynthParams } from './SynthSerializer'

export enum SynthParam {
	Attack = 'attack',
	Sustain = 'sustain',
	Decay = 'decay',
	Release = 'release',
}

export default class SynthParameters {
	params = new Map<SynthParam, Parameter>()

	constructor() {
		this.initDefaults()
	}

	initDefaults() {
		this.register({ id: SynthParam.Attack, baseValue: 0.005, min: 0.001, max: 0.5 })
		this.register({ id: SynthParam.Decay, baseValue: 0.01, min: 0, max: 1 })
		this.register({ id: SynthParam.Sustain, baseValue: 1, min: 0, max: 1 })
		this.register({ id: SynthParam.Release, baseValue: 0.001, min: 0.001, max: 0.5 })
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
