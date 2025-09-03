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
		type?: string
		wavetable?: Array<number> | null
	}
	effects?: any[]
	midi?: SerializedMidiChannel[]
	settings?: {
		transpose?: number
		volume?: number
		maxPolyphony?: number
		legato?: boolean
		glide?: boolean
		glideAmount?: number
	}
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
				type: synth.type,
			}

			if (!!synth.preset) data.waveform.preset = synth.preset
			if (synth.type === 'custom' && !!synth.wavetable) data.waveform.wavetable = synth.wavetable
		}

		if (!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.EFFECTS)) {
			data.effects = synth.effects.map((effect) => serializeTunaEffect(effect)) as any
		}

		if (!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.MIDI)) {
			data.midi = MidiManager.getChannelsForSynth(synth).map((channel) => channel.serialize())
		}

		if (!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.MIDI)) {
			data.settings = {
				volume: synth.volume,
				transpose: synth.transpose,
				maxPolyphony: synth.maxPolyphony,
				legato: synth.legato,
				glide: synth.glide,
				glideAmount: synth.glideAmount,
			}
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
			synth.type = data.waveform?.type ?? synth.type

			if (!!data.waveform?.wavetable) {
				synth.setWavetable(data.waveform.wavetable)
			}

			if (!!data.waveform?.preset) {
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

			synth.updateEffectNodes()
		}

		if (
			!!data.midi &&
			(!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.MIDI))
		) {
			MidiManager.getChannelsForSynth(synth).forEach((channel) => {
				MidiManager.unregisterChannel(channel)
			})

			data.midi.forEach((channelData) => {
				if (!MidiDevice.DEVICES[channelData.device]) return

				if (!!channelData.options) {
					channelData.options.synth = synth
				}

				const channel = new MidiChannel(MidiDevice.DEVICES[channelData.device], channelData.options)
				MidiManager.registerChannel(channel)
			})
		}

		if (
			!!data.midi &&
			(!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.SETTINGS))
		) {
			synth.volume = data.settings?.volume ?? synth.volume
			synth.transpose = data.settings?.transpose ?? synth.transpose
			synth.maxPolyphony = data.settings?.maxPolyphony ?? synth.maxPolyphony
			synth.legato = data.settings?.legato ?? synth.legato
			synth.glide = data.settings?.glide ?? synth.glide
			synth.glideAmount = data.settings?.glideAmount ?? synth.glideAmount
		}
	}

	static getCategoryName(category: SynthSerializerCategory): string {
		return CATEGORY_NAMES?.[category] ?? ''
	}
}
