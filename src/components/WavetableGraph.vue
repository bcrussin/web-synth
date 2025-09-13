<script setup lang="ts">
import Synth from '@/classes/Synth'
import '@/assets/main.css'
import { onMounted, ref, watch, type Ref } from 'vue'
import { ElMessage } from 'element-plus'

class InvalidWaveformError extends Error {}

const props = defineProps<{ synthId: UUID }>()
const synth = Synth.getSynth(props.synthId)

const wavetable: Ref<number[], number[]> = ref([])
let ctx: CanvasRenderingContext2D | null | undefined
const canvasRef = ref<HTMLCanvasElement | null>(null)

defineExpose({ wavetable, resizeWavetable, setTransparent })

watch(
	() => synth.type,
	(newType: string | null) => {
		setTransparent()
	},
)

watch(
	() => synth.wavetable,
	(newWaveTable: number[] | null) => {
		if (!!newWaveTable) {
			wavetable.value = newWaveTable
			render()
		}
	},
)

onMounted(() => {
	if (!!synth.wavetable) {
		wavetable.value = synth.wavetable
		resizeWavetable()
	} else {
		wavetable.value = new Array(length).fill(0)
	}

	ctx = canvasRef.value?.getContext('2d')
	resizeWavetable()
	setTransparent()
})

function resizeWavetable(size?: number) {
	if (wavetable.value == undefined) {
		wavetable.value = new Array(size).fill(0)
		return
	}

	size = size ?? 16

	const len = wavetable.value.length
	if (len > size) {
		wavetable.value = wavetable.value.slice(0, size)
	} else if (len < size) {
		for (let i = len; i < size; i++) {
			wavetable.value.push(0)
		}
	}

	render()
	synth.setWavetable(wavetable.value)
}

function render() {
	if (wavetable.value == undefined || canvasRef.value == undefined || ctx == undefined) return

	ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
	ctx.fillStyle = 'white'
	const barWidth = canvasRef.value.width / wavetable.value.length

	for (let i = 0; i < wavetable.value.length; i++) {
		const x = i * barWidth
		const barHeight = (canvasRef.value.height * (wavetable.value[i] + 1)) / 2
		ctx.fillRect(x, canvasRef.value.height - barHeight, barWidth, barHeight)
	}
}

function edit(e: MouseEvent | Touch) {
	if (wavetable.value == undefined || canvasRef.value == undefined || ctx == undefined) return

	const rect = canvasRef.value.getBoundingClientRect()
	const x = e.clientX - rect.left
	const y = e.clientY - rect.top
	const px = Math.max(0, Math.min(x / canvasRef.value.width, 1))
	const py = Math.max(0, Math.min(1 - y / canvasRef.value.height, 1))

	const bar = Math.min(Math.floor(px * wavetable.value.length), wavetable.value.length - 1)
	wavetable.value[bar] = py * 2 - 1

	render()

	synth.setWavetable(wavetable.value)
	synth.setWaveType('custom')
	// setWaveType("custom");
}

function onMouseMove(e: MouseEvent) {
	if (e.buttons & 1) {
		edit(e)
	}
}

function onTouchMove(e: TouchEvent) {
	edit(e.changedTouches[0])
}

function setTransparent(isTransparent?: boolean) {
	if (canvasRef.value == undefined) return

	isTransparent = isTransparent ?? !(!!synth.preset || synth.type == 'custom')

	if (isTransparent) {
		canvasRef.value.classList.add('transparent')
	} else {
		canvasRef.value.classList.remove('transparent')
	}
}

function copyWavetable() {
	navigator.clipboard.writeText(`[${wavetable.value.toString()}]`)
}

function pasteWavetable() {
	navigator.clipboard.readText().then((clipboard) => {
		const originalWavetable = synth.wavetable
		const originalWaveType = synth.type

		try {
			if (!clipboard.startsWith('[')) clipboard = '[' + clipboard
			if (!clipboard.endsWith(']')) clipboard = clipboard + ']'

			const parsed = JSON.parse(clipboard)

			if (Array.isArray(parsed)) {
				const parsedNumeric = parseWavetable(parsed)

				if (!parsedNumeric) throw new InvalidWaveformError('Array must contain numbers only')

				synth.setWavetable(parsedNumeric)
				synth.setWaveType('custom')
			}
		} catch (err) {
			if (err instanceof InvalidWaveformError) {
				showPasteError(err.message)
			} else {
				console.error(err)
				showPasteError()

				// Restore original wave data if something goes wrong
				if (!!originalWavetable) synth.setWavetable(originalWavetable)
				if (!!originalWaveType) synth.setWaveType(originalWaveType)
			}
		}
	})
}

function parseWavetable(data: any[]): number[] | null {
	const values: number[] = []

	const isValid = data.every((value) => {
		const number = Number(value)
		if (!Number.isFinite(number)) return false

		values.push(number)
		return true
	})

	if (!isValid) return null

	return values
}

function showPasteError(message?: string) {
	message = message ?? 'Invalid waveform data in clipboard'

	ElMessage.error({
		message: message,
	})
}
</script>

<template>
	<div class="graph-container">
		<canvas
			ref="canvasRef"
			id="wavetable-graph"
			v-on:mousemove="onMouseMove"
			v-on:touchmove="onTouchMove"
		></canvas>

		<div class="graph-controls">
			<el-button id="copy-wavetable" @click="copyWavetable()">
				<v-icon name="fa-regular-copy" scale="0.8"></v-icon>
			</el-button>
			<el-button id="paste-wavetable" @click="pasteWavetable()">
				<v-icon name="md-contentpaste-round" scale="0.8"></v-icon>
			</el-button>
		</div>
	</div>
</template>

<style>
.graph-container {
	display: flex;
	flex-direction: column;
}

#wavetable-graph {
	border: 2px solid #35d399;
	border-radius: 8px;
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
	background-color: black;
}

#wavetable-graph.transparent {
	opacity: 0.5;
}

.graph-controls {
	display: flex;
	flex-direction: row;
	justify-content: stretch;
	align-items: center;
}

#wavetable-more,
.graph-controls > * {
	flex: 1;
	margin: 0 !important;
	padding: 12px;
	border-radius: 0 0 12px 12px;
}

.graph-controls > *:not(:first-child) {
	border-left: none;
	border-bottom-left-radius: 0;
}

#wavetable-more,
.graph-controls > *:not(:last-child) {
	border-bottom-right-radius: 0;
}

.graph-controls > div {
	flex: 0 0 auto;
	display: flex;
	padding: 0;
}

/* Ensure dropdown button matches other buttons */
#wavetable-more {
	border-left: none;
	border-radius: 0 0 12px 0;
}
</style>
