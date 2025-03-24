import { reactive } from 'vue'
import type MidiDevice from './MidiDevice'
import type Synth from './Synth'
import type MidiChannel from './MidiChannel'

export default class MidiManager {
  private static channelsByDevice = reactive(
    new Map<string, Map<string, Map<number, MidiChannel>>>(),
  )
  private static channelsBySynth = reactive(new Map<string, Map<number, MidiChannel>>())
  private static globalChannels = reactive(new Map<string, Map<number, MidiChannel>>())

  static registerChannel(channel: MidiChannel) {
    const deviceName = channel.device.name

    if (channel.isGlobal) {
      if (!this.globalChannels.has(deviceName)) {
        this.globalChannels.set(deviceName, new Map())
      }

      const deviceChannels = this.globalChannels.get(deviceName)
      deviceChannels!.set(channel.channelNumber, channel)
    } else {
      if (!this.channelsByDevice.has(deviceName)) {
        this.channelsByDevice.set(deviceName, new Map())
      }

      const deviceSynths = this.channelsByDevice.get(deviceName)

      Object.values(channel.synths).forEach((synth) => {
        if (!deviceSynths!.has(synth.name)) {
          this.channelsByDevice.get(deviceName)!.set(synth.name, new Map())
        }

        const synthChannels = deviceSynths!.get(synth.name)
        synthChannels!.set(channel.channelNumber, channel)

        if (!this.channelsBySynth.has(synth.name)) {
          this.channelsBySynth.set(synth.name, new Map())
        }
        this.channelsBySynth.get(synth.name)!.set(channel.channelNumber, channel)
      })
    }

    console.log('___')
    console.log(this.channelsByDevice)
    console.log(this.channelsBySynth)
  }

  static unregisterChannel(channel: MidiChannel) {
    const deviceName = channel.device.name

    if (channel.isGlobal) {
      this.globalChannels.delete(deviceName)
    } else {
      Object.values(channel.synths).forEach((synth) => {
        this.channelsByDevice.get(deviceName)?.get(synth.name)?.delete(channel.channelNumber)

        this.channelsBySynth.get(synth.name)?.delete(channel.channelNumber)
      })
    }
  }

  static getChannel(
    device: MidiDevice,
    synth: Synth,
    channelNumber: number,
  ): MidiChannel | undefined {
    return this.channelsByDevice.get(device.name)?.get(synth.name)?.get(channelNumber)
  }

  static getChannelsForSynth(synth: Synth): MidiChannel[] {
    return Array.from(this.channelsBySynth.get(synth.name) ?? [])
  }

  static getChannelsForDevice(device: MidiDevice): MidiChannel[] {
    return Array.from(this.channelsByDevice.get(device.name)?.values() ?? []).flatMap((synthMap) =>
      Array.from(synthMap.values()),
    )
  }

  static getChannelsForDeviceAndSynth(device: MidiDevice, synth: Synth): MidiChannel[] {
    return Array.from(this.channelsByDevice.get(device.name)?.get(synth.name) ?? [])
  }

  static getGlobalChannel(device: MidiDevice): MidiChannel | undefined {
    return this.globalChannels.get(device.name)
  }

  // static applyGlobalChannel(device: MidiDevice) {
  //   const globalChannel = this.globalChannels.get(device)
  //   if (!globalChannel) return

  //   const linkedSynths = new Set<Synth>(this.getChannelsForDevice(device).map((ch) => ch.synth))

  //   linkedSynths.forEach((synth) => synth.applyMidiChannel(globalChannel))
  // }
}
