<script setup lang="ts">
import type Synth from '@/classes/Synth'
import SynthWaveformSettings from './SynthWaveformSettings.vue'
import SynthSettings from './SynthSettings.vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import SynthPiano from './SynthPiano.vue'

const props = defineProps<{ synth: Synth }>()
</script>

<template>
  <el-dialog
    :title="`${props.synth.name} Settings`"
    id="synth-dialog"
    class="dark"
    modal
    :model-value="true"
    :header="synth?.name + ' Settings'"
    :style="{
      width: '90vw',
      maxWidth: '40rem',
    }"
  >
    <el-tabs value="0" id="test">
      <!-- <div id="tab-panels" :style="{ height: dialogHeight, transition: 'height 1s ease-in-out' }"> -->
      <el-tab-pane label="Waveform" value="0">
        <SynthWaveformSettings :synth="props.synth"></SynthWaveformSettings>
      </el-tab-pane>
      <el-tab-pane label="Effects" value="1">
        <SynthEffects :synth="props.synth"></SynthEffects>
      </el-tab-pane>
      <el-tab-pane label="Settings" value="2">
        <SynthSettings :synth="props.synth"></SynthSettings>
      </el-tab-pane>
      <!-- </div> -->
    </el-tabs>

    <div id="piano-container">
      <SynthPiano :synth="props.synth"></SynthPiano>
    </div>
  </el-dialog>
</template>

<style>
.synth-controls {
  text-align: center;
  padding: 8px 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.synth-controls > div {
  display: flex;
  place-items: center;
  gap: 4px;
}

.envelope-slider {
  width: 72px;
  margin: 0 8px;
}

#piano-container {
  margin-top: 8px;
}
</style>
