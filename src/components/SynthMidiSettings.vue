<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type Synth from '@/classes/Synth'
import { useMidiStore } from '@/stores/midiStore'

const effects: { [key: string]: string } = {
  convolver: 'Reverb',
  chorus: 'Chorus',
  delay: 'Delay',
  overdrive: 'Overdrive',
  // phaser: 'Phaser', Not currently functional
}

const props = defineProps<{ synth: Synth }>()
const midiStore = useMidiStore()

function getChannelParams() {
  return props.synth.midiDevice.synthParams[props.synth.name] ?? {}
}

function getChannelParam(channel: number) {
  return props.synth.midiDevice.synthParams[props.synth.name]?.[channel] ?? ''
}

function setChannelParam(channel: number, param: string) {
  props.synth.midiDevice.setChannelParam(channel, param, props.synth)
}
</script>

<template>
  <span class="section-label">Channel Parameters:</span>
  <div class="channel-params-list">
    <div v-for="channel in 16" :key="channel">
      <span>{{ channel }}:</span>
      <el-select
        :model-value="getChannelParam(channel)"
        @change="setChannelParam(channel, $event)"
        class="channel-dropdown"
        placeholder="None"
      >
        <el-option value=""> None </el-option>
        <el-option
          v-for="param in midiStore.params"
          :key="param.displayName"
          :label="param.displayName"
          :value="param.displayName"
        >
        </el-option>
      </el-select>
    </div>
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

.channel-params-list > div {
  flex: 1 1 20%;
  box-sizing: border-box;

  display: flex;
  gap: 8px;
  min-width: 120px;
}
</style>
