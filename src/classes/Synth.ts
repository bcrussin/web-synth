/* eslint-disable @typescript-eslint/no-explicit-any */
import { reactive, type Reactive } from 'vue'
import Global from '@/classes/Audio'
import Oscillator from '@/classes/Oscillator'
import FFT from './FFT'
import Tuna from 'tunajs'
import MidiDevice from './MidiDevice'
import { getAudioStore } from '@/stores/audioStore'
import SynthParameters from './SynthParameters'
import SynthState from '../states/SynthState'

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
	private static _animationFrameId: number | undefined

	midiDevice: MidiDevice | null // Ref<MidiDevice | null>

	id: UUID = crypto.randomUUID()

	params: SynthParameters

	state: Reactive<SynthState>

	public get volume(): number {
		return this.inputNode.gain.value
	}
	public set volume(value: number) {
		this.inputNode.gain.value = value
	}

	oscillators: { [key: number]: Oscillator } = reactive({})
	noteQueue: Array<number> = reactive([])

	// pressedNotes: Set<number> = reactive(new Set<string>())

	periodicWave: PeriodicWave | null = null

	_bypass: boolean = false
	public get bypass() {
		return this._bypass
	}
	public set bypass(enabled: boolean) {
		this._bypass = enabled

		if (!!enabled) {
			this.outputNode.disconnect()
		} else {
			this.outputNode.connect(this.analyserNode)
		}
	}

	inputNode: GainNode
	outputNode: DynamicsCompressorNode
	analyserNode: AnalyserNode
	tuna: Tuna
	effects: Tuna.TunaAudioNode[] = reactive([])
	signalLevel = 0

	static updateSignalLevels() {
		Object.values(getAudioStore().synths).forEach((synth) => {
			synth?.updateSignalLevel()
		})
	}

	static beginUpdatingSignalLevels() {
		const update = () => {
			Synth.updateSignalLevels()
			Synth._animationFrameId = requestAnimationFrame(update)
		}

		if (!this._animationFrameId) update()
	}

	static stopUpdatingSignalLevels() {
		if (this._animationFrameId) {
			cancelAnimationFrame(this._animationFrameId)
			this._animationFrameId = undefined
		}
	}

	constructor(options: SynthOptions = {}) {
		options = options ?? {}

		this.midiDevice = options?.midiDevice

		this.tuna = new Tuna(Global.context)

		this.analyserNode = Global.context.createAnalyser()
		this.analyserNode.connect(Global.master)

		this.outputNode = Global.context.createDynamicsCompressor()
		this.outputNode.threshold.setValueAtTime(-10, Global.context.currentTime)
		this.outputNode.ratio.setValueAtTime(10, Global.context.currentTime)
		this.outputNode.connect(this.analyserNode)

		this.inputNode = Global.context.createGain()
		this.updateEffectNodes()
		this.volume = options.volume ?? 1

		this.state = reactive(new SynthState(this, options))
		this.params = new SynthParameters(this)
		getAudioStore().addSynth(this)
	}

	updateSignalLevel(): number {
		const buffer = new Uint8Array(this.analyserNode.fftSize)
		this.analyserNode.getByteTimeDomainData(buffer)

		// Compute root mean square (RMS)
		let sumSquares = 0
		for (let i = 0; i < buffer.length; i++) {
			const normalized = (buffer[i] - 128) / 128
			sumSquares += normalized * normalized
		}

		let db = 20 * Math.log10(sumSquares / buffer.length)
		let linearVolume = Math.min(Math.max(0, (db + 90) / 90), 1)

		let curvedVolume = Math.pow(linearVolume, 2)
		curvedVolume = Math.min(Math.max(0, curvedVolume), 1)

		const smoothing = 0.9

		let smoothed = this.signalLevel ?? curvedVolume
		smoothed += (curvedVolume - smoothed) * smoothing

		this.signalLevel = smoothed < 0.01 ? 0 : smoothed
		return this.signalLevel
	}

	delete(): void {
		this.setMidiDevice()
		getAudioStore().removeSynth(this.id)
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

		this.state.transpose += value
	}

	setMaxPolyphony(value: number) {
		if (typeof value !== 'number') return

		this.state.maxPolyphony = value
	}

	/**
	 * Assign a MIDI device to the synth
	 * @param device A MidiDevice object, or a string containing its ID
	 */
	setMidiDevice(device?: MidiDevice | string): void {
		if (typeof device === 'string') device = getAudioStore().getMidiDevice(device)

		if (device == undefined) {
			this.midiDevice = null
			return
		}

		this.midiDevice?.removeSynth(this.id)
		device.addSynth(this.id)
		this.midiDevice = device
	}

	/**
	 * Return the synth's preset name, or wave type if no preset is set.
	 */
	getPresetOrType(): string {
		return this.state.preset ?? this.state.type
	}

	isAudible(): boolean {
		return !this.bypass && (this.signalLevel > 0 || Object.keys(this.oscillators).length > 0)
	}

	isPlaying(): boolean {
		return !this.bypass && Object.keys(this.oscillators).length > 0
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
		return Object.keys(this.oscillators).length < this.state.maxPolyphony + offset
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
		this.state.notes.add(semitone)

		// const frequency = Global.getFrequency(transposed.note, transposed.octave)
		if (semitone == undefined || this.isSemitonePlaying(semitone)) return

		// Max polyphony reached
		if (!this.hasFreeNotes()) {
			const oldest = this.getOldestOscillator()!

			if (this.state.legato) {
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
		this.state.notes.delete(semitone)

		if (this.noteQueue.includes(semitone)) {
			this.removeFromQueue(semitone)
			return
		}

		const oscillator = this.getOscillator(semitone)

		if (semitone == undefined || oscillator == undefined) return

		// If there are queued notes and space to unqueue
		if (this.hasFreeNotes(true) && this.hasQueuedNotes()) {
			const newSemitone = this.noteQueue.pop()!

			if (this.state.legato) {
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

		if (this.state.glide) {
			oscillator.glideToNote(semitone, this.state.glideAmount)

			if (!!volume) oscillator.glideToVelocity(volume, this.state.glideAmount)
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
		this.state.notes.clear()
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
		this.state.preset = undefined

		if (this.state.type == type) return
		this.state.type = type
	}

	setPreset(preset?: string) {
		if (this.state.preset == preset) return

		this.state.type = 'custom'
		this.state.preset = preset ?? undefined
	}

	setWavetable(wavetable: Array<number>) {
		if (wavetable == undefined || wavetable.length <= 0) {
			wavetable = [0, 1]
			this.state.wavetable = new Array(16).fill(0)
		} else {
			this.state.wavetable = [...wavetable]
		}

		// Presets assume stretch value of 4
		const transformed = FFT(wavetable, 4)

		const max = Math.max(...transformed.real.map(Math.abs), ...transformed.imag.map(Math.abs))

		if (max > 0) {
			for (let i = 0; i < transformed.real.length; i++) {
				transformed.real[i] /= max
				transformed.imag[i] /= max
			}
		}

		// Create a PeriodicWave
		this.periodicWave = Global.context.createPeriodicWave(transformed.real, transformed.imag)
	}

	clearWavetable() {
		this.state.wavetable = null
		this.periodicWave = null
	}
}
