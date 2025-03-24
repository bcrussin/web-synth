<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import Keyboard from './classes/Keyboard'
import Synth from './classes/Synth'
import SynthList from './components/synth/SynthList.vue'
import MidiDevice from './classes/MidiDevice'
import Global from './classes/Audio'
import { ref, watchEffect } from 'vue'

const volume = ref(Global.volumeNode.gain.value)
const contextSuspended = Global.suspended

watchEffect(() => {
  volume.value = Global.volumeNode.gain.value
  contextSuspended.value = Global.suspended.value
})

function setGlobalVolume(value: number) {
  volume.value = value
  Global.volumeNode.gain.value = value
}

Keyboard.initialize()
MidiDevice.initialize()
</script>

<template>
  <div class="wrapper">
    <div class="header">
      <div class="synth-controls">
        <div>
          <span>Volume:</span>
          <el-slider
            :min="0"
            :max="0.5"
            :step="0.05"
            class="envelope-slider"
            style="width: 240px"
            :model-value="volume"
            @input="setGlobalVolume($event)"
          >
          </el-slider>
        </div>
      </div>
    </div>

    <div class="content">
      <el-alert
        v-if="contextSuspended"
        class="context-suspended-alert"
        type="error"
        title="Audio Output Suspended"
        description="Please click or press any key and then play a note in order to enable audio output."
        :closable="false"
      ></el-alert>
    </div>

    <div class="footer">
      <div id="synths-list-container">
        <SynthList />
      </div>
      <section class="horizontal">
        <el-button link><v-icon name="md-settings-round"></v-icon></el-button>
      </section>
    </div>
  </div>

  <RouterView />
</template>

<style scoped>
.wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: center;
}

.wrapper .content {
  flex: 1;
}

.footer {
  display: flex;
  width: 100%;
}

.footer #synths-list-container {
  flex: 1;
}

.context-suspended-alert {
  margin: 16px 0;
}
</style>
