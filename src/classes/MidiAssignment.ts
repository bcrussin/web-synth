import type { Reactive } from 'vue'
import type MidiDevice from './MidiDevice'
import type Synth from './Synth'
import type Parameter from './Parameter'
import type { SynthParam } from './SynthParameters'

export interface MidiAssignmentFields {
	channelNumber: number
	parameter: SynthParam
	outputMin?: number
	outputMax?: number
	inverted?: boolean
}

export interface MidiAssignmentOptions extends MidiAssignmentFields {
	synth: Synth
}

export interface MidiAssignmentFilters {
	deviceId?: string
	synthId?: UUID
	channel?: number
}

export interface SerializedMidiAssignment {
	device: string
	deviceName: string
	options: Omit<MidiAssignmentOptions, 'synth'>
}

export interface SynthMap {
	[name: string]: Synth
}

export type IMidiAssignment = MidiAssignment | Reactive<MidiAssignment>

export default class MidiAssignment {
	id: UUID = crypto.randomUUID()

	outputMin: number
	outputMax: number

	get outputMinMax() {
		return [this.outputMin, this.outputMax]
	}
	set outputMinMax(minMax: [number, number]) {
		this.outputMin = minMax[0]
		this.outputMax = minMax[1]
	}

	inverted: boolean
	parameter: SynthParam

	device: MidiDevice
	synth: Synth
	isGlobal: boolean = false
	channelNumber: number

	constructor(device: MidiDevice, options: MidiAssignmentOptions) {
		this.device = device
		this.channelNumber = options.channelNumber
		this.synth = options?.synth

		this.parameter = options.parameter
		this.outputMin = options?.outputMin ?? 0
		this.outputMax = options?.outputMax ?? 1
		this.inverted = options?.inverted ?? false
	}

	getProperty(property: keyof MidiAssignmentOptions) {
		return (this as any)[property]
	}

	setProperty<K extends keyof MidiAssignmentOptions>(property: K, value: MidiAssignmentOptions[K]) {
		;(this as any)[property] = value
	}

	setProperties(data: MidiAssignmentOptions) {
		Object.entries(data).forEach(([key, value]) => {
			;(this as any)[key] = value
		})
	}

	serialize(): SerializedMidiAssignment {
		return {
			device: this.device.id,
			deviceName: this.device.name,
			options: {
				channelNumber: this.channelNumber,
				parameter: this.parameter,
				outputMin: this.outputMin,
				outputMax: this.outputMax,
				inverted: this.inverted,
			},
		}
	}
}
