import { reactive } from 'vue'
import type MidiDevice from './MidiDevice'
import type Synth from './Synth'
import type MidiChannel from './MidiChannel'

export default class MidiManager {
  private static channelsByDevice = reactive(
    new Map<MidiDevice, Map<Synth, Map<number, MidiChannel>>>(),
  )
  private static channelsBySynth = reactive(new Map<Synth, Set<MidiChannel>>())
  private static globalChannels = reactive(new Map<MidiDevice, MidiChannel>())

  static registerChannel(channel: MidiChannel) {
    if (channel.isGlobal) {
      this.globalChannels.set(channel.device, channel)
    } else {
      if (!this.channelsByDevice.has(channel.device)) {
        this.channelsByDevice.set(channel.device, new Map())
      }

      const deviceSynths = this.channelsByDevice.get(channel.device)

      Object.values(channel.synths).forEach((synth) => {
        if (!deviceSynths!.has(synth)) {
          this.channelsByDevice.get(channel.device)!.set(synth, new Map())
        }

        const synthChannels = deviceSynths!.get(synth)
        synthChannels!.set(channel.channelNumber, channel)

        if (!this.channelsBySynth.has(synth)) {
          this.channelsBySynth.set(synth, new Set())
        }
        this.channelsBySynth.get(synth)!.add(channel)
      })
    }
  }

  static unregisterChannel(channel: MidiChannel) {
    if (channel.isGlobal) {
      this.globalChannels.delete(channel.device)
    } else {
      Object.values(channel.synths).forEach((synth) => {
        this.channelsByDevice.get(channel.device)?.get(synth)?.delete(channel.channelNumber)

        this.channelsBySynth.get(synth)?.delete(channel)
      })
    }
  }

  static getChannel(
    device: MidiDevice,
    synth: Synth,
    channelNumber: number,
  ): MidiChannel | undefined {
    return this.channelsByDevice.get(device)?.get(synth)?.get(channelNumber)
  }

  static getChannelsForSynth(synth: Synth): MidiChannel[] {
    return Array.from(this.channelsBySynth.get(synth) ?? [])
  }

  static getChannelsForDevice(device: MidiDevice): MidiChannel[] {
    return Array.from(this.channelsByDevice.get(device)?.values() ?? []).flatMap((synthMap) =>
      Array.from(synthMap.values()),
    )
  }

  static getGlobalChannel(device: MidiDevice): MidiChannel | undefined {
    return this.globalChannels.get(device)
  }

  // static applyGlobalChannel(device: MidiDevice) {
  //   const globalChannel = this.globalChannels.get(device)
  //   if (!globalChannel) return

  //   const linkedSynths = new Set<Synth>(this.getChannelsForDevice(device).map((ch) => ch.synth))

  //   linkedSynths.forEach((synth) => synth.applyMidiChannel(globalChannel))
  // }
}
