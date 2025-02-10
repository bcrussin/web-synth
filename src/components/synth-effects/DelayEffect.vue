<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import Global from '@/classes/Audio'
import type Synth from '@/classes/Synth'
import { ref, watchEffect } from 'vue'
import Tuna from 'tunajs'

interface Delay extends Tuna.TunaAudioNode {
  feedback: { value: number }
  delayTime: { value: number }
  wetLevel: { value: number }
  dryLevel: { value: number }
  cutoff: number
}

const props = defineProps<{ synth: Synth; effectIndex: number }>()

function getEffect() {
  return props.synth.getEffect(props.effectIndex) as Delay
}

const wet = ref(getEffect().wetLevel.value)
const delayTime = ref(getEffect().delayTime.value)
const feedback = ref(getEffect().feedback.value)

watchEffect(() => {
  wet.value = getEffect().wetLevel.value
  delayTime.value = getEffect().delayTime.value
  feedback.value = getEffect().feedback.value
})

function changeWetDry(wet: number) {
  const effect = getEffect()
  // effect.wetLevel.value = wet
  // effect.dryLevel.value = 1

  props.synth.setEffectProperty(props.effectIndex, 'wetLevel', wet, true)
  props.synth.setEffectProperty(props.effectIndex, 'dryLevel', 1, true)
}

function setPropertyValue(property: string, value: number) {
  // getEffect()[property].value = value

  props.synth.setEffectProperty(props.effectIndex, property, value, true)
}

function setProperty(property: string, value: number) {
  // getEffect()[property] = value
  props.synth.setEffectProperty(props.effectIndex, property, value)
}

// const depth = ref(getEffect().depth)
</script>

<template>
  <div class="effect-property">
    <span>Volume:</span>
    <el-slider :min="0" :max="1" :step="0.1" v-model="wet" @input="changeWetDry($event)">
    </el-slider>
  </div>
  <div class="effect-property">
    <span>Delay Time:</span>
    <el-slider
      :min="0"
      :max="1"
      :step="0.01"
      v-model="delayTime"
      @input="setPropertyValue('delayTime', $event)"
    >
    </el-slider>
  </div>
  <div class="effect-property">
    <span>Feedback:</span>
    <el-slider
      :min="0"
      :max="0.8"
      :step="0.05"
      v-model="feedback"
      @input="setPropertyValue('feedback', $event)"
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
