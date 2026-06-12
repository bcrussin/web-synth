import type MidiAssignment from '@/classes/MidiAssignment'
import type MidiDevice from '@/classes/MidiDevice'

interface SynthMidiAssignments {
	[synthId: UUID]: {
		[channel: number]: MidiAssignment
	}
}

export default class MidiDeviceState {
	device: MidiDevice

	synthIds: Set<UUID>

	midiAssignments: MidiAssignment[]

	channelValues: number[]
	pitchBend: number
	velocityCurve: number | null = null

	constructor(midiDevice: MidiDevice) {
		this.device = midiDevice

		this.pitchBend = 0
		this.channelValues = new Array(16).fill(0)
		this.midiAssignments = []

		this.synthIds = new Set()
	}
}
