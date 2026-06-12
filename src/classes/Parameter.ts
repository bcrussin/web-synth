import type { SynthParam } from './SynthParameters'

export interface ParameterOptions {
	id: SynthParam
	displayName: string
	baseValue: number
	min: number
	max: number
	step?: number

	get?: (value: number) => number
	set?: (value: number) => number
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
	displayName: string
	min: number
	max: number
	step?: number

	get?: (value: number) => number
	set?: (value: number) => number

	private _baseValue!: number
	get baseValue() {
		if (this.get) return this.get(this._baseValue)
		return this._baseValue
	}
	set baseValue(baseValue: number) {
		this.setValue(baseValue)
	}

	// TODO: Assign LFO to the object (either direct props or a separate class)

	private _value!: number
	get value() {
		if (this.get) return this.get(this._value)
		return this._value
	}
	set value(baseValue: number) {
		this.setValue(baseValue)
	}

	private listeners = new Set<Listener>()

	constructor(options: ParameterOptions) {
		this.id = options.id
		this.displayName = options.displayName

		this.min = options.min
		this.max = options.max

		this.step = options.step

		this.get = options.get
		this.set = options.set
		this.setValue(options.baseValue)
	}

	isMin() {
		return this.value === this.min
	}

	isMax() {
		return this.value === this.max
	}

	setValue(value: number) {
		if (this.set) {
			this._baseValue = this.set(value)
		} else {
			this._baseValue = value
		}

		this._value = this._baseValue // TODO: Check whether this can be removed when LFO support added

		for (const listener of this.listeners) {
			listener(value)
		}
	}

	subscribe(listener: Listener, initial: boolean = false) {
		this.listeners.add(listener)

		if (initial) listener(this.value)

		return () => this.listeners.delete(listener)
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
