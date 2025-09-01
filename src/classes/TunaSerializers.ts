import type { Chorus } from '@/components/synth-effects/ChorusEffect.vue'
import type { Convolver } from '@/components/synth-effects/ConvolverEffect.vue'
import type { Delay } from '@/components/synth-effects/DelayEffect.vue'
import type { Overdrive } from '@/components/synth-effects/OverdriveEffect.vue'
import Tuna from 'tunajs'

export function serializeTunaEffect(effect: Tuna.TunaAudioNode) {
	let data = {}

	switch (effect.name) {
		case 'Convolver':
			data = serializeTunaConvolver(effect as Convolver)
			break
		case 'Delay':
			data = serializeTunaDelay(effect as Delay)
			break
		case 'Chorus':
			data = serializeTunaChorus(effect as Chorus)
			break
		case 'Overdrive':
			data = serializeTunaOverdrive(effect as Overdrive)
			break
	}
	return data
}

export function serializeTunaConvolver(effect: Convolver) {
	return {
		type: 'Convolver',
		wetLevel: effect.wetLevel.value,
		impulseDuration: (effect as any).impulseDuration,
	}
}

export function serializeTunaDelay(effect: Delay) {
	return {
		type: 'Delay',
		feedback: effect.feedback.value,
		delayTime: effect.delayTime.value,
		wetLevel: effect.wetLevel.value,
	}
}

export function serializeTunaChorus(effect: Chorus) {
	return {
		type: 'Chorus',
		depth: effect.depth,
		rate: effect.rate,
		feedback: effect.feedback,
	}
}

export function serializeTunaOverdrive(effect: Overdrive) {
	return {
		type: 'Overdrive',
		outputGain: effect.outputDrive.gain.value,
		drive: effect.inputDrive.gain.value,
		curveAmount: effect.curveAmount,
		algorithmIndex: effect.algorithmIndex,
	}
}
