<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type Synth from '@/classes/Synth'
import { useMidiStore } from '@/stores/midiStore'
import MidiParamDialog from './MidiParamDialog.vue'
import { ref } from 'vue'
import type MidiChannel from '@/classes/MidiChannel'
import type { MidiChannelOptions } from '@/classes/MidiChannel'

const effects: { [key: string]: string } = {
  convolver: 'Reverb',
  chorus: 'Chorus',
  delay: 'Delay',
  overdrive: 'Overdrive',
  // phaser: 'Phaser', Not currently functional
}

const props = defineProps<{ synth: Synth }>()
const dialogChannel = ref(-1)

function getChannelProperties(channel: number): MidiChannel {
  return props.synth.midiDevice.channelSettings[props.synth.name]?.[channel]
}

function getChannelProperty(channel: number, property: keyof MidiChannelOptions) {
  const channelProps = getChannelProperties(channel)

  return channelProps.getProperty(property)
}
</script>

<template>
  <span class="section-label">Channel Settings:</span>
  <div class="channel-params-list">
    <div v-for="channel in 16" :key="channel">
      <span>{{ channel }}:</span>
      <el-button @click="dialogChannel = channel">{{
        getChannelProperty(channel, 'param') || 'None'
      }}</el-button>
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

.channel-params-list > div {
  flex: 1 1 20%;
  box-sizing: border-box;

  display: flex;
  gap: 8px;
  min-width: 120px;
}
</style>
