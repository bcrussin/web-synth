import Synth from '@/classes/Synth.ts'
import { useKeybindsStore, type KeybindNotes } from '@/stores/keybindsStore'
import type { Store } from 'pinia'
import Global from './Audio'

export default class Keyboard {
	static synth: Synth

	static keybindsStore: ReturnType<typeof useKeybindsStore>

	// static NOTE_BINDINGS: { [key: string]: [string, number] } = {
	//   // Bottom Row
	//   Z: ['C', 4],
	//   S: ['Db', 4],
	//   X: ['D', 4],
	//   D: ['Eb', 4],
	//   C: ['E', 4],
	//   V: ['F', 4],
	//   G: ['Gb', 4],
	//   B: ['G', 4],
	//   H: ['Ab', 4],
	//   N: ['A', 4],
	//   J: ['Bb', 4],
	//   M: ['B', 4],
	//   ',': ['C', 5],
	//   L: ['Db', 5],
	//   '.': ['D', 5],
	//   ';': ['Eb', 5],
	//   '/': ['E', 5],

	//   // Top Row
	//   Q: ['C', 5],
	//   2: ['Db', 5],
	//   W: ['D', 5],
	//   3: ['Eb', 5],
	//   E: ['E', 5],
	//   R: ['F', 5],
	//   5: ['Gb', 5],
	//   T: ['G', 5],
	//   6: ['Ab', 5],
	//   Y: ['A', 5],
	//   7: ['Bb', 5],
	//   U: ['B', 5],
	//   I: ['C', 6],
	//   9: ['Db', 6],
	//   O: ['D', 6],
	//   0: ['Eb', 6],
	//   P: ['E', 6],
	//   '[': ['F', 6],
	// }

	static noteBindings: KeybindNotes = {}

	static pressed: {
		[key: string]: number
	} = {}

	static assignSynth(synth: Synth) {
		Keyboard.synth = synth
	}

	static keyToNote(key: string) {
		return Keyboard.noteBindings[key]
	}

	static initialize() {
		Keyboard.keybindsStore = useKeybindsStore()
		Keyboard.keybindsStore.fetchPresets().then((presets) => {
			this.noteBindings = presets.default.notes
		})

		Keyboard.synth = new Synth({ name: 'Keyboard' })

		document.addEventListener('keydown', (e) => {
			this.keyDown(e)
		})

		document.addEventListener('keyup', (e) => {
			this.keyUp(e)
		})
	}

	static keyDown(e: KeyboardEvent) {
		if (document.activeElement instanceof HTMLInputElement) return

		if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return

		switch (e.key) {
			case '[':
				Keyboard.synth.changeTranspose(-1)
				// Keyboard.synth.stopAll()
				return
			case ']':
				Keyboard.synth.changeTranspose(1)
				// Keyboard.synth.stopAll()
				return
		}

		const key = Keyboard.keyToNote(e.key.toUpperCase())
		if (e.repeat || key == undefined) return

		const freq = Keyboard.synth.playNote(key[0], key[1])
		if (!!freq) this.pressed[e.key] = freq

		e.preventDefault()
	}

	static keyUp(e: KeyboardEvent) {
		if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return

		const key = Keyboard.keyToNote(e.key.toUpperCase())
		if (e.repeat || key == undefined) return

		if (!!this.pressed[e.key] && !!Keyboard.synth.notes.has(this.pressed[e.key])) {
			Keyboard.synth.stopFrequency(this.pressed[e.key])
		} else {
			Keyboard.synth.stopNote(key[0], key[1])
		}

		e.preventDefault()
	}
}
