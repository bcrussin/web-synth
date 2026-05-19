import { getAudioStore } from '@/stores/audioStore'
import type Synth from '../classes/Synth'
import type { SynthOptions } from '../classes/Synth'

export default class SynthState {
	synth: Synth

	name: string

	type: string
	preset: string | undefined

	wavetable: Array<number> | null = null
	notes: Set<number> = new Set<number>()

	private _maxPolyphony: number

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
	set glideAmountMs(ms: number) {
		this.glideAmount = ms / 1000
	}

	get glide() {
		return this._glide
	}

	set glide(enabled: boolean) {
		this._glide = enabled

		if (enabled) this.legato = true
	}

	_transpose: number = 0
	public get transpose(): number {
		return this._transpose ?? 0
	}
	public set transpose(value: number) {
		if (typeof value !== 'number') return

		this._transpose = value
		this.synth.updateOscillatorNotes()
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

	constructor(synth: Synth, options: SynthOptions) {
		this.synth = synth

		this.name = options.name ?? `Synth ${Object.keys(getAudioStore().synths).length + 1}`
		this.type = options.type ?? 'sine'

		this._maxPolyphony = options._maxPolyphony ?? Infinity
		this.legato = options.legato ?? true
		this.glide = options.glide ?? false
		this.glideMode = options.glideMode ?? 'speed'
		this.glideAmount = options.glideAmount ?? 0.1
	}
}
