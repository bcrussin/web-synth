/* eslint-disable @typescript-eslint/no-explicit-any */
import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

export const useInstrumentsStore = defineStore('instruments', {
	state: () => ({
		instruments: {} as any,
	}),

	actions: {
		getInstrument(instrument: string): any {
			return this.instruments[instrument]
		},
		async fetchPresets() {
			fetch(`${import.meta.env.BASE_URL}data/presets/instruments.json`).then((response) =>
				response.json().then((jsonResponse) => {
					this.instruments = reactive(jsonResponse.instruments) as any
				}),
			)
		},
	},
})
