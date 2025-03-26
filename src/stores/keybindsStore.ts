import { reactive } from 'vue'
import { defineStore } from 'pinia'

export interface KeybindPresetMap {
	[key: string]: KeybindPreset
}

export interface KeybindPreset {
	displayName: string
	notes: KeybindNotes
}

export interface KeybindNotes {
	[key: string]: [string, number]
}

export const useKeybindsStore = defineStore('keybinds', {
	state: () => ({
		presets: {} as KeybindPresetMap,
	}),

	actions: {
		getPreset(name: string) {
			return this.presets[name]
		},
		async fetchPresets() {
			const response = await fetch(`${import.meta.env.BASE_URL}data/presets/keybinds.json`)
			const jsonResponse = await response.json()
			this.presets = reactive(jsonResponse) as KeybindPresetMap

			return this.presets
		},
	},
})
