import type MidiDevice from '@/classes/MidiDevice'
import { bindProp } from '@/utilities/bindProp'
import { reactive, toRef } from 'vue'

export function useMidiDevice(midiDevice: MidiDevice) {
	const reactiveDevice = reactive(midiDevice)

	return reactiveDevice

	// return {
	// 	device: reactiveDevice,
	// 	id: bindProp(reactiveDevice, 'id'),
	// 	name: bindProp(reactiveDevice, 'name'),
	// 	channelValues: toRef(midiDevice, 'channelValues'),
	// 	channelSettings: toRef(midiDevice, 'channelSettings'),
	// 	pitchBend: bindProp(reactiveDevice, 'pitchBend'),
	// 	velocityCurve: bindProp(reactiveDevice, 'velocityCurve'),
	// }
}
