<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import '@/assets/main.css'

import Synth from '@/classes/Synth'
import { onMounted, ref, type Ref } from 'vue'
import WavetableGraph from '@/components/WavetableGraph.vue'
import { useInstrumentsStore } from '@/stores/instruments'
import MidiManager from '@/classes/MidiManager'
import MidiChannel from '@/classes/MidiChannel'
import MidiParamDialog from '../MidiParamDialog.vue'

const props = defineProps<{ selectingElement: any; synth: Synth }>()
const emit = defineEmits(['selectElement'])

const wavetableGraphRef = ref<typeof WavetableGraph | null>(null)

const presets = useInstrumentsStore()

const properties = [
  { name: 'Sine', value: 'sine' },
  { name: 'Sawtooth', value: 'sawtooth' },
  { name: 'Triangle', value: 'triangle' },
  { name: 'Custom', value: 'custom' },
  { separator: true, disabled: true },
]

const wavetableSizeMarks = {
  16: '16',
}

function getSynthType(): string {
  return props.synth.getPresetOrType()
}

function setSynthValue(property: string, value: number | string) {
  props.synth.setProperty(property, value)
}

function setWaveType(value: string): void {
  const option = getPresets().find((preset) => preset.value == value)
  if (option.isPreset) {
    const instrument = presets.getInstrument(option.value)
    props.synth.setWavetable(instrument.wavetable)
    props.synth.setPreset(option.value)
    props.synth.setProperty('attack', instrument.attack)
    props.synth.setProperty('decay', instrument.decay)
    props.synth.setProperty('sustain', instrument.sustain)
    props.synth.setProperty('release', instrument.release)
  } else {
    props.synth.setWaveType(option.value)
  }
}

function updateWavetableSize(size: number) {
  wavetableGraphRef.value?.resizeWavetable(size)
}

function getPresets() {
  const presetOptions: any[] = []

  Object.entries(presets.instruments).forEach(([name, data]: [string, any]) => {
    presetOptions.push({ name: data.displayName, value: name, isPreset: true })
  })

  return [...properties, ...presetOptions]
}

// function controlSelected(e: Event) {
//   if (props.selectingElement) {
//     console.log(e)
//     const target = e.target as HTMLElement
//     const control = target.querySelector('.control')
//     emit('selectElement', control)
//   }
// }

// onMounted(() => {
//   const elements = document.querySelectorAll('.selectable')
//   elements.forEach((element) => {
//     element.addEventListener('click', controlSelected)
//   })
// })

// function getPresets() {
//   const presetOptions: any = { label: 'Presets', items: [] }

//   Object.entries(presets.instruments).forEach(([name, data]: [string, any]) => {
//     presetOptions.items.push({ name: data.displayName, value: name, isPreset: true })
//   })

//   return [{ label: 'Wave Types', items: properties }, presetOptions]
// }
</script>

<template>
  <!-- v-model:visible="visible" -->

  <div class="synth-controls">
    <div class="selectable">
      <span>Attack:</span>
      <el-slider
        :min="0.01"
        :max="0.4"
        :step="0.05"
        :show-tooltip="false"
        class="control envelope-slider"
        v-bind:model-value="synth?.attack"
        data-param="Synth Attack"
        @input="setSynthValue('attack', $event)"
      ></el-slider>
    </div>

    <div class="selectable">
      <span>Decay:</span>
      <el-slider
        :min="0"
        :max="1"
        :step="0.05"
        :show-tooltip="false"
        class="control envelope-slider"
        v-bind:model-value="synth?.decay"
        data-param="Synth Decay"
        @input="setSynthValue('decay', $event)"
      ></el-slider>
    </div>

    <div class="selectable">
      <span>Sustain:</span>
      <el-slider
        :min="0"
        :max="1"
        :step="0.05"
        :show-tooltip="false"
        class="control envelope-slider"
        v-bind:model-value="synth?.sustain"
        data-param="Synth Sustain"
        @input="setSynthValue('sustain', $event)"
      ></el-slider>
    </div>

    <div class="selectable">
      <span>Release:</span>
      <el-slider
        :min="0"
        :max="0.5"
        :step="0.05"
        name="release"
        :show-tooltip="false"
        class="control envelope-slider"
        v-bind:model-value="synth?.release"
        data-param="Synth Release"
        @input="setSynthValue('release', $event)"
      ></el-slider>
    </div>
  </div>

  <div id="wavetable-container">
    <WavetableGraph ref="wavetableGraphRef" :synth="synth"></WavetableGraph>

    <div id="settings-footer" class="flex horizontal">
      <el-select id="wavetable-presets" :model-value="getSynthType()" @change="setWaveType($event)">
        <template v-for="option in getPresets()" :key="option.value">
          <hr v-if="option.separator" style="margin: 8px 12px; opacity: 0.4" />
          <el-option v-else :label="option.name" :value="option.value"> </el-option>
        </template>
      </el-select>

      <el-slider
        type="range"
        :min="8"
        :max="64"
        :step="8"
        :marks="wavetableSizeMarks"
        :show-tooltip="false"
        id="wavetable-size"
        :model-value="wavetableGraphRef?.wavetable?.length"
        @input="updateWavetableSize($event)"
      ></el-slider>

      <!-- <input type="number" value="1" id="wavetable-stretch" /> -->
    </div>
  </div>
</template>

<!-- <script lang="ts">
export default {
  props: {
    synth: Synth,
  },
  data() {
    return {
      properties: [
        { name: 'Sine', value: 'sine' },
        { name: 'Sawtooth', value: 'sawtooth' },
        { name: 'Triangle', value: 'triangle' },
      ],
    }
  },
  methods: {
    setSynthValue(property: string, value: number | string) {
      if (this.synth == undefined) return

      this.synth.setProperty(property, value)
    },
    setWaveType(option: { name: string; value: string }): void {
      if (this.synth == undefined) return

      this.synth.setWaveType(option.value)
    },
  },
}
</script> -->

<style scoped>
#wavetable-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: fit-content;
  margin: 0 auto;
}

#settings-footer {
  width: 100%;
  justify-content: stretch;
  gap: 8px;
}

#wavetable-presets,
#wavetable-size {
  flex: 1;
}
</style>
