import { reactive } from 'vue'
import type Synth from '@/classes/Synth'
import { bindProp } from '@/utilities/bindProp'
import type { SynthParam } from '@/classes/SynthParameters'

export function useSynth(synth: Synth) {
	// const reactiveSynth = reactive(synth)

	return reactive(synth)

	// return {
	// 	id: bindProp(reactiveSynth, 'id'),
	// 	midiDevice: bindProp(reactiveSynth, 'midiDevice'),
	// 	name: bindProp(reactiveSynth, 'name'),
	// 	volume: bindProp(reactiveSynth, 'volume'),
	// 	type: bindProp(reactiveSynth, 'type'),
	// 	preset: bindProp(reactiveSynth, 'preset'),
	// 	parameters: reactive(Object.fromEntries(reactiveSynth.parameters.params)),

	// 	legato: bindProp(reactiveSynth, 'legato'),
	// 	maxPolyphony: bindProp(reactiveSynth, 'maxPolyphony'),
	// 	glide: bindProp(reactiveSynth, 'glide'),
	// 	glideAmount: bindProp(reactiveSynth, 'glideAmount'),
	// 	glideAmountMs: reactiveSynth.glideAmountMs,

	// 	notes: bindProp(reactiveSynth, 'notes'),
	// 	wavetable: bindProp(reactiveSynth, 'wavetable'),

	// 	transpose: bindProp(reactiveSynth, 'transpose'),
	// 	octaves: bindProp(reactiveSynth, 'octaves'),
	// 	semitones: bindProp(reactiveSynth, 'semitones'),

	// 	bypass: bindProp(reactiveSynth, 'bypass'),
	// 	signalLevel: bindProp(reactiveSynth, 'signalLevel'),
	// 	effects: bindProp(reactiveSynth, 'effects'),
	// }
}
