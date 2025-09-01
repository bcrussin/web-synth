import type { TunaAudioNode } from 'tunajs'
import type Tuna from 'tunajs'
import Global from './Audio'

export function loadTunaEffect(tuna: Tuna, data: any): TunaAudioNode | null {
	let effect: TunaAudioNode | null = null

	switch (data.type) {
		case 'Convolver':
			effect = loadTunaConvolver(tuna, data)
			break
		case 'Delay':
			effect = loadTunaDelay(tuna, data)
			break
	}

	return effect
}

function loadTunaConvolver(tuna: Tuna, data: any): TunaAudioNode {
	const effect = new tuna.Convolver({
		wetLevel: data.wetLevel,
	})

	effect.convolver.buffer = Global.generateImpulseReponse(
		data.impulseDuration,
		data.impulseDuration,
		false,
	)

	;(effect as any).impulseDuration = data.impulseDuration

	return effect
}

function loadTunaDelay(tuna: Tuna, data: any): TunaAudioNode {
	const effect = new tuna.Delay({
		feedback: data.feedback,
		delayTime: data.delayTime,
		wetLevel: data.wetLevel,
	})

	return effect
}
