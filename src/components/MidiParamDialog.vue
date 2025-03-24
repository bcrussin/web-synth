<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type MidiDevice from '@/classes/MidiDevice'
import type { MidiChannelOptions } from '@/classes/MidiChannel'
import MidiChannel from '@/classes/MidiChannel'
import type Synth from '@/classes/Synth'
import { useMidiStore } from '@/stores/midiStore'
import { ref, watchEffect } from 'vue'

const props = defineProps<{ synth: Synth; channel: number }>()
const midiStore = useMidiStore()

const midiDevice = props.synth.midiDevice as MidiDevice
const settings = getChannelSettings()

function getChannelSettings(): MidiChannel {
  return midiDevice.channelSettings[props.synth.name]?.[props.channel] ?? null
}

function setChannelProperty(property: keyof MidiChannelOptions, value: any) {
  midiDevice.setChannelProperty(props.synth, props.channel, property, value)
}

function getChannelMinMax() {
  const settings = getChannelSettings()
  return [settings.min, settings.max]
}

function updateChannelMinMax(minMax: [number, number]) {
  const data = {
    min: minMax[0],
    max: minMax[1],
  }

  midiDevice.setChannelProperties(props.synth, props.channel, data)
}
</script>

<template>
  <el-dialog
    :title="`Channel ${channel}`"
    modal
    :model-value="true"
    :show-close="true"
    :style="{
      width: '90vw',
      maxWidth: '30rem',
    }"
  >
    <div class="control-item">
      <span>Linked Parameter:</span>
      <el-select
        :model-value="settings.param"
        @change="setChannelProperty('param', $event)"
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
    <div class="control-item">
      <span>Input Range:</span>

      <div class="flex-stretch">
        <el-slider
          range
          :min="0"
          :max="1"
          :model-value="getChannelMinMax()"
          :step="0.05"
          @input="updateChannelMinMax($event)"
        ></el-slider>
        <el-checkbox size="large" v-model="settings.inverted">Inverted</el-checkbox>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.flex-stretch {
  display: flex;
  justify-content: stretch;
  align-items: center;
  gap: 8px;
}

.control-item {
  margin: 12px 0;
}

.control-item > span {
  font-weight: bold;
  white-space: nowrap;
}

.el-slider {
  padding: 0 8px;
}
</style>
