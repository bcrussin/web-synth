<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type Synth from '@/classes/Synth'
import MidiManager from '@/classes/MidiManager'

const props = defineProps<{ synth: Synth }>()

function getChannels(channelNumber: number) {
  return MidiManager.getChannels(props.synth.midiDevice, props.synth, channelNumber)
}

function channelExists(channelNumber: number) {
  return !!getChannels(channelNumber)
}
</script>

<template>
  <span class="section-label">Channel Settings:</span>
  <div class="channel-params-list">
    <template v-for="channelNumber in 16" :key="channelNumber">
      <div
        class="channel-param"
        v-if="channelExists(channelNumber)"
        :channelProperties="1"
        :key="channelNumber"
      >
        <span>{{ channelNumber }}:</span>
        <MidiChannelButton :synth="props.synth" :channelNumber="channelNumber"></MidiChannelButton>
      </div>
    </template>
  </div>
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
</style>
