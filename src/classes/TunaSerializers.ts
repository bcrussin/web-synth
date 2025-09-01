import type { Convolver } from '@/components/synth-effects/ConvolverEffect.vue'
import type { Delay } from '@/components/synth-effects/DelayEffect.vue'
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
