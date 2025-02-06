<script setup lang="ts">
import Synth from '@/classes/Synth'

const props = defineProps<{ synth: Synth }>()

function setSynthValue(property: string, value: number | string) {
  props.synth.setProperty(property, value)
}
</script>

<template>
  <div class="synth-controls">
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
