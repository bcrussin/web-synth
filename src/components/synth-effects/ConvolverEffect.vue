<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import Global from '@/classes/Audio'
import type Synth from '@/classes/Synth'
import { computed, onMounted, reactive, ref, watch, watchEffect } from 'vue'
import Tuna from 'tunajs'

interface Convolver extends Tuna.TunaAudioNode {
  wetLevel: { value: number }
  dryLevel: { value: number }
  level: { value: number }
  impulse: string
  loop: boolean
  convolver: ConvolverNode
}

const props = defineProps<{ synth: Synth; effectIndex: number }>()

function getEffect() {
  return props.synth.getEffect(props.effectIndex) as Convolver
}

const wet = ref(getEffect().wetLevel.value)

const impulseDuration = ref(1)

watchEffect(() => {
  console.log('ITS UM ', getEffect().wetLevel.value)
  wet.value = getEffect().wetLevel.value
})

function changeWetDry(wet: number) {
  const effect = getEffect()
  effect.wetLevel.value = wet
  effect.dryLevel.value = 1 - wet
  effect.level.value = 1 + wet
  console.log(effect.wetLevel.value, effect.dryLevel.value)
}

function updateImpulse() {
  getEffect().convolver.buffer = Global.generateImpulseReponse(
    impulseDuration.value,
    impulseDuration.value,
    false,
  )
}
</script>

<template>
  <div class="effect-property">
    <span>Wet/Dry</span>
    <el-slider :min="0" :max="1" :step="0.1" v-model="wet" @input="changeWetDry($event)">
    </el-slider>
  </div>
  <div class="effect-property">
    <span>Duration</span>
    <el-slider :min="0" :max="4" :step="0.1" v-model="impulseDuration" @input="updateImpulse()" q>
    </el-slider>
  </div>
</template>

<style scoped>
.effect-property {
  display: flex;
  flex-direction: row;
  place-content: center;
  gap: 12px;
}

.effect-property span {
  white-space: nowrap;
}
</style>
