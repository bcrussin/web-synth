<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type Synth from '@/classes/Synth'
import { useMidiStore } from '@/stores/midiStore'
import MidiParamDialog from '@/components/MidiParamDialog.vue'
import { ref, type Ref } from 'vue'
import MidiManager from '@/classes/MidiManager'
import type MidiChannel from '@/classes/MidiChannel'
import type { MidiChannelOptions } from '@/classes/MidiChannel'
import type MidiDevice from '@/classes/MidiDevice'

const effects: { [key: string]: string } = {
  convolver: 'Reverb',
  chorus: 'Chorus',
  delay: 'Delay',
  overdrive: 'Overdrive',
  // phaser: 'Phaser', Not currently functional
}

const props = defineProps<{ synth: Synth }>()
const dialogChannel: Ref<MidiChannel | undefined> = ref(undefined)
const midiDevice = props.synth.midiDevice as MidiDevice

function getChannelProperties(channelNumber: number) {
  console.log(MidiManager.getChannels(props.synth.midiDevice, props.synth, channelNumber))
  return MidiManager.getChannels(props.synth.midiDevice, props.synth, channelNumber)
}

function getChannelProperty(channel: MidiChannel, property: keyof MidiChannelOptions) {
  return channel?.getProperty(property)
}

function getIndicatorStyles(channel: number) {
  const value = midiDevice.channelValues[channel]

  const style: any = {}

  style.left = 0
  style.width = value * 100 + '%'

  return style
}

function channelExists(channelNumber: number) {
  return !!getChannelProperties(channelNumber)
}

function getExistingChannels(): MidiChannel[] {
  const channels = []

  for (let i = 0; i < 16; i++) {
    if (getChannelProperties(i)?.length > 0) channels.push(getChannelProperties(i)![0])
  }

  console.log('existing')
  console.log(channels)
  return channels
}
</script>

<template>
  <span class="section-label">Channel Settings:</span>
  <div class="channel-params-list">
    <div
      class="channel-param"
      v-for="channel in getExistingChannels()"
      :channelProperties="1"
      :key="channel.channelNumber"
    >
      <span>{{ channel.channelNumber }}:</span>

      <div class="channel-button-container">
        <el-button class="channel-button" @click="dialogChannel = channel">{{
          channel.param || 'None'
        }}</el-button>
        <div class="channel-value" :style="getIndicatorStyles(channel.channelNumber)"></div>
      </div>
    </div>
  </div>

  <MidiParamDialog
    v-if="dialogChannel"
    :channel="dialogChannel"
    @update:model-value="() => (dialogChannel = undefined)"
  ></MidiParamDialog>
</template>

<style scoped>
.section-label {
  font-weight: bold;
}

.channel-params-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
}

.channel-param {
  flex: 1 1 20%;
  box-sizing: border-box;

  display: flex;
  gap: 8px;
  min-width: 120px;
}

.channel-param > span {
  flex: 0 0 2ch;
}

.channel-button-container {
  position: relative;
  width: 100%;
}

.channel-button {
  width: 100%;
}

.channel-value {
  content: '';
  position: absolute;
  bottom: 0;
  height: 4px;
  background-color: var(--primary-color);
}
</style>
