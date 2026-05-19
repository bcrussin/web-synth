import MidiDevice from './MidiDevice'
import type Synth from './Synth'
import type MidiChannel from './MidiChannel'
import { getAudioStore } from '@/stores/audioStore'
export default class MidiManager {
	static registerChannel(channel: MidiChannel) {
		const deviceName = channel.device.name

		if (channel.isGlobal) {
			if (!getAudioStore().globalMidiChannels.has(deviceName)) {
				getAudioStore().globalMidiChannels.set(deviceName, new Set())
			}

			const deviceChannels = getAudioStore().globalMidiChannels.get(deviceName)
			deviceChannels!.add(channel)
		} else {
			if (!getAudioStore().midiChannelsByDevice.has(deviceName)) {
				getAudioStore().midiChannelsByDevice.set(deviceName, new Map())
			}

			const deviceSynths = getAudioStore().midiChannelsByDevice.get(deviceName)

			for (const synthId of channel.synthIds) {
				if (!deviceSynths!.has(synthId)) {
					getAudioStore().midiChannelsByDevice.get(deviceName)!.set(synthId, new Set())
				}

				const synthChannels = deviceSynths!.get(synthId)
				synthChannels!.add(channel)

				if (!getAudioStore().midiChannelsBySynth.has(synthId)) {
					getAudioStore().midiChannelsBySynth.set(synthId, new Set())
				}
				getAudioStore().midiChannelsBySynth.get(synthId)!.add(channel)
			}
		}
	}

	static unregisterChannel(channel: MidiChannel) {
		const deviceName = channel.device.name

		if (channel.isGlobal) {
			getAudioStore().globalMidiChannels.delete(deviceName)
		} else {
			for (const synthId of channel.synthIds) {
				getAudioStore().midiChannelsByDevice.get(deviceName)?.get(synthId)?.delete(channel)

				getAudioStore().midiChannelsBySynth.get(synthId)?.delete(channel)
			}
		}
	}

	static getChannels(device: MidiDevice, synth: Synth, channelNumber: number): MidiChannel[] {
		if (!device) return []

		const allChannels = Array.from(
			getAudioStore().midiChannelsByDevice.get(device.name)?.get(synth.id) ?? [],
		)
		return Array.from(allChannels.filter((channel) => channel.channelNumber == channelNumber))
	}

	static getChannelsForDevice(device: MidiDevice): MidiChannel[] {
		return Array.from(
			getAudioStore().midiChannelsByDevice.get(device.name)?.values() ?? [],
		).flatMap((synthMap) => Array.from(synthMap.values()))
	}

	static getChannelsForDeviceAndSynth(device: MidiDevice | null, synth: Synth): MidiChannel[] {
		if (!device) return []

		return Array.from(getAudioStore().midiChannelsByDevice.get(device.name)?.get(synth.id) ?? [])
	}

	// static applyGlobalChannel(device: MidiDevice) {
	//   const globalChannel = this.globalChannels.get(device)
	//   if (!globalChannel) return

	//   const linkedSynths = new Set<Synth>(this.getChannelsForDevice(device).map((ch) => ch.synth))

	//   linkedSynths.forEach((synth) => synth.applyMidiChannel(globalChannel))
	// }
}
