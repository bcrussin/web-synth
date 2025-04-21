/* eslint-disable @typescript-eslint/no-explicit-any */
import { reactive, ref, type Ref } from 'vue'
import Global from '@/classes/Audio'
import Oscillator from '@/classes/Oscillator'
import FFT from './FFT'
import Tuna from 'tunajs'
import MidiDevice from './MidiDevice'

export interface SynthOptions {
	name?: string
	type?: string
	volume?: number
	_maxPolyphony?: number
	attack?: number
	decay?: number
	sustain?: number
	release?: number
	midiDevice?: any
	legato?: boolean
	glide?: boolean
	glideMode?: 'speed' | 'duration'
	glideAmount?: number
}

export default class Synth {
	static SYNTHS: Ref<{ [key: string]: Synth }> = ref({})

	midiDevice: any // Ref<MidiDevice | null>
	name: string
	type: string
	preset: string | undefined
	attack: number
	decay: number
	sustain: number
	release: number

	public get volume(): number {
		return this.inputNode.gain.value
	}
	public set volume(value: number) {
		this.inputNode.gain.value = value
	}

	_maxPolyphony: number

	get maxPolyphony() {
		return this._maxPolyphony
	}

	set maxPolyphony(value: number) {
		if (value <= 0) value = Infinity

		this._maxPolyphony = value
	}

	legato: boolean
	_glide!: boolean
	glideMode: 'speed' | 'duration'
	glideAmount: number

	get glideAmountMs() {
		return Math.round(this.glideAmount * 1000)
	}

	get glide() {
		return this._glide
	}

	set glide(enabled: boolean) {
		this._glide = enabled

		if (enabled) this.legato = true
	}

	oscillators: { [key: number]: Oscillator } = reactive({})
	frequencyQueue: Array<number> = reactive([])
	notes: Set<number> = reactive(new Set<number>())
	wavetable: Array<number> | null = null
	periodicWave: PeriodicWave | null = null
	transpose: number = 0

	_bypass: boolean = false
	public get bypass() {
		return this._bypass
	}
	public set bypass(enabled: boolean) {
		this._bypass = enabled

		if (!!enabled) {
			this.outputNode.disconnect()
		} else {
			this.outputNode.connect(Global.MASTER)
		}
	}

	inputNode: GainNode
	outputNode: DynamicsCompressorNode
	tuna: Tuna
	effects: Tuna.TunaAudioNode[] = reactive([])

	constructor(options: SynthOptions = {}) {
		options = options ?? {}

		this.midiDevice = options?.midiDevice

		this.tuna = new Tuna(Global.CONTEXT)

		this.inputNode = Global.CONTEXT.createGain()

		this.outputNode = Global.CONTEXT.createDynamicsCompressor()
		this.outputNode.threshold.setValueAtTime(-10, Global.CONTEXT.currentTime)
		this.outputNode.ratio.setValueAtTime(10, Global.CONTEXT.currentTime)
		this.outputNode.connect(Global.MASTER)

		this.updateEffectNodes()

		this.type = options.type ?? 'sine'
		this.volume = options.volume ?? 1

		this._maxPolyphony = options._maxPolyphony ?? Infinity
		this.legato = options.legato ?? true
		this.glide = options.glide ?? false
		this.glideMode = options.glideMode ?? 'speed'
		this.glideAmount = options.glideAmount ?? 0.1

		this.attack = 0.001
		this.release = 0.05
		this.sustain = 1
		this.decay = 0.5

		this.name = options.name ?? `Synth ${Object.keys(Synth.SYNTHS.value).length + 1}`
		Synth.SYNTHS.value[this.name] = this
	}

	static getSynths(): { [key: string]: Synth } {
		return Synth.SYNTHS.value
	}

	static getSynth(name: string): Synth {
		return Synth.SYNTHS.value[name]
	}

	delete(): void {
		this.setMidiDevice()
		delete Synth.SYNTHS.value[this.name]
	}

	updateEffectNodes() {
		this.inputNode.disconnect()

		if (this.effects.length <= 0) {
			this.inputNode.connect(this.outputNode)
			return
		}

		this.effects.forEach((effect, index) => {
			effect.disconnect(null as unknown as AudioNode)

			if (index <= 0) this.inputNode.connect(effect)

			if (index >= this.effects.length - 1) effect.connect(this.outputNode)
			else effect.connect(this.effects[index + 1])
		})
	}

	getEffect(index: number): Tuna.TunaAudioNode {
		return this.effects?.[index]
	}

	addEffect(effect: string, options: any = {}) {
		options.bypass = false
		let effectNode

		switch (effect.toLowerCase()) {
			case 'reverb':
				options.wetLevel = options.wetLevel ?? 0.5
				effectNode = new this.tuna.Convolver(options)
				effectNode.convolver.buffer = Global.generateImpulseReponse(1, 1, false)
				break
			case 'chorus':
				effectNode = new this.tuna.Chorus(options)
				break
			case 'delay':
				options.wetLevel = options.wetLevel ?? 1
				options.delayTime = options.delayTime ?? 300
				effectNode = new this.tuna.Delay(options)
				break
			case 'overdrive':
				effectNode = new this.tuna.Overdrive(options)
				effectNode.outputGain = 5
				effectNode.curveAmount = 0.7
				break
			case 'phaser':
				effectNode = new this.tuna.Phaser(options)
				break
			default:
				return
		}

		this.effects.push(effectNode)

		this.updateEffectNodes()
	}

	deleteEffect(index: number) {
		if (index < 0 || index >= this.effects.length) return

		// TODO: Properly disconnect/dispose effect
		// this.effects[index].bypass = true
		this.effects[index].disconnect(null as unknown as AudioNode)
		this.effects.splice(index, 1)
		this.updateEffectNodes()
	}

	setEffectProperty(
		id: number,
		property: string,
		value: number,
		treatAsAudioParam: boolean = false,
	) {
		const effect = this.effects[id] as Record<string, any>

		if (treatAsAudioParam) effect[property].value = value
		else effect[property] = value
	}

	setProperty(property: string, value: string | number | boolean): void {
		if (typeof value == 'string') value = parseFloat(value)
		if (typeof value == 'number' && isNaN(value)) return
		;(this as any)[property] = value
	}

	setBypass(enabled: boolean) {
		this.bypass = enabled
	}

	setTranspose(value: number): void {
		if (typeof value !== 'number') return

		this.transpose = value
	}

	changeTranspose(value: number): void {
		if (typeof value !== 'number') return

		this.transpose += value
	}

	setMaxPolyphony(value: number) {
		if (typeof value !== 'number') return

		this.maxPolyphony = value
	}

	setMidiDevice(device?: MidiDevice | string): void {
		if (typeof device === 'string') device = MidiDevice.DEVICES[device]

		this.midiDevice?.removeSynth(this.name)

		if (device == undefined) {
			this.midiDevice = null
			return
		}

		this.midiDevice?.removeSynth(this.name)
		device.addSynth(this)
		this.midiDevice = device
	}

	getPresetOrType(): string {
		return this.preset ?? this.type
	}

	isPlaying(): boolean {
		return Object.keys(this.oscillators).length > 0
	}

	isNotePlaying(frequency: number): boolean {
		if (this.oscillators == undefined) return false
		return !!this.oscillators[frequency] || !!this.frequencyQueue.includes(frequency)
	}

	hasFreeNotes(beforeRemoving?: boolean): boolean {
		const offset = beforeRemoving ? 1 : 0
		return Object.keys(this.oscillators).length < this._maxPolyphony + offset
	}

	hasQueuedNotes(): boolean {
		return this.frequencyQueue.length > 0
	}

	getOscillator(frequency: number) {
		return this.oscillators?.[frequency]
	}

	playNote(note?: string, octave?: number | string, volume?: number) {
		if (note == undefined || octave == undefined) return

		if (typeof octave != 'number') octave = parseInt(octave)

		octave += this.transpose
		const frequency = Global.getFrequency(note, octave)
		this.playFrequency(frequency, volume)
	}

	playFrequency(frequency: number, volume?: number): void {
		if (frequency == undefined || this.isNotePlaying(frequency)) return

		// const oscillator = new Oscillator(this)

		// oscillator.attack(frequency, volume)

		// if (!this.hasFreeNotes()) {
		// 	this.stealOldestNote()
		// }

		// Max polyphony reached
		if (!this.hasFreeNotes()) {
			const oldestNote = this.getOldestNote()!

			if (this.legato) {
				// If legato, change oldest note frequency to new one
				this.addNoteToQueue(oldestNote)
				this.changeOscillatorFrequency(oldestNote, frequency, volume)
				return
			} else {
				// Else, release note and move it to queue
				oldestNote.release()
				this.removeOscillator(oldestNote, true)
			}
		}

		console.log('creating new oscillator')
		const oscillator = new Oscillator(this)
		oscillator.attack(frequency, volume)

		this.addOscillator(oscillator, frequency)
	}

	stopNote(note?: string, octave?: number | string) {
		if (note == undefined || octave == undefined) return

		octave = parseInt(octave.toString())
		octave += this.transpose
		const frequency = Global.getFrequency(note, octave)

		this.stopFrequency(frequency)
	}

	stopFrequency(frequency: number) {
		if (this.frequencyQueue.includes(frequency)) {
			this.removeFromQueue(frequency)
			return
		}

		const oscillator = this.getOscillator(frequency)

		if (frequency == undefined || oscillator == undefined) return

		// If there are queued notes and space to unqueue
		if (this.hasFreeNotes(true) && this.hasQueuedNotes()) {
			const newFrequency = this.frequencyQueue.pop()!

			if (this.legato) {
				// If legato, reuse the released note for the queued frequency
				this.changeOscillatorFrequency(oscillator, newFrequency)
				return
			} else {
				// Else, release as normal and create a new oscillator for queued frequency
				this.removeFromQueue(frequency)

				const newOscillator = new Oscillator(this)
				newOscillator.attack(newFrequency)

				this.addOscillator(newOscillator, newFrequency)
			}
		}

		this.removeOscillator(frequency)
		oscillator.release()
	}

	// TODO: Allow specifying a new volume as well, store volumes in frequencyQueue
	changeOscillatorFrequency(oscillator: Oscillator, frequency: number, volume?: number) {
		this.removeOscillator(oscillator.frequencyValue)

		// Makes the oscillator act like it was newly created, test for desired functionality
		oscillator.created = new Date()

		if (this.glide) {
			oscillator.glideToFrequency(frequency, this.glideAmount)

			if (!!volume) oscillator.glideToVelocity(volume, this.glideAmount)
		} else {
			oscillator.setFrequency(frequency)

			if (!!volume) oscillator.setVelocity(volume)
		}

		this.addOscillator(oscillator, frequency)
	}

	addOscillator(oscillator: Oscillator, frequency?: number) {
		const frequencyValue = frequency ?? oscillator.frequencyValue

		this.oscillators[frequencyValue] = oscillator
		this.notes.add(frequencyValue)
	}

	removeOscillator(oscillator: Oscillator | number, addToQueue: boolean = false) {
		let frequency

		if (typeof oscillator === 'number') frequency = oscillator
		else frequency = oscillator.frequencyValue

		this.notes.delete(frequency)

		if (!!this.oscillators[frequency]) {
			delete this.oscillators[frequency]
		}

		if (addToQueue) {
			this.frequencyQueue.push(frequency)
		}
	}

	// Max Polyphony Functions

	getOldestNote(): Oscillator | undefined {
		let oldestNote: Oscillator | undefined = undefined

		Object.values(this.oscillators).forEach((oscillator) => {
			if (oldestNote == undefined || oscillator.created < oldestNote.created) {
				oldestNote = oscillator
			}
		})

		return oldestNote
	}

	addNoteToQueue(frequency: Oscillator | number) {
		if (typeof frequency !== 'number') {
			frequency = frequency.frequencyValue
		}

		this.frequencyQueue.push(frequency)
		// this.removeOscillator(frequency)
	}

	removeFromQueue(frequency: number) {
		this.frequencyQueue = this.frequencyQueue.filter((queueFreq) => queueFreq != frequency)
	}

	// Property Setters

	stopAll() {
		this.frequencyQueue = []

		if (this.oscillators != undefined)
			Object.entries(this.oscillators).forEach(([name, note]) => {
				note.release()
				delete this.oscillators[parseFloat(name)]
				// this.oscillators = {}
			})
		this.notes.clear()
	}

	updateFrequencies() {
		const oscillators = Object.values(this.oscillators)

		oscillators.forEach((oscillator) => oscillator.setFrequency())
	}

	setWaveType(type: string): void {
		this.preset = undefined

		if (this.type == type) return
		this.type = type
	}

	setPreset(preset?: string) {
		if (this.preset == preset) return

		this.type = 'custom'
		this.preset = preset ?? undefined
	}

	setWavetable(wavetable: Array<number>) {
		if (wavetable == undefined || wavetable.length <= 0) {
			wavetable = [0, 1]
			this.wavetable = new Array(16).fill(0)
		} else {
			this.wavetable = [...wavetable]
		}

		// Presets assume stretch value of 4
		const transformed = FFT(wavetable, 4)

		// Create a PeriodicWave
		this.periodicWave = Global.CONTEXT.createPeriodicWave(transformed.real, transformed.imag)
	}

	clearWavetable() {
		this.wavetable = null
		this.periodicWave = null
	}
}
