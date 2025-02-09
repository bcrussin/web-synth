<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import Global from '@/classes/Audio'
import type Synth from '@/classes/Synth'
import { computed, onMounted, reactive, ref, watch, watchEffect } from 'vue'
import ConvolverEffect from './synth-effects/ConvolverEffect.vue'

const props = defineProps<{ synth: Synth }>()
</script>

<template>
  <div class="effects-list">
    <el-collapse
      accordion
      class="effect-card"
      v-for="(synth, index) in props.synth.effects"
      :key="synth.name"
    >
      <el-collapse-item title="Convolver">
        <ConvolverEffect :synth="props.synth" :effectIndex="index"></ConvolverEffect>
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
