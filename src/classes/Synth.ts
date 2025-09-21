/* eslint-disable @typescript-eslint/no-explicit-any */
import { reactive, ref, shallowReactive, shallowRef, triggerRef, watch, type Ref } from 'vue'
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
	static SYNTHS: Ref<{ [key: UUID]: Synth }> = shallowRef({})

	midiDevice: MidiDevice | null // Ref<MidiDevice | null>

	id: UUID = crypto.randomUUID()

	nameRef: Ref<string>

	get name() {
		return this.nameRef.value
	}
	set name(value: string) {
		this.nameRef.value = value
	}

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
	noteQueue: Array<number> = reactive([])

	notes: Set<number> = reactive(new Set<number>())
	// pressedNotes: Set<number> = reactive(new Set<string>())

	wavetable: Array<number> | null = null
	periodicWave: PeriodicWave | null = null

	_transpose: Ref<number> = ref(0)
	public get transpose(): number {
		return this._transpose.value ?? this._transpose ?? 0
	}
	public set transpose(value: number) {
		if (typeof value !== 'number') return

		if (typeof this._transpose === 'number') (this._transpose as any) = value
		else this._transpose.value = value

		this.updateOscillatorNotes()
	}

	public get semitones() {
		let n = this.transpose % 12

		if (n > 11) n -= 12
		if (n < -11) n += 12
		return n
	}
	public set semitones(val) {
		const extraOctaves = Math.floor(val / 12)
		val = ((val % 12) + 12) % 12
		if (val > 11) val -= 12

		this.transpose = (this.octaves + extraOctaves) * 12 + val
	}

	get octaves() {
		let semitones = this.transpose % 12

		if (semitones > 0) return Math.floor(this.transpose / 12)
		else return Math.ceil(this.transpose / 12)
	}
	set octaves(val) {
		let semitones = this.transpose % 12

		this.transpose = val * 12 + semitones
	}

	_bypass: boolean = false
	public get bypass() {
		return this._bypass
	}
	public set bypass(enabled: boolean) {
		this._bypass = enabled

		if (!!enabled) {
			this.outputNode.disconnect()
		} else {
			this.outputNode.connect(Global.master)
		}
	}

	inputNode: GainNode
	outputNode: DynamicsCompressorNode
	tuna: Tuna
	effects: Tuna.TunaAudioNode[] = reactive([])

	constructor(options: SynthOptions = {}) {
		options = options ?? {}

		this.midiDevice = options?.midiDevice

		this.tuna = new Tuna(Global.context)

		this.inputNode = Global.context.createGain()

		this.outputNode = Global.context.createDynamicsCompressor()
		this.outputNode.threshold.setValueAtTime(-10, Global.context.currentTime)
		this.outputNode.ratio.setValueAtTime(10, Global.context.currentTime)
		this.outputNode.connect(Global.master)

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

		this.nameRef = ref(options.name ?? `Synth ${Object.keys(Synth.SYNTHS.value).length + 1}`)
		Synth.SYNTHS.value[this.id] = this
		triggerRef(Synth.SYNTHS)
	}

	static getSynths(): { [key: UUID]: Synth } {
		return Synth.SYNTHS.value
	}

	static getSynth(id: UUID): any {
		return shallowReactive(Synth.SYNTHS.value[id])
	}

	delete(): void {
		this.setMidiDevice()
		delete Synth.SYNTHS.value[this.id]
		triggerRef(Synth.SYNTHS)
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
				;(effectNode as any).impulseDuration = 1
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

	getEffectProperty(id: number, property: string, treatAsAudioParam: boolean = false): any {
		const effect = this.effects[id] as Record<string, any>

		if (treatAsAudioParam) return effect[property].value

		return effect[property]
	}

	setProperty(property: string, value: string | number | boolean): void {
		if (typeof value == 'string') value = parseFloat(value)
		if (typeof value == 'number' && isNaN(value)) return
		;(this as any)[property] = value
	}

	setBypass(enabled: boolean) {
		this.bypass = enabled
	}

	changeTranspose(value: number): void {
		if (typeof value !== 'number') return

		this.transpose += value
	}

	setMaxPolyphony(value: number) {
		if (typeof value !== 'number') return

		this.maxPolyphony = value
	}

	/**
	 * Assign a MIDI device to the synth
	 * @param device A MidiDevice object, or a string containing its ID
	 */
	setMidiDevice(device?: MidiDevice | string): void {
		if (typeof device === 'string') device = MidiDevice.DEVICES[device]

		if (device == undefined) {
			this.midiDevice = null
			return
		}

		this.midiDevice?.removeSynth(this.name)
		device.addSynth(this)
		this.midiDevice = device
	}

	/**
	 * Return the synth's preset name, or wave type if no preset is set.
	 */
	getPresetOrType(): string {
		return this.preset ?? this.type
	}

	isPlaying(): boolean {
		return Object.keys(this.oscillators).length > 0
	}

	isNotePlaying(note: string, octave: number): boolean {
		return this.isSemitonePlaying(Global.getSemitone(note, octave))
	}

	isSemitonePlaying(semitone: number) {
		if (this.oscillators == undefined) return false
		return !!this.oscillators[semitone] || !!this.noteQueue.includes(semitone)
	}

	hasFreeNotes(beforeRemoving?: boolean): boolean {
		const offset = beforeRemoving ? 1 : 0
		return Object.keys(this.oscillators).length < this._maxPolyphony + offset
	}

	hasQueuedNotes(): boolean {
		return this.noteQueue.length > 0
	}

	getOscillator(semitone: number) {
		return this.oscillators?.[semitone]
	}

	/**
	 * Play a synth note
	 * @param note The note name (e.g., "C", "Db", "F#", etc.)
	 * @param octave The octave number (0-8)
	 * @param volume The volume level, from 0 (silent) to 1 (max)
	 * @returns
	 */
	playNote(note?: string, octave?: number | string, volume?: number): number | undefined {
		if (note == undefined || octave == undefined) return

		if (typeof octave != 'number') octave = parseInt(octave)

		const semitone = Global.getSemitone(note, octave)

		this.playSemitone(semitone, volume)
		return semitone
	}

	/**
	 * Play a synth note
	 * @param semitone The absolute pitch in semitones (C0 = 0, C#0 = 1, D0 = 2, etc.)
	 * @param volume The volume level, from 0 (silent) to 1 (max)
	 * @returns
	 */
	playSemitone(semitone: number, volume?: number) {
		this.notes.add(semitone)

		// const frequency = Global.getFrequency(transposed.note, transposed.octave)
		if (semitone == undefined || this.isSemitonePlaying(semitone)) return

		// Max polyphony reached
		if (!this.hasFreeNotes()) {
			const oldest = this.getOldestOscillator()!

			if (this.legato) {
				// If legato, change oldest note frequency to new one
				this.addNoteToQueue(oldest.baseSemitone)
				this.changeOscillatorNote(oldest, semitone, volume)
				return
			} else {
				// Else, release note and move it to queue
				oldest.release()
				this.removeOscillator(oldest, true)
			}
		}

		const oscillator = new Oscillator(this)
		oscillator.attack(semitone, volume)

		this.addOscillator(oscillator, semitone)

		return
	}

	/**
	 * Stop a synth note
	 * @param note The note name (e.g., "C", "Db", "F#", etc.)
	 * @param octave The octave number (0-8)
	 * @param volume The volume level, from 0 (silent) to 1 (max)
	 * @returns
	 */
	stopNote(note?: string, octave?: number | string) {
		if (note == undefined || octave == undefined) return

		octave = parseInt(octave.toString())
		const semitone = Global.getSemitone(note, octave)

		this.stopSemitone(semitone)
	}

	/**
	 * Stop a synth note
	 * @param semitone The absolute pitch in semitones (C0 = 0, C#0 = 1, D0 = 2, etc.)
	 * @param volume The volume level, from 0 (silent) to 1 (max)
	 * @returns
	 */
	stopSemitone(semitone: number) {
		this.notes.delete(semitone)

		if (this.noteQueue.includes(semitone)) {
			this.removeFromQueue(semitone)
			return
		}

		const oscillator = this.getOscillator(semitone)

		if (semitone == undefined || oscillator == undefined) return

		// If there are queued notes and space to unqueue
		if (this.hasFreeNotes(true) && this.hasQueuedNotes()) {
			const newSemitone = this.noteQueue.pop()!

			if (this.legato) {
				// If legato, reuse the released note for the queued frequency
				this.changeOscillatorNote(oscillator, newSemitone)
				return
			} else {
				// Else, release as normal and create a new oscillator for queued frequency
				this.removeFromQueue(newSemitone)

				// New note should have the same volume as the note that was just released
				const newOscillator = new Oscillator(this)
				newOscillator.attack(newSemitone, oscillator.velocity)

				this.addOscillator(newOscillator, newSemitone)
			}
		}

		this.removeOscillator(oscillator)
		oscillator.release()
	}

	// TODO: Allow specifying a new volume as well, store volumes in frequencyQueue
	changeOscillatorNote(oscillator: Oscillator, semitone: number, volume?: number) {
		this.removeOscillator(oscillator)

		// Makes the oscillator act like it was newly created, test for desired functionality
		oscillator.created = new Date()

		if (this.glide) {
			oscillator.glideToNote(semitone, this.glideAmount)

			if (!!volume) oscillator.glideToVelocity(volume, this.glideAmount)
		} else {
			oscillator.setSemitone(semitone)

			/*
        I feel like legato notes should keep previous volume, but uncomment this to use the
        velocity of the newly pressed note instead if desired.
      */
			// if (!!volume) oscillator.setVelocity(volume)
		}

		this.addOscillator(oscillator, semitone)
	}

	addOscillator(oscillator: Oscillator, semitone: number) {
		semitone = semitone ?? oscillator.baseSemitone

		this.oscillators[semitone] = oscillator
		// this.notes.add(semitone)
	}

	removeOscillator(oscillator: Oscillator, addToQueue: boolean = false) {
		let semitone = oscillator.baseSemitone

		if (!!this.oscillators[semitone]) {
			delete this.oscillators[semitone]
		}

		// this.notes.delete(semitone)

		if (addToQueue) {
			this.noteQueue.push(semitone)
		}
	}

	// Max Polyphony Functions

	getOldestOscillator(): Oscillator | undefined {
		let oldest: Oscillator | undefined = undefined

		Object.values(this.oscillators).forEach((oscillator) => {
			if (oldest == undefined || oscillator.created < oldest.created) {
				oldest = oscillator
			}
		})

		return oldest
	}

	addNoteToQueue(semitone: number) {
		this.noteQueue.push(semitone)
		// this.removeOscillator(frequency)
	}

	removeFromQueue(semitone: number) {
		this.noteQueue = this.noteQueue.filter((note) => note != semitone)
	}

	// Property Setters

	stopAll() {
		this.noteQueue = []

		if (this.oscillators != undefined)
			Object.entries(this.oscillators).forEach(([name, note]) => {
				note.release()
				delete this.oscillators[parseFloat(name)]
			})
		this.notes.clear()
	}

	/**
	 * Recompute all oscillator frequencies along with any frequency-related effects.
	 *
	 * Use this to refresh oscillator notes after changes to pitch-related settings (pitch bend, etc.).
	 */
	updateOscillatorFrequencies() {
		const oscillators = Object.values(this.oscillators)

		oscillators.forEach((oscillator) => oscillator.setFrequency())
	}

	/**
	 * Recompute all oscillator notes and frequencies along with any note or frequency-related effects.
	 *
	 * Use this to refresh oscillator notes after changes to note-related settings (transposition, etc.).
	 */
	updateOscillatorNotes() {
		const oscillators = Object.values(this.oscillators)

		oscillators.forEach((oscillator) => oscillator.setSemitone())
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
		this.periodicWave = Global.context.createPeriodicWave(transformed.real, transformed.imag)
	}

	clearWavetable() {
		this.wavetable = null
		this.periodicWave = null
	}
}
