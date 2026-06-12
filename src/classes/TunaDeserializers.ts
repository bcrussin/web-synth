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
		case 'Chorus':
			effect = loadTunaChorus(tuna, data)
			break
		case 'Overdrive':
			effect = loadTunaOverdrive(tuna, data)
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
		delayTime: data.delayTime * 1000,
		wetLevel: data.wetLevel,
	})

	return effect
}

function loadTunaChorus(tuna: Tuna, data: any): TunaAudioNode {
	const effect = new tuna.Chorus({
		depth: data.depth,
		rate: data.rate,
		feedback: data.feedback,
	})

	return effect
}

function loadTunaOverdrive(tuna: Tuna, data: any): TunaAudioNode {
	const effect = new tuna.Overdrive({
		drive: data.drive.value,
		curveAmount: data.curveAmount,
		algorithmIndex: data.algorithmIndex,
	})

	effect.outputDrive.gain.value = data.outputGain
	effect.inputDrive.gain.value = data.drive

	return effect
}
