<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import Global from '@/classes/Audio'
import Synth from '@/classes/Synth'
import { onMounted, ref, type Ref } from 'vue'

interface PianoKey {
  note: string
  octave: number
  isBlack: boolean
}

const props = defineProps<{ synth: Synth }>()
const keysContainer = ref<HTMLDivElement | null>(null)
let resizeObserver: ResizeObserver

const pianoKeys: Ref<PianoKey[]> = ref([])
const KEY_WIDTH = 30
const NUM_OCTAVES = 2

const touchedKeys: { [key: string]: HTMLElement } = {}

onMounted(() => {
  resizeObserver = new ResizeObserver(onResize)
  resizeObserver.observe(keysContainer.value as Element)
})

function generateKeys(componentWidth: number) {
  pianoKeys.value = []

  const maxNotes = Math.floor(componentWidth / KEY_WIDTH)
  const octaveStart = 4 - Math.floor(NUM_OCTAVES / 2)

  let counter = 0
  for (let i = octaveStart; i <= NUM_OCTAVES + octaveStart; i++) {
    Object.keys(Global.NOTES).forEach((note, j) => {
      if (counter >= maxNotes) return

      const isBlack = note.includes('b')

      pianoKeys.value.push({
        note: note,
        octave: i,
        isBlack: isBlack,
      })

      if (!isBlack) counter++
    })

    document.addEventListener('mouseup', () => {
      props.synth.stopAll()
    })

    document.addEventListener('contextmenu', (e) => e.preventDefault(), {
      passive: false,
    })
  }
}

function onResize(e: ResizeObserverEntry[]) {
  generateKeys(e[0].contentRect.width)
}

function ifMouseClicked(e: MouseEvent, callback: any) {
  if (e.buttons == 1 || e.buttons == 3) {
    callback()
  }
}

function playNote(note: string, octave: number) {
  props.synth.playNote(note, octave)
}

function stopNote(note: string, octave: number) {
  props.synth.stopNote(note, octave)
}
</script>

<template>
  <div id="synth-keys" ref="keysContainer">
    <div
      class="key"
      v-for="key in pianoKeys"
      :key="key.note"
      :data-note="key.note"
      :data-octave="key.octave"
      v-bind:class="{ black: key.isBlack, playing: props.synth.notes.has(key.note + key.octave) }"
      @mousedown="playNote(key.note, key.octave)"
      @mouseover="ifMouseClicked($event, () => playNote(key.note, key.octave))"
      @mouseout="ifMouseClicked($event, () => stopNote(key.note, key.octave))"
    ></div>
  </div>
</template>

<style scoped>
#synth-keys {
  padding: 2px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  border-radius: 8px;
}

.key {
  width: 30px;
  height: 160px;
  background-color: white;
  border: 2px solid black;
  border-radius: 0 0 8px 8px;
}

.key ~ .key.black {
  margin: 0 -12px;
}

.key.black {
  width: 24px;
  height: 100px;
  background-color: black;
  border: 2px solid black;
  border-top: none;
  z-index: 100;
}

.key.playing {
  z-index: 55;
  border-color: var(--playing-color);
  box-shadow: inset 0 0 14px var(--playing-color);
}

.key.black.playing {
  z-index: 105;
}
</style>
