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
    <SynthList />

    <el-alert
      v-if="contextSuspended"
      class="context-suspended-alert"
      type="error"
      title="Audio Output Suspended"
      description="Please click or press any key and then play a note in order to enable audio output."
      :closable="false"
    ></el-alert>
  </div>

  <RouterView />
</template>

<style scoped>
.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

.context-suspended-alert {
  margin: 16px 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
  }

  header .wrapper {
    display: flex;
    place-items: center;
    flex-wrap: wrap;
  }
}
</style>
