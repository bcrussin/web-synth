<script setup lang="ts">
import Synth from '@/classes/Synth'
import { Close, Delete } from '@element-plus/icons-vue'
import SynthWaveformSettings from './SynthWaveformSettings.vue'
import SynthSettings from './SynthSettings.vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import SynthPiano from './SynthPiano.vue'
import SynthMidiSettings from './SynthMidiSettings.vue'
import MidiDevice from '@/classes/MidiDevice'

const props = defineProps<{ synth: Synth }>()

function deleteSynth(close: () => void) {
  close()
  // TODO: Properly wait until dialog closed to delete
  setTimeout(() => {
    props.synth.delete()
  }, 400)
}
</script>

<template>
  <el-dialog
    :title="`${props.synth.name} Settings`"
    id="synth-dialog"
    class="dark"
    modal
    :model-value="true"
    :show-close="false"
    :style="{
      width: '90vw',
      maxWidth: '40rem',
    }"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="dialog-header">
        <h3 :class="titleClass" :id="titleId">{{ synth?.name }} Settings</h3>
        <div class="dialog-options">
          <el-popconfirm
            v-if="props.synth.name != 'Keyboard'"
            title="Are you sure you would like to delete this synth?"
            :width="200"
            :hide-icon="true"
            confirm-button-type="danger"
            @confirm="deleteSynth(close)"
          >
            <template #reference>
              <el-button :icon="Delete" type="danger" round></el-button>
            </template>
          </el-popconfirm>

          <el-switch
            :model-value="synth.bypass"
            @change="synth.setBypass($event)"
            :active-value="false"
            :inactive-value="true"
          />
          <el-button :icon="Close" @click="close" size="large" link> </el-button>
        </div>
      </div>
    </template>

    <el-tabs>
      <el-tab-pane label="Waveform" lazy>
        <SynthWaveformSettings :synth="props.synth"></SynthWaveformSettings>
      </el-tab-pane>
      <el-tab-pane label="Effects" lazy>
        <SynthEffects :synth="props.synth"></SynthEffects>
      </el-tab-pane>
      <el-tab-pane label="MIDI" v-if="!!props.synth.midiDevice" lazy>
        <SynthMidiSettings :synth="props.synth"></SynthMidiSettings>
      </el-tab-pane>
      <el-tab-pane label="Settings" lazy>
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
.dialog-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.dialog-options {
  display: flex;
  gap: 8px;
}

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

.synth-controls .el-select {
  width: 160px;
}

.envelope-slider {
  width: 72px;
  margin: 0 8px;
}

#piano-container {
  margin-top: 8px;
}
</style>
