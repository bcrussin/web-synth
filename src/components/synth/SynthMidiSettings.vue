<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type Synth from '@/classes/Synth'
import { useMidiStore } from '@/stores/midiStore'
import MidiParamDialog from '@/components/MidiParamDialog.vue'
import { ref } from 'vue'
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
const dialogChannel = ref(-1)
const midiDevice = props.synth.midiDevice as MidiDevice

function getChannelProperties(channel: number): MidiChannel {
  return props.synth.midiDevice.channelSettings[props.synth.name]?.[channel]
}

function getChannelProperty(channel: number, property: keyof MidiChannelOptions) {
  const channelProps = getChannelProperties(channel)

  return channelProps.getProperty(property)
}

function getIndicatorStyles(channel: number) {
  const value = midiDevice.channelValues[channel]

  const style: any = {}

  style.left = 0
  style.width = value * 100 + '%'

  return style
}
</script>

<template>
  <span class="section-label">Channel Settings:</span>
  <div class="channel-params-list">
    <div class="channel-param" v-for="channel in 16" :key="channel">
      <span>{{ channel }}:</span>

      <div class="channel-button-container">
        <el-button class="channel-button" @click="dialogChannel = channel">{{
          getChannelProperty(channel, 'param') || 'None'
        }}</el-button>
        <div class="channel-value" :style="getIndicatorStyles(channel)"></div>
      </div>
    </div>
  </div>

  <MidiParamDialog
    v-if="dialogChannel >= 0"
    :synth="synth"
    :channel="dialogChannel"
    @update:model-value="() => (dialogChannel = -1)"
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
