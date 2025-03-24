<script setup lang="ts">
import '@/assets/main.css'

import MidiDevice from '@/classes/MidiDevice'
import Synth from '@/classes/Synth'
import { ref, watchEffect } from 'vue'

const props = defineProps<{ synth: Synth }>()

const midiDevice = ref(props.synth.midiDevice?.input?.id)

watchEffect(() => {
  midiDevice.value = props.synth.midiDevice?.input?.id
})

function setMidiDevice(id: string) {
  props.synth.setMidiDevice(id)
}

function setSynthValue(property: string, value: number | string) {
  props.synth.setProperty(property, value)
}
</script>

<template>
  <div class="synth-controls">
    <div class="select">
      <el-select placeholder="Input Device" v-model="midiDevice" @change="setMidiDevice($event)">
        <el-option label="None" value=""> </el-option>
        <el-option
          v-for="device in MidiDevice.DEVICES"
          :key="device.input.name"
          :label="device.input.name"
          :value="device.input.id"
        >
        </el-option>
      </el-select>
    </div>
    <div>
      <span>Volume:</span>
      <el-slider
        :min="0"
        :max="1"
        :step="0.1"
        name="volume"
        class="envelope-slider"
        v-bind:model-value="synth?.volume"
        @input="setSynthValue('volume', $event)"
      ></el-slider>
    </div>
  </div>
</template>
