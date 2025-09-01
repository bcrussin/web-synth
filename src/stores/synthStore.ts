import { reactive } from 'vue'
import { defineStore } from 'pinia'
import type { SerializedSynth, SynthSerializer } from '@/classes/SynthSerializer'

export const useSynthStore = defineStore('synth', {
	state: () => ({
		synths: {} as {
			[key: string]: SynthSerializer
		},
	}),

	actions: {
		getSynth(name: string) {
			return this.synths[name]
		},
		saveSynth(name: string, data: SerializedSynth) {
			this.synths[name] = data
			localStorage.setItem('synths', JSON.stringify(this.synths))
		},
		fetchSynths() {
			const synths = localStorage.getItem('synths')

			if (!!synths) {
				this.synths = reactive(JSON.parse(synths))
			}

			return this.synths
		},
	},
})
