import type MidiDevice from './MidiDevice'
import type Synth from './Synth'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface MidiChannelOptions {
	channelNumber: number
	param?: string
	min?: number
	max?: number
	inverted?: boolean
	synth?: Synth
}

export interface SerializedMidiChannel {
	device: string
	deviceName: string
	options: Omit<MidiChannelOptions, 'synth'>
}

export interface SynthMap {
	[name: string]: Synth
}

export default class MidiChannel {
	param: string
	min: number
	max: number
	inverted: boolean

	device: MidiDevice
	synths: SynthMap = {}
	isGlobal: boolean = false
	channelNumber: number

	get synth() {
		return Object.values(this.synths)[0]
	}

	constructor(device: MidiDevice, options?: MidiChannelOptions) {
		this.device = device
		this.channelNumber = options?.channelNumber ?? 1

		if (!!options?.synth) {
			this.synths[options.synth.name] = options.synth
		}

		this.param = options?.param ?? ''
		this.min = options?.min ?? 0
		this.max = options?.max ?? 1
		this.inverted = options?.inverted ?? false
	}

	getProperty(property: keyof MidiChannelOptions) {
		return (this as any)[property]
	}

	setProperty<K extends keyof MidiChannelOptions>(property: K, value: MidiChannelOptions[K]) {
		;(this as any)[property] = value
	}

	setProperties(data: MidiChannelOptions) {
		Object.entries(data).forEach(([key, value]) => {
			;(this as any)[key] = value
		})
	}

	serialize(): SerializedMidiChannel {
		return {
			device: this.device.id,
			deviceName: this.device.name,
			options: {
				channelNumber: this.channelNumber,
				param: this.param,
				min: this.min,
				max: this.max,
				inverted: this.inverted,
			},
		}
	}
}
