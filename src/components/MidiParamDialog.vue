<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type MidiDevice from '@/classes/MidiDevice'
import type { MidiChannelOptions } from '@/classes/MidiChannel'
import MidiChannel from '@/classes/MidiChannel'
import type Synth from '@/classes/Synth'
import { useMidiStore } from '@/stores/midiStore'
import { ref, watchEffect } from 'vue'
import MidiManager from '@/classes/MidiManager'

const props = defineProps<{ channel: MidiChannel }>()
const midiStore = useMidiStore()

const midiDevice = props.channel.device as MidiDevice
const settings = getChannelSettings()

function getChannelSettings(): MidiChannel {
  return props.channel //MidiManager.getChannel(props.synth.midiDevice, props.synth, props.channel)!
}

function setChannelProperty(property: keyof MidiChannelOptions, value: any) {
  if (getChannelSettings() == undefined) return

  getChannelSettings()?.setProperty(property, value)
}

function getChannelMinMax() {
  const settings = getChannelSettings()

  return [settings.min, settings.max]
}

function updateChannelMinMax(minMax: [number, number]) {
  const data = {
    min: minMax[0],
    max: minMax[1],
  } as MidiChannelOptions

  getChannelSettings()?.setProperties(data)
}
</script>

<template>
  <el-dialog
    :title="`Channel ${channel.channelNumber}`"
    modal
    :model-value="true"
    :show-close="true"
    :style="{
      width: '90vw',
      maxWidth: '30rem',
    }"
  >
    <div class="flex-stretch">
      <div class="control-item" id="channel-select">
        <span>Channel:</span>
        <el-select
          :model-value="settings.channelNumber"
          @change="setChannelProperty('channelNumber', $event)"
          class="channel-dropdown"
        >
          <el-option v-for="channel in 16" :key="channel" :value="channel"
            >{{ channel }}
          </el-option>
        </el-select>
      </div>

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
        <el-checkbox class="fixed-width" size="large" v-model="settings.inverted"
          >Inverted</el-checkbox
        >
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
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

.fixed-width {
  flex: 0 0 auto;
}

#channel-select {
  flex: 0 0 90px;
}
</style>
