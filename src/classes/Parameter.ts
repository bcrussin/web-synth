import type { SynthParam } from './SynthParameters'

export interface ParameterOptions {
	id: SynthParam
	baseValue: number
	min: number
	max: number
	step?: number
}

export interface SerializedParameter {
	id: SynthParam
	baseValue: number
	min: number
	max: number
	step?: number
}

export type ParameterMap = Record<string, Parameter>

type Listener = (value: number) => void

export default class Parameter {
	id: SynthParam
	min: number
	max: number
	step?: number

	private _baseValue!: number
	get baseValue() {
		return this._baseValue
	}
	set baseValue(baseValue: number) {
		this.setValue(baseValue)
	}

	// TODO: Assign LFO to the object (either direct props or a separate class)

	private _value!: number
	get value() {
		return this._value
	}
	set value(baseValue: number) {
		this.setValue(baseValue)
	}

	private listeners = new Set<Listener>()

	constructor(options: ParameterOptions) {
		this.id = options.id
		this.min = options.min
		this.max = options.max

		this.step = options.step

		this.setValue(options.baseValue)
	}

	subscribe(listener: Listener, initial: boolean = false) {
		this.listeners.add(listener)

		if (initial) listener(this.value)

		return () => this.listeners.delete(listener)
	}

	setValue(value: number) {
		this._baseValue = value
		this._value = value // TODO: Check whether this can be removed when LFO support added

		for (const listener of this.listeners) {
			listener(value)
		}
	}

	serialize() {
		return {
			id: this.id,
			baseValue: this.baseValue,
			min: this.min,
			max: this.max,
			step: this.step,
		}
	}

	deserialize(data?: SerializedParameter) {
		if (data == null) return

		this.id = data.id
		this.baseValue = data.baseValue
		this.min = data.min
		this.max = data.max
		this.step = data.step
	}
}
