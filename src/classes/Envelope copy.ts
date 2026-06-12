export interface EnvelopeOptions {
	attack?: number
	attackCurve?: number
	decay?: number
	decayCurve?: number
	sustain?: number
	release?: number
	releaseCurve?: number
}

interface EnvelopeSegment {
	startTime: number
	startValue: number
	targetValue: number
	curve: number
}

const Defaults: Record<keyof EnvelopeOptions, number> = {
	attack: 0,
	attackCurve: 1,
	decay: 0,
	decayCurve: 1,
	sustain: 1,
	release: 0.01,
	releaseCurve: 1,
}

export default class Envelope {
	ctx: AudioContext
	targetNode: AudioParam

	attack: number
	attackCurve: number
	decay: number
	decayCurve: number
	sustain: number
	release: number
	releaseCurve: number

	#scheduledSegments: EnvelopeSegment[] = []

	constructor(ctx: AudioContext, targetNode: AudioParam, options: EnvelopeOptions) {
		this.ctx = ctx
		this.targetNode = targetNode

		this.attack = options.attack ?? Defaults.attack
		this.attackCurve = options.attackCurve ?? Defaults.attackCurve
		this.decay = options.decay ?? Defaults.decay
		this.decayCurve = options.decayCurve ?? Defaults.decayCurve
		this.sustain = options.sustain ?? Defaults.sustain
		this.release = options.release ?? Defaults.release
		this.releaseCurve = options.releaseCurve ?? Defaults.releaseCurve
	}

	#getCurrentSegment(time: number, cancelRemaining: boolean = false) {
		let segmentFound = false

		this.#scheduledSegments = this.#scheduledSegments.filter((segment, index, segments) => {
			if (index < segments.length - 1 && time < segments[index + 1].startTime) {
				return false
			}

			if (cancelRemaining && segmentFound) {
				return false
			}

			segmentFound = true
			return true
		})

		return this.#scheduledSegments[0]
	}

	#scheduleSegment(startTime: number, startValue: number, targetValue: number, curve: number) {
		this.targetNode.setValueAtTime(startValue, startTime)
		this.targetNode.setTargetAtTime(targetValue, startTime, curve)

		this.#scheduledSegments.push({
			startTime,
			startValue,
			targetValue,
			curve,
		})
	}

	trigger(isAttack: boolean, time?: number) {
		if (isAttack) this.triggerOn(time)
		else this.triggerOff(time)
	}

	triggerOn(time?: number) {
		time = time ?? this.ctx.currentTime

		this.#scheduleAtTime(time, 1, this.attack)
	}

	triggerOff(time?: number) {
		time = time ?? this.ctx.currentTime
		this.#getCurrentSegment(this.ctx.currentTime, true)

		this.#scheduleAtTime(time, 0, this.release)
	}

	#scheduleAtTime(time: number, targetValue: number, duration: number) {
		const currentSegment = this.#getCurrentSegment(time, true)

		let currentValue = this.targetNode.value
		if (!!currentSegment)
			currentValue =
				currentSegment.targetValue +
				(currentSegment.startValue - currentSegment.targetValue) *
					Math.exp((currentSegment.startTime - time) / currentSegment.curve)

		this.targetNode.cancelScheduledValues(time)
		this.#scheduleSegment(time, currentValue, targetValue, duration)
	}

	#scheduleAtValue(startValue: number, targetValue: number, duration: number) {
		const lastSegment = this.#scheduledSegments[this.#scheduledSegments.length - 1]

		const startTime =
			Math.abs(
				Math.log(
					((lastSegment.targetValue - startValue) /
						(lastSegment.targetValue - lastSegment.startValue)) *
						lastSegment.curve,
				),
			) + lastSegment.startTime

		this.#scheduleSegment(startTime, startValue, targetValue, duration)
	}
}
