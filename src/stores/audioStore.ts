import { reactive, unref } from 'vue'
import { defineStore } from 'pinia'
import type Synth from '@/classes/Synth'
import type MidiDevice from '@/classes/MidiDevice'
import type { IMidiAssignment, MidiAssignmentFilters } from '@/classes/MidiAssignment'
import type MidiAssignment from '@/classes/MidiAssignment'

export const getAudioStore = () => {
	return useAudioStore()
}

export const useAudioStore = defineStore('audio', {
	state: () => ({
		synths: {} as Record<UUID, Synth>,

		midiDevices: {} as { [key: string]: MidiDevice },

		midiChannelsByDevice: new Map<string, Map<UUID, Set<IMidiAssignment>>>(),
		midiChannelsBySynth: new Map<UUID, Set<IMidiAssignment>>(),
		midiAssignments: new Map<UUID, IMidiAssignment>(),
		globalMidiChannels: new Map<string, Set<IMidiAssignment>>(),
	}),

	getters: {
		getSynth: (state) => (id: UUID) => state.synths[id],
		getMidiDevice: (state) => (id: string) => reactive(state.midiDevices[id]),
		getMidiDeviceByName: (state) => (name: string) =>
			Object.values(state.midiDevices).find((device) => device.name == name),
		getMidiChannelsForSynth: (state) => {
			return (synthId: UUID): IMidiAssignment[] => {
				return Array.from(state.midiChannelsBySynth.get(synthId) ?? [])
			}
		},
		getGlobalChannels: (state) => {
			return (device: MidiDevice): Set<IMidiAssignment> | undefined => {
				return state.globalMidiChannels.get(device.name)
			}
		},

		getMidiAssignments: (state) => {
			return (filters?: MidiAssignmentFilters): IMidiAssignment[] => {
				// console.log(unref([...state.midiAssignments.values()]), filters)
				return [...state.midiAssignments.values()].filter((assignment) => {
					if (filters?.deviceId && assignment.device.id !== filters.deviceId) return false
					if (filters?.synthId && assignment.synth.id !== filters.synthId) return false
					if (filters?.channel && assignment.channelNumber !== filters.channel) return false

					return true
				})
			}
		},
	},

	actions: {
		addSynth(synth: Synth) {
			this.synths[synth.id] = synth
		},
		removeSynth(id: UUID) {
			delete this.synths[id]
		},
		addMidiDevice(midiDevice: MidiDevice) {
			this.midiDevices[midiDevice.id] = reactive(midiDevice)
		},
		removeMidiDevice(id: string) {
			delete this.midiDevices[id]
		},
		addMidiAssignment(midiAssignment: MidiAssignment) {
			this.midiAssignments.set(midiAssignment.id, midiAssignment)
		},
		removeMidiAssignment(assignmentId: UUID) {
			this.midiAssignments.delete(assignmentId)
		},
	},
})
