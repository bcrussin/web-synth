<script setup lang="ts">
import Synth from '@/classes/Synth'
import { Close, Delete, Operation } from '@element-plus/icons-vue'
import SynthWaveformSettings from './SynthWaveformSettings.vue'
import SynthSettings from './SynthSettings.vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import SynthPiano from './SynthPiano.vue'
import SynthMidiSettings from './SynthMidiSettings.vue'
import MidiDevice from '@/classes/MidiDevice'
import { ref, type Ref } from 'vue'
import MidiManager from '@/classes/MidiManager'
import MidiChannel from '@/classes/MidiChannel'

const props = defineProps<{ synth: Synth }>()

const selectingElement = ref(false)
const currentMidiChannel: Ref<MidiChannel | undefined> = ref(undefined)

function deleteSynth(close: () => void) {
  close()
  // TODO: Properly wait until dialog closed to delete
  setTimeout(() => {
    props.synth.delete()
  }, 400)
}

function selectElement(target?: HTMLElement) {
  if (target == undefined) return

  const existingChannels = MidiManager.getChannelsForDeviceAndSynth(
    props.synth.midiDevice,
    props.synth,
  )

  currentMidiChannel.value = new MidiChannel(props.synth.midiDevice, {
    channelNumber: Math.min(existingChannels.length + 1, 16),
    synth: props.synth,
    param: target.getAttribute('data-param') ?? undefined,
  })

  // MidiManager.registerChannel(currentMidiChannel.value)
}

document.addEventListener('click', (e: MouseEvent) => {
  if (!selectingElement.value || !!(e.target as HTMLElement)?.closest('#select-element')) return

  const elem = e.target as HTMLElement
  const target = elem.closest('.selectable') as HTMLElement

  if (!!target) {
    selectElement((target.querySelector('.control') as HTMLElement) ?? undefined)
  }

  selectingElement.value = false
  e.stopPropagation()
  e.preventDefault()
})

function toggleElementSelection() {
  setTimeout(() => {
    selectingElement.value = !selectingElement.value
  }, 0)
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
    :class="{ selecting: selectingElement }"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="dialog-header">
        <h3 :class="titleClass" :id="titleId">{{ synth?.name }} Settings</h3>
        <div class="dialog-options">
          <el-button
            v-if="!!synth.midiDevice"
            id="select-element"
            @click="toggleElementSelection()"
            :link="!selectingElement"
            :round="selectingElement"
          >
            <v-icon
              v-if="!selectingElement"
              :name="selectingElement ? 'hi-backspace' : 'bi-sliders'"
            ></v-icon>
            <span v-else>Cancel</span>
          </el-button>

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
        <SynthWaveformSettings
          :selectingElement="selectingElement"
          @selectElement="selectElement"
          :synth="props.synth"
        ></SynthWaveformSettings>
      </el-tab-pane>
      <el-tab-pane label="Effects" lazy>
        <SynthEffects
          :selectingElement="selectingElement"
          @selectElement="selectElement"
          :synth="props.synth"
        ></SynthEffects>
      </el-tab-pane>
      <el-tab-pane label="MIDI" v-if="!!props.synth.midiDevice" lazy>
        <SynthMidiSettings :synth="props.synth"></SynthMidiSettings>
      </el-tab-pane>
      <el-tab-pane label="Settings" lazy>
        <SynthSettings
          :selectingElement="selectingElement"
          @selectElement="selectElement"
          :synth="props.synth"
        ></SynthSettings>
      </el-tab-pane>
      <!-- </div> -->
    </el-tabs>

    <div id="piano-container">
      <SynthPiano :synth="props.synth"></SynthPiano>
    </div>

    <div id="mask" v-if="selectingElement"></div>

    <MidiParamDialog
      v-if="currentMidiChannel"
      :channel="currentMidiChannel"
      :isNewChannel="true"
      @update:model-value="() => (currentMidiChannel = undefined)"
    ></MidiParamDialog>
  </el-dialog>
</template>

<style>
.dialog-header {
  width: 100%;
  height: 1lh;
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

<style>
#mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;

  backdrop-filter: brightness(0.6);

  /* background-color: #00000060; */
}

.selecting #select-element,
.selecting .selectable {
  position: relative;
  z-index: 1001;
  cursor: pointer;
}

.selecting .selectable * {
  z-index: 1001;
}

.selecting .selectable:after,
.selecting .selectable:before {
  --x-padding: -4px;
  --y-padding: -6px;

  content: '';
  position: absolute;
  top: var(--y-padding);
  left: var(--x-padding);
  right: var(--x-padding);
  bottom: var(--y-padding);

  z-index: 1000;

  border-radius: 12px;
  border: 2px dashed #33333380;
  background-color: white;
}

.dark .selecting .selectable:before,
.dark .selecting .selectable:after {
  border: 2px dashed #cccccc80;
  background-color: #222222;
}

.selecting .selectable:hover:after {
  border: 2px solid var(--primary-color);
  background-color: var(--primary-color-fade);
  box-shadow: 0 0 8px var(--primary-color);
}

.selecting .selectable .control {
  pointer-events: none;
}
</style>
