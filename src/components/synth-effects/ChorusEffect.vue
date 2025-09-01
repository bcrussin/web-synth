<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import Global from '@/classes/Audio'
import type Synth from '@/classes/Synth'
import { ref, watchEffect } from 'vue'
import Tuna from 'tunajs'

export interface Chorus extends Tuna.TunaAudioNode {
  rate: number
  depth: number
  feedback: number
  delay: number
  bypass: boolean
  wetLevel: { value: number }
  dryLevel: { value: number }
}

const props = defineProps<{ synth: Synth; effectIndex: number }>()

function getEffect() {
  return props.synth.getEffect(props.effectIndex) as Chorus
}

function setProperty(property: string, value: number) {
  // getEffect()[property] = value
  props.synth.setEffectProperty(props.effectIndex, property, value)
}

// const depth = ref(getEffect().depth)
</script>

<template>
  <div class="effect-property">
    <span>Depth:</span>
    <el-slider
      :min="0"
      :max="1"
      :step="0.1"
      :model-value="getEffect().depth"
      @input="setProperty('depth', $event)"
    >
    </el-slider>
  </div>
  <div class="effect-property">
    <span>Rate:</span>
    <el-slider
      :min="1"
      :max="8"
      :step="0.1"
      :model-value="getEffect().rate"
      @input="setProperty('rate', $event)"
    >
    </el-slider>
  </div>
  <div class="effect-property">
    <span>Feedback:</span>
    <el-slider
      :min="0"
      :max="0.9"
      :step="0.1"
      :model-value="getEffect().feedback"
      @input="setProperty('feedback', $event)"
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
