/* eslint-disable @typescript-eslint/no-explicit-any */
import Synth, { type SynthOptions } from './Synth'
import Global from './Audio'
import { getMidiStore, useMidiStore, type MIDIParam } from '@/stores/midiStore'
import MidiChannel, { type MidiChannelOptions } from './MidiChannel'
import MidiManager from './MidiManager'
import { getAudioStore } from '@/stores/audioStore'

interface SynthParams {
	[synthId: UUID]: {
		[channel: number]: MidiChannel
	}
}

export default class MidiDevice {
	static DEFAULTS = {
		velocityCurve: 1,
	}

	get id() {
		return this.input.id
	}

	input: MIDIInput
	synthIds: Set<UUID>

	channelValues: number[]
	channelSettings: SynthParams
	pitchBend: number
	velocityCurve: number | null = null

	get name(): string {
		return this.input.name ?? ''
	}

	constructor(input: MIDIInput) {
		this.input = input
		this.pitchBend = 0
		this.channelValues = new Array(16).fill(0)
		this.channelSettings = {}

		this.synthIds = new Set()
		const synth = new Synth({ name: input?.name ?? undefined, midiDevice: this })
		this.addSynth(synth)
	}

	static async initialize() {
		await getMidiStore().fetchParams()
		MidiDevice.requestDevices()
	}

	static requestDevices() {
		if (typeof navigator.requestMIDIAccess != 'function') return
		navigator.requestMIDIAccess().then(MidiDevice.success, MidiDevice.failure)
	}

	static success(midiAccess: MIDIAccess) {
		midiAccess.inputs.forEach((input) => {
			const device = new MidiDevice(input)
			getAudioStore().addMidiDevice(device)

			device.startCapturing()
		})

		// Temporary until UI is overhauled
		// setWaveType()
	}

	static failure(event: DOMException) {
		console.error(`Failed to get MIDI access - ${event.message}`)
	}

	static mapToRange(
		value: number,
		in_min: number,
		in_max: number,
		out_min: number,
		out_max: number,
	) {
		return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
	}

	startCapturing() {
		this.input.onmidimessage = (event) => this.getMessage(event)
	}

	stopCapturing() {
		this.input.onmidimessage = null
	}

	getMessage(message: MIDIMessageEvent) {
		if (message?.data == undefined) return

		const command = message.data[0]
		const note = message.data[1]
		let velocity = message.data.length > 2 ? message.data[2] : 0

		const noteLetter = Global.getNoteFromMIDI(note)
		const octave = Math.floor(note / 12) - 1

		switch (command) {
			case 144: // noteOn
				if (velocity > 0) {
					velocity = this.mapVelocityToCurve(velocity)
					for (const synthId of this.synthIds) {
						const synth = getAudioStore().getSynth(synthId)
						synth.playNote(noteLetter, octave, MidiDevice.mapToRange(velocity, 0, 127, 0, 1))
					}
				} else {
					for (const synthId of this.synthIds) {
						const synth = getAudioStore().getSynth(synthId)
						synth.stopNote(noteLetter, octave)
					}
				}
				break
			case 128: // noteOff
				for (const synthId of this.synthIds) {
					const synth = getAudioStore().getSynth(synthId)
					synth.stopNote(noteLetter, octave)
				}
				break
		}

		if (command >= 224 && command <= 239) {
			this.pitchBend = MidiDevice.mapToRange(note + velocity * 128, 0, 16383, -2, 2)
			for (const synthId of this.synthIds) {
				const synth = getAudioStore().getSynth(synthId)
				synth.updateOscillatorFrequencies()
			}
		}

		if (command == 176) {
			const channels = MidiManager.getChannelsForDevice(this)
			const channelNumber = note

			const percent = velocity / 127
			this.channelValues[channelNumber] = percent

			channels.forEach((channel: MidiChannel) => {
				if (channel.channelNumber == channelNumber) {
					this.setParam(channel, percent, channel.synthId)
				}
			})
		}
	}

	mapVelocityToCurve(velocity: number) {
		const curve = this.velocityCurve ?? MidiDevice.DEFAULTS.velocityCurve

		const velocityMapped = 127 * Math.pow(velocity / 127, curve)
		return velocityMapped
	}

	addSynth(synth: Synth | UUID) {
		if (typeof synth === 'string') synth = getAudioStore().getSynth(synth)

		if (synth == undefined) return

		this.synthIds.add(synth.id)
	}

	removeSynth(id: UUID): void {
		this.synthIds.delete(id)
	}

	getChannelProperties(synthId: UUID, channel: number) {
		return this.channelSettings[synthId][channel]
	}

	getChannelProperty(synthId: UUID, channel: number, property: keyof MidiChannelOptions) {
		return this.channelSettings[synthId][channel].getProperty(property)
	}

	setChannelProperty<K extends keyof MidiChannelOptions>(
		synth: Synth,
		channel: number,
		property: K,
		value: MidiChannelOptions[K],
	) {
		if (this.channelSettings[synth.id] == undefined) {
			console.error(`Synth ${synth.name} has no data for channel ${channel}`)
			return //this.channelSettings[synth.name] = {}
		}

		this.channelSettings[synth.id][channel].setProperty(property, value)
	}

	setChannelProperties(synth: Synth, channel: number, data: MidiChannelOptions) {
		if (this.channelSettings[synth.id] == undefined) {
			console.error(`Synth ${synth.name} has no data for channel ${channel}`)
			return //this.channelSettings[synth.name] = {}
		}

		this.channelSettings[synth.id][channel].setProperties(data)
	}

	setParam(channelProps: MidiChannel, percent: number, synthId?: UUID) {
		const param = getMidiStore().getParam(channelProps.param)
		if (param == undefined) return

		if (channelProps.inverted) percent = 1 - percent
		percent = Global.mapToRange(percent, 0, 1, channelProps.min, channelProps.max)

		let value = percent * (param.max - param.min) + param.min
		if (!!param.step) value = Math.round(value / param.step) * param.step

		switch (param.type) {
			case 'synth':
				if (!!synthId) {
					const synth = getAudioStore().getSynth(synthId)
					;(synth as any)[param.property] = value
				} else {
					this.synthIds.forEach((synthId: any) => {
						const synth = getAudioStore().getSynth(synthId)
						;(synth as any)[param.property] = value
					})
				}
				break
		}
	}

	resolve(path: string | string[], obj = self, separator = '.') {
		const properties = Array.isArray(path) ? path : path.split(separator)
		return properties.reduce((prev: any, curr: any) => prev?.[curr], obj)
	}
}
