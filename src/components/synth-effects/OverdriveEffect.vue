<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import Global from '@/classes/Audio'
import type Synth from '@/classes/Synth'
import { ref, watchEffect } from 'vue'
import Tuna from 'tunajs'

interface Overdrive extends Tuna.TunaAudioNode {
  outputGain: { value: number }
  drive: { value: number }
  curveAmount: number
  algorithmIndex: { value: number }
  output: GainNode
}

const props = defineProps<{ synth: Synth; effectIndex: number }>()

function getEffect() {
  return props.synth.getEffect(props.effectIndex) as Overdrive
}

const outputGain = ref(getEffect().outputGain.value)
const drive = ref(getEffect().drive.value)

watchEffect(() => {
  outputGain.value = getEffect().outputGain.value
  drive.value = getEffect().drive.value
})

function setPropertyValue(property: string, value: number) {
  props.synth.setEffectProperty(props.effectIndex, property, value, true)
}

function setProperty(property: string, value: number) {
  props.synth.setEffectProperty(props.effectIndex, property, value)
}
</script>

<template>
  <div class="effect-property">
    <span>Gain:</span>
    <el-slider
      :min="0"
      :max="5"
      :step="0.1"
      v-model="outputGain"
      @input="setPropertyValue('outputGain', $event)"
    >
    </el-slider>
  </div>
  <div class="effect-property">
    <span>Drive:</span>
    <el-slider
      :min="0"
      :max="0.8"
      :step="0.05"
      v-model="drive"
      @input="setPropertyValue('drive', $event)"
    >
    </el-slider>
  </div>
  <div class="effect-property">
    <span>Curve Amount:</span>
    <el-slider
      :min="0"
      :max="1"
      :step="0.1"
      :model-value="getEffect().curveAmount"
      @input="setProperty('curveAmount', $event)"
    >
    </el-slider>
  </div>
  <div class="effect-property">
    <span>Algorithm:</span>
    <el-slider
      :min="0"
      :max="5"
      :step="1"
      :model-value="getEffect().algorithmIndex"
      @input="setProperty('algorithmIndex', $event)"
    >
    </el-slider>
  </div>
</template>

<style scoped>
.effect-property {
  display: flex;
  flex-direction: row;
  place-content: center;
  gap: 8px;
}

.effect-property span {
  white-space: nowrap;
}

.el-slider {
  margin: 0 16px;
}
</style>
