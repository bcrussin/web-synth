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

const props = defineProps<{ synthId: UUID }>()
const synth = Synth.getSynth(props.synthId)

const keysContainer = ref<HTMLDivElement | null>(null)
let resizeObserver: ResizeObserver

const pianoKeys: Ref<PianoKey[]> = ref([])
const KEY_WIDTH = 30
const NUM_OCTAVES = 2

const touchedKeys: { [key: string]: { note: string; octave: string } } = {} //{ [key: string]: Element } = {}

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
			synth.stopAll()
		})

		document.addEventListener('contextmenu', (e) => e.preventDefault(), {
			passive: false,
		})

		document.addEventListener('touchstart', (event: TouchEvent) => {
			const e = event.changedTouches[0]
			const key = document.elementFromPoint(e.clientX, e.clientY)
			const data = Global.getKeyElemAttributes(key)

			if (key == undefined || data.note == undefined || data.octave == undefined) return

			synth.playNote(data.note, data.octave)
			touchedKeys[data.note + data.octave] = { note: data.note, octave: data.octave }

			event.preventDefault()
		})

		document.addEventListener('touchmove', (event: TouchEvent) => {
			const changedKeys: string[] = []

			Object.values(event.touches).forEach((touch) => {
				const key = document.elementFromPoint(touch.clientX, touch.clientY)
				const data = Global.getKeyElemAttributes(key)

				if (data.note == undefined || data.octave == undefined) return

				changedKeys.push(data.note + data.octave)
			})

			Object.entries(touchedKeys).forEach(([key, keyData]) => {
				if (!changedKeys.includes(key)) {
					delete touchedKeys[keyData.note + keyData.octave]
					synth.stopNote(keyData.note, keyData.octave)
				}
			})

			const e = event.changedTouches[0]
			const key = document.elementFromPoint(e.clientX, e.clientY)
			const data = Global.getKeyElemAttributes(key)

			if (data.note == undefined || data.octave == undefined) return

			touchedKeys[data.note + data.octave] = { note: data.note, octave: data.octave }
			synth.playNote(data.note, data.octave)

			event.preventDefault()
		})

		document.addEventListener('touchend', (event: TouchEvent) => {
			const e = event.changedTouches[0]
			const key = document.elementFromPoint(e.clientX, e.clientY)
			const data = Global.getKeyElemAttributes(key)

			if (data.note == undefined || data.octave == undefined) return

			delete touchedKeys[data.note + data.octave]
			synth.stopNote(data.note, data.octave)

			event.preventDefault()
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
	synth.playNote(note, octave)
}

function stopNote(note: string, octave: number) {
	synth.stopNote(note, octave)
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
			v-bind:class="{
				black: key.isBlack,
				playing: synth.pressedNotes.has(`${key.note}${key.octave}`),
			}"
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
	user-select: none;
	-webkit-user-select: none;
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
