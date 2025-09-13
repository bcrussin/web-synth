import { reactive } from 'vue'
import { defineStore } from 'pinia'
import type { SerializedSynth, SynthSerializer } from '@/classes/SynthSerializer'

export const useSynthStore = defineStore('synth', {
	state: () => ({
		synths: {} as {
			[key: string]: SerializedSynth
		},
	}),

	actions: {
		getSynth(name: string) {
			return this.synths[name]
		},
		saveSynth(name: string, data: SerializedSynth) {
			this.synths[name] = data
			console.log(this.synths)
			// console.log(JSON.stringify(this.synths))
			debugStringify(this.synths)
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

function debugStringify(obj: any) {
	const seen = new WeakSet()

	return JSON.stringify(
		obj,
		function (key, value) {
			if (typeof value === 'object' && value !== null) {
				if (seen.has(value)) {
					console.warn('Circular reference found at key:', key, 'in parent:', this)
					return '[Circular]'
				}
				seen.add(value)
			}
			return value
		},
		2,
	)
}
