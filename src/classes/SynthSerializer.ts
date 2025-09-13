import MidiChannel, { type SerializedMidiChannel, type MidiChannelOptions } from './MidiChannel'
import MidiDevice from './MidiDevice'
import MidiManager from './MidiManager'
import type Synth from './Synth'
import { loadTunaEffect } from './TunaDeserializers'
import { serializeTunaEffect } from './TunaSerializers'

// Used to prevent accidental mutation of saved data
type DeepReadonly<T> = {
	readonly [P in keyof T]: DeepReadonly<T[P]>
}

export enum SynthSerializerCategory {
	WAVEFORM = 'waveform',
	EFFECTS = 'effects',
	MIDI = 'midi',
	SETTINGS = 'settings',
}

export const CATEGORY_NAMES = {
	[SynthSerializerCategory.WAVEFORM]: 'Waveform',
	[SynthSerializerCategory.EFFECTS]: 'Effects',
	[SynthSerializerCategory.MIDI]: 'MIDI',
	[SynthSerializerCategory.SETTINGS]: 'Settings',
}

export interface SerializedSynth {
	[SynthSerializerCategory.WAVEFORM]?: {
		attack?: number
		decay?: number
		sustain?: number
		release?: number
		preset?: string | undefined
		type?: string
		wavetable?: Array<number> | null
	}
	[SynthSerializerCategory.EFFECTS]?: any[]
	[SynthSerializerCategory.MIDI]?: SerializedMidiChannel[]
	[SynthSerializerCategory.SETTINGS]?: {
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

		const data: SerializedSynth = {}

		if (!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.WAVEFORM)) {
			data[SynthSerializerCategory.WAVEFORM] = {
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
			data[SynthSerializerCategory.EFFECTS] = synth.effects.map((effect) =>
				serializeTunaEffect(effect),
			) as any
		}

		if (!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.MIDI)) {
			data[SynthSerializerCategory.MIDI] = MidiManager.getChannelsForSynth(synth).map((channel) =>
				channel.serialize(),
			)
		}

		if (!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.SETTINGS)) {
			data[SynthSerializerCategory.SETTINGS] = {
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
			const waveformData = data[SynthSerializerCategory.WAVEFORM]

			synth.attack = waveformData?.attack ?? synth.attack
			synth.decay = waveformData?.decay ?? synth.decay
			synth.sustain = waveformData?.sustain ?? synth.sustain
			synth.release = waveformData?.release ?? synth.release
			synth.type = waveformData?.type ?? synth.type

			if (!!waveformData?.wavetable) {
				synth.setWavetable(waveformData.wavetable)
			}

			if (!!waveformData?.preset) {
				synth.setPreset(waveformData.preset)
			}
		}

		if (
			!!data[SynthSerializerCategory.EFFECTS] &&
			(!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.EFFECTS))
		) {
			synth.effects = data[SynthSerializerCategory.EFFECTS]
				.map((effectData: any) => {
					const effect = loadTunaEffect(synth.tuna, effectData)
					if (!!effect) return effect
				})
				.filter((effect) => !!effect)

			synth.updateEffectNodes()
		}

		if (
			!!data[SynthSerializerCategory.MIDI] &&
			(!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.MIDI))
		) {
			MidiManager.getChannelsForSynth(synth).forEach((channel) => {
				MidiManager.unregisterChannel(channel)
			})

			data[SynthSerializerCategory.MIDI].forEach((channelData) => {
				if (!MidiDevice.DEVICES[channelData.device]) return

				let options: MidiChannelOptions = { ...channelData.options, synth }

				const channel = new MidiChannel(MidiDevice.DEVICES[channelData.device], options)
				MidiManager.registerChannel(channel)
			})
		}

		if (
			!!data[SynthSerializerCategory.SETTINGS] &&
			(!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.SETTINGS))
		) {
			const settingsData = data[SynthSerializerCategory.SETTINGS]

			synth.volume = settingsData?.volume ?? synth.volume
			synth.transpose = settingsData?.transpose ?? synth.transpose
			synth.maxPolyphony = settingsData?.maxPolyphony ?? synth.maxPolyphony
			synth.legato = settingsData?.legato ?? synth.legato
			synth.glide = settingsData?.glide ?? synth.glide
			synth.glideAmount = settingsData?.glideAmount ?? synth.glideAmount
		}
	}

	static getCategoryName(category: SynthSerializerCategory): string {
		return CATEGORY_NAMES?.[category] ?? ''
	}

	static getPresetCategoryNames(preset: SerializedSynth) {
		if (!preset || typeof preset !== 'object') {
			return []
		}

		const categoryNames = (Object.keys(preset) as SynthSerializerCategory[]).map((key) =>
			SynthSerializer.getCategoryName(key),
		)
		return categoryNames.filter((category) => !!category)
	}

	static getPresetCategories(preset: SerializedSynth) {
		if (!preset || typeof preset !== 'object') {
			return []
		}

		const categories = Object.keys(preset).filter((key: any) =>
			Object.values(SynthSerializerCategory).includes(key),
		)
		return categories
	}
}
