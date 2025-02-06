<script setup lang="ts">
import SynthSettings from './SynthWaveformSettings.vue'

import Synth from '@/classes/Synth'
import { reactive } from 'vue'
import SynthDialog from './SynthDialog.vue'
</script>

<template>
  <section id="synths-list" class="horizontal">
    <el-button
      class="synth-button"
      v-for="(synth, name) in Synth.getSynths()"
      v-bind:class="{ playing: synth.isPlaying() }"
      :key="name"
      plain
      round
      size="default"
      @click="openDialog(synth)"
    >
      {{ name }}
    </el-button>
  </section>

  <SynthDialog
    v-for="synth in settingsDialogs"
    :key="Synth.getSynth(synth).name"
    :synth="Synth.getSynth(synth)"
    @update:model-value="(val) => closeDialog(Synth.getSynth(synth).name, val)"
  />
</template>

<style scoped>
#synths-list {
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.synth-button {
  outline: 2px solid transparent;
  transition: outline-color 0.2s;
}

.synth-button.playing {
  outline-color: var(--playing-color);
  box-shadow: 0 0 20px var(--playing-color);
  transition: outline-color 0s;
}

/* .synth-button {
  padding: 2px 4px;
  border: 3px solid transparent;
  border-radius: 8px;
  white-space: nowrap;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.synth-button.playing {
  --playing-color: rgb(40, 188, 40);
  box-shadow: 0 0 8px 2px var(--playing-color);
  border-color: var(--playing-color);
  transition-duration: 0s;
} */
</style>

<script lang="ts">
export default {
  components: { SynthDialog },
  data() {
    return {
      settingsDialogs: new Set<string>(), // Dynamically managed dialogs
    }
  },
  methods: {
    openDialog(synth: Synth) {
      this.settingsDialogs.add(synth.name)
    },
    closeDialog(id: string, isVisible: boolean) {
      if (!isVisible) {
        this.settingsDialogs.delete(id)
      }
      // this.settingsDialogs = this.settingsDialogs.filter((dialog) => dialog.id !== id)
    },
  },
}
</script>
