/* eslint-disable @typescript-eslint/no-explicit-any */
import Synth, { type SynthOptions } from './Synth'
import Global from './Audio'
import { useMidiStore, type MIDIParam } from '@/stores/midiStore'
import { reactive } from 'vue'
import MidiChannel, { type MidiChannelOptions } from './MidiChannel'
import MidiManager from './MidiManager'

interface SynthParams {
	[synthName: string]: {
		[channel: number]: MidiChannel
	}
}

export default class MidiDevice {
	static DEVICES: { [key: string]: MidiDevice } = {}
	static DEFAULTS = {
		velocityCurve: 1,
	}

	static STORE: any

	input: MIDIInput
	synths: Synth[]

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
		this.channelValues = reactive(new Array(16).fill(0))
		this.channelSettings = reactive({})

		this.synths = []
		const synth = new Synth({ name: input?.name ?? undefined, midiDevice: this })
		this.addSynth(synth)
	}

	static async initialize() {
		this.STORE = useMidiStore()
		await this.STORE.fetchParams()

		MidiDevice.requestDevices()
	}

	static requestDevices() {
		if (typeof navigator.requestMIDIAccess != 'function') return
		navigator.requestMIDIAccess().then(MidiDevice.success, MidiDevice.failure)
	}

	static success(midiAccess: MIDIAccess) {
		midiAccess.inputs.forEach((input) => {
			const device = new MidiDevice(input)
			MidiDevice.DEVICES[input.id] = device

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
					this.synths.forEach((synth) =>
						synth.playNote(noteLetter, octave, MidiDevice.mapToRange(velocity, 0, 127, 0, 1)),
					)
				} else {
					this.synths.forEach((synth) => synth.stopNote(noteLetter, octave))
				}
				break
			case 128: // noteOff
				this.synths.forEach((synth) => synth.stopNote(noteLetter, octave))
				break
		}

		if (command >= 224 && command <= 239) {
			this.pitchBend = MidiDevice.mapToRange(note + velocity * 128, 0, 16383, -2, 2)
			this.synths.forEach((synth) => synth.updateFrequencies())
		}

		if (command == 176) {
			const channels = MidiManager.getChannelsForDevice(this)
			const channelNumber = note

			channels.forEach((channel: MidiChannel) => {
				if (channel.channelNumber == channelNumber) {
					const percent = velocity / 127

					this.channelValues[channelNumber] = percent
					this.setParam(channel, percent, channel.synth)
				}
			})
		}
	}

	mapVelocityToCurve(velocity: number) {
		const curve = this.velocityCurve ?? MidiDevice.DEFAULTS.velocityCurve

		const velocityMapped = 127 * Math.pow(velocity / 127, curve)
		return velocityMapped
	}

	addSynth(synth: Synth | string) {
		if (typeof synth === 'string') synth = Synth.getSynth(synth)

		if (synth == undefined) return

		this.synths.push(synth)
	}

	removeSynth(name: string): void {
		this.synths = this.synths.filter((synth) => synth.name != name)
	}

	getChannelProperties(synthName: string, channel: number) {
		return this.channelSettings[synthName][channel]
	}

	getChannelProperty(synthName: string, channel: number, property: keyof MidiChannelOptions) {
		return this.channelSettings[synthName][channel].getProperty(property)
	}

	setChannelProperty<K extends keyof MidiChannelOptions>(
		synth: Synth,
		channel: number,
		property: K,
		value: MidiChannelOptions[K],
	) {
		if (this.channelSettings[synth.name] == undefined) {
			console.log(`Synth ${synth.name} has no data for channel ${channel}`)
			return //this.channelSettings[synth.name] = {}
		}

		this.channelSettings[synth.name][channel].setProperty(property, value)
	}

	setChannelProperties(synth: Synth, channel: number, data: MidiChannelOptions) {
		if (this.channelSettings[synth.name] == undefined) {
			console.log(`Synth ${synth.name} has no data for channel ${channel}`)
			return //this.channelSettings[synth.name] = {}
		}

		this.channelSettings[synth.name][channel].setProperties(data)
	}

	setParam(channelProps: MidiChannel, percent: number, synth?: Synth) {
		const param = MidiDevice.STORE.getParam(channelProps.param)
		if (param == undefined) return

		if (channelProps.inverted) percent = 1 - percent
		percent = Global.mapToRange(percent, 0, 1, channelProps.min, channelProps.max)

		const value = percent * param.max + param.min

		switch (param.type) {
			case 'synth':
				if (!!synth) {
					;(synth as any)[param.property] = value
				} else {
					this.synths.forEach((synth: any) => (synth[param.property] = value))
				}
				break
		}
	}

	resolve(path: string | string[], obj = self, separator = '.') {
		const properties = Array.isArray(path) ? path : path.split(separator)
		return properties.reduce((prev: any, curr: any) => prev?.[curr], obj)
	}
}
