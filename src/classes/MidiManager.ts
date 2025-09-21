import { reactive, shallowReactive, type Reactive } from 'vue'
import MidiDevice from './MidiDevice'
import type Synth from './Synth'
import type MidiChannel from './MidiChannel'

type MidiChannelLike = MidiChannel | Reactive<MidiChannel>

export default class MidiManager {
	static channelsByDevice = reactive(new Map<string, Map<UUID, Set<MidiChannel>>>())
	static channelsBySynth = reactive(new Map<UUID, Set<MidiChannel>>())
	static globalChannels = reactive<Map<string, Set<MidiChannel>>>(new Map())

	static registerChannel(channel: MidiChannelLike) {
		const deviceName = channel.device.name

		if (channel.isGlobal) {
			if (!this.globalChannels.has(deviceName)) {
				this.globalChannels.set(deviceName, new Set())
			}

			const deviceChannels = this.globalChannels.get(deviceName)
			deviceChannels!.add(reactive(channel))
		} else {
			if (!this.channelsByDevice.has(deviceName)) {
				this.channelsByDevice.set(deviceName, new Map())
			}

			const deviceSynths = this.channelsByDevice.get(deviceName)

			Object.values(channel.synths).forEach((synth) => {
				if (!deviceSynths!.has(synth.id)) {
					this.channelsByDevice.get(deviceName)!.set(synth.id, new Set())
				}

				const synthChannels = deviceSynths!.get(synth.id)
				synthChannels!.add(reactive(channel))

				if (!this.channelsBySynth.has(synth.id)) {
					this.channelsBySynth.set(synth.id, new Set())
				}
				this.channelsBySynth.get(synth.id)!.add(reactive(channel))
			})
		}
	}

	static unregisterChannel(channel: MidiChannelLike) {
		const deviceName = channel.device.name

		if (channel.isGlobal) {
			this.globalChannels.delete(deviceName)
		} else {
			Object.values(channel.synths).forEach((synth) => {
				this.channelsByDevice.get(deviceName)?.get(synth.id)?.delete(reactive(channel))

				this.channelsBySynth.get(synth.id)?.delete(reactive(channel))
			})
		}
	}

	static getChannels(
		device: MidiDevice,
		synth: Synth,
		channelNumber: number,
	): Reactive<MidiChannel[]> {
		if (!device) return []

		const allChannels = Array.from(this.channelsByDevice.get(device.name)?.get(synth.id) ?? [])
		return Array.from(allChannels.filter((channel) => channel.channelNumber == channelNumber))
	}

	static getChannelsForSynth(synth: Synth): Reactive<MidiChannel[]> {
		return Array.from(this.channelsBySynth.get(synth.id) ?? [])
	}

	static getChannelsForDevice(device: MidiDevice): Reactive<MidiChannel[]> {
		return Array.from(this.channelsByDevice.get(device.name)?.values() ?? []).flatMap((synthMap) =>
			Array.from(synthMap.values()),
		)
	}

	static getChannelsForDeviceAndSynth(
		device: MidiDevice | null,
		synth: Synth,
	): Reactive<MidiChannel[]> {
		if (!device) return []

		return Array.from(this.channelsByDevice.get(device.name)?.get(synth.id) ?? [])
	}

	static getGlobalChannels(device: MidiDevice): Reactive<Set<MidiChannel>> | undefined {
		return this.globalChannels.get(device.name)
	}

	// static applyGlobalChannel(device: MidiDevice) {
	//   const globalChannel = this.globalChannels.get(device)
	//   if (!globalChannel) return

	//   const linkedSynths = new Set<Synth>(this.getChannelsForDevice(device).map((ch) => ch.synth))

	//   linkedSynths.forEach((synth) => synth.applyMidiChannel(globalChannel))
	// }
}
