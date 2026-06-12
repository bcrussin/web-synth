import Global from './Audio'
import type Envelope from './Envelope'

export class EnvelopeNode {
	node: AudioWorkletNode
	gate: AudioParam
	envelope: Envelope

	constructor(envelope: Envelope) {
		this.node = new AudioWorkletNode(Global.context, 'envelope-processor')
		this.envelope = envelope
		this.gate = this.node.parameters.get('gate')!
		this.updateParameters()
	}

	updateParameters() {
		const p = this.node.parameters

		p.get('attack')!.value = this.envelope.attack
		p.get('decay')!.value = this.envelope.decay
		p.get('sustain')!.value = this.envelope.sustain
		p.get('release')!.value = this.envelope.release

		p.get('attackCurve')!.value = this.envelope.attackCurve
		p.get('decayCurve')!.value = this.envelope.decayCurve
		p.get('releaseCurve')!.value = this.envelope.releaseCurve
	}

	trigger(isAttack: boolean) {
		if (isAttack) this.triggerOn()
		else this.triggerOff()
	}

	triggerOn() {
		this.gate.setValueAtTime(1, Global.context.currentTime)
	}

	triggerOff() {
		this.gate.setValueAtTime(0, Global.context.currentTime)
	}
}
