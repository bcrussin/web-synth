import MidiChannel, { type SerializedMidiChannel } from './MidiChannel'
import MidiDevice from './MidiDevice'
import MidiManager from './MidiManager'
import type Synth from './Synth'
import { loadTunaEffect } from './TunaDeserializers'
import { serializeTunaEffect } from './TunaSerializers'

export enum SynthSerializerCategory {
	WAVEFORM,
	EFFECTS,
	MIDI,
	SETTINGS,
}

export const CATEGORY_NAMES = {
	[SynthSerializerCategory.WAVEFORM]: 'Waveform',
	[SynthSerializerCategory.EFFECTS]: 'Effects',
	[SynthSerializerCategory.MIDI]: 'MIDI',
	[SynthSerializerCategory.SETTINGS]: 'Settings',
}

export interface SerializedSynth {
	waveform?: {
		attack?: number
		decay?: number
		sustain?: number
		release?: number
		preset?: string | undefined
		wavetable?: Array<number> | null
	}
	effects?: any[]
	midi?: SerializedMidiChannel[]
	settings?: any
}

export class SynthSerializer {
	static serialize(synth: Synth, categories?: SynthSerializerCategory[]) {
		const cateogoriesAreDefined = !!categories

		const data: SerializedSynth = {
			waveform: {},
			effects: [],
			midi: [],
			settings: {},
		}

		if (!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.WAVEFORM)) {
			data.waveform = {
				attack: synth.attack,
				decay: synth.decay,
				sustain: synth.sustain,
				release: synth.release,
				preset: synth.preset,
				wavetable: synth.wavetable,
			}
		}

		if (!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.EFFECTS)) {
			data.effects = synth.effects.map((effect) => serializeTunaEffect(effect)) as any
		}

		if (!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.MIDI)) {
			data.midi = MidiManager.getChannelsForSynth(synth).map((channel) => channel.serialize())
		}

		return data
	}

	static load(synth: Synth, data: SerializedSynth, categories?: SynthSerializerCategory[]) {
		const cateogoriesAreDefined = !!categories

		if (!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.WAVEFORM)) {
			synth.attack = data.waveform?.attack ?? synth.attack
			synth.decay = data.waveform?.decay ?? synth.decay
			synth.sustain = data.waveform?.sustain ?? synth.sustain
			synth.release = data.waveform?.release ?? synth.release

			if (data.waveform?.wavetable) {
				synth.setWavetable(data.waveform.wavetable)
			}

			if (data.waveform?.preset) {
				synth.setPreset(data.waveform.preset)
			}
		}

		if (
			!!data.effects &&
			(!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.EFFECTS))
		) {
			synth.effects = data.effects
				.map((effectData: any) => {
					const effect = loadTunaEffect(synth.tuna, effectData)
					if (!!effect) return effect
				})
				.filter((effect) => !!effect)
		}

		if (
			!!data.midi &&
			(!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.MIDI))
		) {
			data.midi.forEach((channelData) => {
				if (!!channelData.options) {
					channelData.options.synth = synth
				}

				const channel = new MidiChannel(MidiDevice.DEVICES[channelData.device], channelData.options)
				MidiManager.registerChannel(channel)
			})
		}
	}

	static getCategoryName(category: SynthSerializerCategory): string {
		return CATEGORY_NAMES?.[category] ?? ''
	}
}
