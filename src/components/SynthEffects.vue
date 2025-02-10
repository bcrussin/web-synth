<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import Global from '@/classes/Audio'
import type Synth from '@/classes/Synth'
import { computed, onMounted, reactive, ref, watch, watchEffect } from 'vue'
import ConvolverEffect from './synth-effects/ConvolverEffect.vue'

const effects = ['Reverb', 'Chorus', 'Delay']

const props = defineProps<{ synth: Synth }>()

const selectedEffect = ref(null)

function newEffect(effect: string): void {
  console.log(effect)
  props.synth.addEffect(effect)
  selectedEffect.value = null
}
</script>

<template>
  <div class="effects-list">
    <el-select @change="newEffect($event)" style="margin-bottom: 8px" placeholder="New Effect">
      <el-option v-for="option in effects" :key="option" :value="option">{{ option }}</el-option>
    </el-select>
    <el-collapse
      accordion
      class="effect-card"
      v-model="selectedEffect"
      v-for="(effect, index) in props.synth.effects"
      :key="effect.name"
    >
      <el-collapse-item title="Reverb" v-if="effect.name == 'Convolver'">
        <ConvolverEffect :synth="props.synth" :effectIndex="index"></ConvolverEffect>
      </el-collapse-item>

      <el-collapse-item title="Chorus" v-else-if="effect.name == 'Chorus'">
        <ChorusEffect :synth="props.synth" :effectIndex="index"></ChorusEffect>
      </el-collapse-item>

      <el-collapse-item title="Delay" v-else-if="effect.name == 'Delay'">
        <DelayEffect :synth="props.synth" :effectIndex="index"></DelayEffect>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style scoped>
.effects-list {
  display: flex;
  flex-direction: column;
}

.el-collapse-item {
  border: 1px solid #88888860;
  padding: 0 8px;
}

.effect-card {
  display: flex;
  flex-direction: column;
  place-content: center;
}
</style>
