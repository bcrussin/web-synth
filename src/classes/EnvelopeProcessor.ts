type Parameters = Record<Parameter, Float32Array>

type Parameter =
	| 'gate'
	| 'attack'
	| 'decay'
	| 'sustain'
	| 'release'
	| 'attackCurve'
	| 'decayCurve'
	| 'releaseCurve'

enum EnvState {
	Idle,
	Attack,
	Decay,
	Sustain,
	Release,
}

/** AudioWorklet that applies an ADSR envelope to the connected channel. */
class EnvelopeProcessor extends AudioWorkletProcessor {
	state: EnvState = EnvState.Idle
	currentPos: number = 0

	value: number = 0
	releaseStartValue: number = 0

	static get parameterDescriptors() {
		return [
			{ name: 'attack', automationRate: 'k-rate' },
			{ name: 'decay', automationRate: 'k-rate' },
			{ name: 'sustain', automationRate: 'k-rate' },
			{ name: 'release', automationRate: 'k-rate' },

			{ name: 'attackCurve', automationRate: 'k-rate' },
			{ name: 'decayCurve', automationRate: 'k-rate' },
			{ name: 'releaseCurve', automationRate: 'k-rate' },
			{
				name: 'gate',
				defaultValue: 0,
				automationRate: 'a-rate',
			},
		]
	}

	getVolume(parameters: Parameters): number {
		const gate = parameters.gate[0]

		return gate
	}

	setState(state: EnvState) {
		this.state = state
		this.currentPos = 0
	}

	updateState(parameters: Parameters) {
		const gate = parameters.gate[0]

		if (gate > 0) {
			if (this.state === EnvState.Idle || this.state === EnvState.Release) {
				this.setState(EnvState.Attack)
			}
		} else {
			if (this.state !== EnvState.Idle && this.state !== EnvState.Release) {
				this.setState(EnvState.Release)
				this.releaseStartValue = this.value
			}
		}
	}

	getParamValue(parameters: Parameters, paramName: Parameter) {
		return parameters[paramName]?.[0]
	}

	computeEnvelope(parameters: Parameters): number {
		switch (this.state) {
			case EnvState.Attack:
				return this.calculateAttack(parameters)
			case EnvState.Decay:
				return this.calculateDecay(parameters)
			case EnvState.Sustain:
				return this.calculateSustain(parameters)
			case EnvState.Release:
				return this.calculateRelease(parameters)
		}

		return 0
	}

	calculateStateProgress(duration: number) {
		const durationSeconds = duration / 1000
		return this.currentPos / (durationSeconds * sampleRate)
	}

	calculateAttack(parameters: Parameters): number {
		const attack = this.getParamValue(parameters, 'attack')
		const attackCurve = this.getParamValue(parameters, 'attackCurve')

		let progress = this.calculateStateProgress(attack)

		if (progress >= 1) {
			progress = 1
			this.setState(EnvState.Decay)
			this.value = 1
			return this.value
		}

		this.value = Math.pow(progress, attackCurve)
		this.currentPos++
		return this.value
	}

	// TODO: Fix overshoot (dips below sustain volume momentarily)
	calculateDecay(parameters: Parameters): number {
		const decay = this.getParamValue(parameters, 'decay')
		const decayCurve = this.getParamValue(parameters, 'decayCurve')
		const sustain = this.getParamValue(parameters, 'sustain')

		let progress = this.calculateStateProgress(decay)

		if (progress >= 1) {
			this.setState(EnvState.Sustain)
			progress = 1
			this.value = sustain
			return sustain
		}

		const percent = Math.pow(progress, decayCurve)
		this.value = 1 + (sustain - 1) * percent

		// const linear = progress
		// const start = 1
		// const end = sustain

		// const shaped =
		// 	decayCurve === 1 ? linear : (Math.exp(decayCurve * linear) - 1) / (Math.exp(decayCurve) - 1)

		// this.value = start + (end - start) * shaped

		this.currentPos++
		return this.value
	}

	calculateSustain(parameters: Parameters): number {
		this.value = this.getParamValue(parameters, 'sustain')
		return this.value
	}

	calculateRelease(parameters: Parameters): number {
		const release = this.getParamValue(parameters, 'release')
		const releaseCurve = this.getParamValue(parameters, 'releaseCurve')

		let progress = this.calculateStateProgress(release)

		if (progress >= 1) {
			this.setState(EnvState.Idle)
			this.value = 0
			return 0
		}

		const percent = Math.pow(progress, releaseCurve)
		this.value = this.releaseStartValue * (1 - percent)
		this.currentPos++
		return this.value
	}

	process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Parameters): boolean {
		// Assumes only one connected channel, address if this becomes a problem
		const input = inputs[0]
		const output = outputs[0]

		if (input.length === 0) {
			return true
		}

		for (let i = 0; i < input[0].length; i++) {
			this.updateState(parameters)
			const volume = this.computeEnvelope(parameters)

			for (let channel = 0; channel < input.length; channel++) {
				output[channel][i] = input[channel][i] * volume
			}
		}

		return true
	}
}

registerProcessor('envelope-processor', EnvelopeProcessor)
