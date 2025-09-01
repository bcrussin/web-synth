<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import Global from '@/classes/Audio'
import type Synth from '@/classes/Synth'
import { ref, watchEffect } from 'vue'
import Tuna from 'tunajs'

export interface Convolver extends Tuna.TunaAudioNode {
  wetLevel: { value: number }
  dryLevel: { value: number }
  level: { value: number }
  loop: boolean
  convolver: ConvolverNode
}

const props = defineProps<{ synth: Synth; effectIndex: number }>()

function getEffect() {
  return props.synth.getEffect(props.effectIndex) as Convolver
}

const wet = ref(getEffect().wetLevel.value)

const impulseDuration = ref(props.synth.getEffectProperty(props.effectIndex, 'impulseDuration') ?? 1)

watchEffect(() => {
  wet.value = getEffect().wetLevel.value
})

function changeWetDry(wet: number) {
  const effect = getEffect()
  // effect.wetLevel.value = wet
  // effect.dryLevel.value = 1 // - wet
  // effect.level.value = 1 // + wet

  props.synth.setEffectProperty(props.effectIndex, 'wetLevel', wet, true)
  props.synth.setEffectProperty(props.effectIndex, 'dryLevel', 1, true)
  props.synth.setEffectProperty(props.effectIndex, 'level', 1, true)
}

function updateImpulse() {
  getEffect().convolver.buffer = Global.generateImpulseReponse(
    impulseDuration.value,
    impulseDuration.value,
    false,
  );

  props.synth.setEffectProperty(props.effectIndex, 'impulseDuration', impulseDuration.value);
}
</script>

<template>
  <div class="effect-property">
    <span>Volume:</span>
    <el-slider :min="0" :max="2" :step="0.1" v-model="wet" @input="changeWetDry($event)">
    </el-slider>
  </div>
  <div class="effect-property">
    <span>Duration:</span>
    <el-slider :min="0" :max="4" :step="0.1" v-model="impulseDuration" @input="updateImpulse()">
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
