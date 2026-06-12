import { getAudioStore } from '@/stores/audioStore'
import MidiChannel, {
	type SerializedMidiAssignment,
	type MidiAssignmentOptions,
} from './MidiAssignment'
import MidiDevice from './MidiDevice'
import MidiManager from './MidiManager'
import type { SerializedParameter } from './Parameter'
import type Synth from './Synth'
import { loadTunaEffect } from './TunaDeserializers'
import { serializeTunaEffect } from './TunaSerializers'
import { SynthParam } from './SynthParameters'
import type Parameter from './Parameter'
import MidiAssignment from './MidiAssignment'
import { toRaw, toValue } from 'vue'

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

export const SynthParamCategories: Partial<Record<SynthSerializerCategory, SynthParam[]>> = {
	[SynthSerializerCategory.WAVEFORM]: [
		SynthParam.Attack,
		SynthParam.Decay,
		SynthParam.Sustain,
		SynthParam.Release,
	],
}

export type SerialisedSynthParams = Partial<Record<SynthParam, SerializedParameter>>

export interface SerializedSynth {
	parameters?: SerialisedSynthParams
	[SynthSerializerCategory.WAVEFORM]?: {
		preset?: string | undefined
		type?: string
		wavetable?: Array<number> | null
	}
	[SynthSerializerCategory.EFFECTS]?: any[]
	[SynthSerializerCategory.MIDI]?: SerializedMidiAssignment[]
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

		let parameters: SerialisedSynthParams = synth.params.serialize() ?? {}
		if (cateogoriesAreDefined) {
			parameters = SynthSerializer.filterParams(parameters, categories)
		}
		data.parameters = parameters

		if (!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.WAVEFORM)) {
			data[SynthSerializerCategory.WAVEFORM] = {
				type: synth.state.type,
			}

			if (!!synth.state.preset) data.waveform.preset = synth.state.preset
			if (synth.state.type === 'custom' && !!synth.state.wavetable)
				data.waveform.wavetable = synth.state.wavetable
		}

		if (!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.EFFECTS)) {
			data[SynthSerializerCategory.EFFECTS] = synth.effects.map((effect) =>
				serializeTunaEffect(effect),
			) as any
		}

		if (!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.MIDI)) {
			data[SynthSerializerCategory.MIDI] = getAudioStore()
				.getMidiChannelsForSynth(synth.id)
				.map((channel) => channel.serialize())
		}

		if (!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.SETTINGS)) {
			data[SynthSerializerCategory.SETTINGS] = {
				volume: synth.volume,
				transpose: synth.state.transpose,
				maxPolyphony: synth.state.maxPolyphony,
				legato: synth.state.legato,
				glide: synth.state.glide,
				glideAmount: synth.state.glideAmount,
			}
		}

		return toRaw(data)
	}

	static load(synth: Synth, data: SerializedSynth, categories?: SynthSerializerCategory[]) {
		const cateogoriesAreDefined = !!categories

		let parameters: SerialisedSynthParams = data.parameters ?? {}
		if (cateogoriesAreDefined) {
			parameters = SynthSerializer.filterParams(parameters, categories)
		}
		synth.params.deserialize(parameters)

		if (!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.WAVEFORM)) {
			const waveformData = data[SynthSerializerCategory.WAVEFORM]

			synth.state.type = waveformData?.type ?? synth.state.type

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
			getAudioStore()
				.getMidiChannelsForSynth(synth.id)
				.forEach((assignment) => {
					getAudioStore().removeMidiAssignment(assignment.id)
				})

			data[SynthSerializerCategory.MIDI].forEach((channelData) => {
				const midiDevice = getAudioStore().getMidiDevice(channelData.device)
				if (!midiDevice) return

				let options: MidiAssignmentOptions = { ...channelData.options, synth }

				const assignment = new MidiAssignment(midiDevice, options)
				getAudioStore().addMidiAssignment(assignment)
			})
		}

		if (
			!!data[SynthSerializerCategory.SETTINGS] &&
			(!cateogoriesAreDefined || categories.includes(SynthSerializerCategory.SETTINGS))
		) {
			const settingsData = data[SynthSerializerCategory.SETTINGS]

			synth.volume = settingsData?.volume ?? synth.volume
			synth.state.transpose = settingsData?.transpose ?? synth.state.transpose
			synth.state.maxPolyphony = settingsData?.maxPolyphony ?? synth.state.maxPolyphony
			synth.state.legato = settingsData?.legato ?? synth.state.legato
			synth.state.glide = settingsData?.glide ?? synth.state.glide
			synth.state.glideAmount = settingsData?.glideAmount ?? synth.state.glideAmount
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

	static filterParams(
		params: SerialisedSynthParams = {},
		categories: SynthSerializerCategory[],
	): SerialisedSynthParams {
		const result: SerialisedSynthParams = {}

		for (const category of categories) {
			const categoryParams = SynthParamCategories[category]
			if (!categoryParams) continue

			for (const categoryParam of categoryParams) {
				const param = params[categoryParam]
				if (param) result[categoryParam] = param
			}
		}

		return result
	}
}
