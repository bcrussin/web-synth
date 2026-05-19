import { reactive } from 'vue'
import { defineStore } from 'pinia'
import type MidiChannel from '@/classes/MidiChannel'
import type Synth from '@/classes/Synth'
import type MidiDevice from '@/classes/MidiDevice'

export const getAudioStore = () => {
	return useAudioStore()
}

export const useAudioStore = defineStore('audio', {
	state: () => ({
		synths: {} as Record<UUID, Synth>,

		midiDevices: {} as { [key: string]: MidiDevice },

		midiChannelsByDevice: new Map<string, Map<UUID, Set<MidiChannel>>>(),
		midiChannelsBySynth: new Map<UUID, Set<MidiChannel>>(),
		globalMidiChannels: new Map<string, Set<MidiChannel>>(),
	}),

	getters: {
		getSynth: (state) => (id: UUID) => state.synths[id],
		getMidiDevice: (state) => (id: string) => reactive(state.midiDevices[id]),
		getMidiDeviceByName: (state) => (name: string) =>
			Object.values(state.midiDevices).find((device) => device.name == name),
		getMidiChannelsForSynth: (state) => {
			return (synthId: UUID): MidiChannel[] => {
				return Array.from(state.midiChannelsBySynth.get(synthId) ?? [])
			}
		},
		getGlobalChannels: (state) => {
			return (device: MidiDevice): Set<MidiChannel> | undefined => {
				return state.globalMidiChannels.get(device.name)
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
	},
})
