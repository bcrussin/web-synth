<script setup lang="ts">
import Synth from '@/classes/Synth'
import SynthDialog from './SynthDialog.vue'

import Global from '@/classes/Audio'
import { ref, watch, type Ref } from 'vue'

const currentSynth: Ref<string | undefined> = ref(undefined)

function openDialog(synthId: UUID) {
	currentSynth.value = synthId
}
function closeDialog() {
	currentSynth.value = undefined
}

function addSynth(): void {
	const synth = new Synth()
}

function getGlowSize(synth: Synth) {
	let size = synth.signalLevel.value * 60
	size = Math.min(Math.max(0, size), 40)

	return `${size}px`
}

Synth.beginUpdatingSignalLevels()
</script>

<template>
	<section id="synths-list" class="horizontal">
		<el-button
			class="synth-button"
			v-for="(synth, id) in Synth.getSynths()"
			v-bind:class="{
				playing: synth.isPlaying(),
				audible: synth.isAudible(),
				bypassed: synth.bypass,
				suspended: Global.suspended.value,
			}"
			:style="{
				'--glow-size': getGlowSize(synth),
			}"
			:key="id"
			plain
			round
			size="default"
			@click="openDialog(id)"
		>
			{{ synth.nameRef }}
		</el-button>

		<el-button round size="default" @click="addSynth"> + </el-button>
	</section>

	<SynthDialog
		v-if="currentSynth"
		:key="currentSynth"
		:synthId="currentSynth"
		@update:model-value="() => closeDialog()"
	/>
</template>

<style scoped>
#synths-list {
	justify-content: center;
	flex-wrap: wrap;
	gap: 8px;
}

.synth-button {
	--accent-color: var(--playing-color);

	outline: 2px solid transparent;
	transition:
		outline-color 0.2s,
		color 0.2s;
}

.synth-button.playing {
	outline-color: var(--accent-color);
	color: var(--accent-color);
	transition: outline-color 0s;
}

.synth-button.audible {
	box-shadow: 0 0 var(--glow-size) var(--accent-color);
}

.synth-button.suspended {
	--accent-color: var(--suspended-color);
}

.synth-button.bypassed {
	border-style: dashed;
	opacity: 0.8;
}
</style>

<script lang="ts">
export default {
	components: { SynthDialog },
	data() {
		return {
			currentSynth: undefined,
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
		addSynth(): void {
			const synth = new Synth()
		},
	},
}
</script>
