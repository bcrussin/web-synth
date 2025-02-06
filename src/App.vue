<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import Keyboard from './classes/Keyboard'
import Synth from './classes/Synth'
import SynthList from './components/SynthList.vue'
import MidiDevice from './classes/Midi'

Keyboard.initialize()
MidiDevice.requestDevices()
</script>

<template>
  <div class="wrapper">
    <SynthList />
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
