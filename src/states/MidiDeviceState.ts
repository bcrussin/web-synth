import type MidiChannel from '@/classes/MidiChannel'
import type MidiDevice from '@/classes/MidiDevice'

interface SynthChannelParams {
	[synthId: UUID]: {
		[channel: number]: MidiChannel
	}
}

export default class MidiDeviceState {
	device: MidiDevice

	synthIds: Set<UUID>

	channelValues: number[]
	channelSettings: SynthChannelParams
	pitchBend: number
	velocityCurve: number | null = null

	constructor(midiDevice: MidiDevice) {
		this.device = midiDevice

		this.pitchBend = 0
		this.channelValues = new Array(16).fill(0)
		this.channelSettings = {}

		this.synthIds = new Set()
	}
}
