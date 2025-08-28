<script setup lang="ts">
import Synth from '@/classes/Synth'
import SynthDialog from './SynthDialog.vue'

import Global from '@/classes/Audio'
import { ref, type Ref } from 'vue'

const currentSynth: Ref<string | undefined> = ref(undefined)
const settingsDialogs = new Set<string>()

function openDialog(synth: Synth) {
	currentSynth.value = synth.name
	// settingsDialogs.add(synth.name)
}
function closeDialog() {
	currentSynth.value = undefined
	// this.settingsDialogs = this.settingsDialogs.filter((dialog) => dialog.id !== id)
}

function addSynth(): void {
	const synth = new Synth()
	console.log(Synth.getSynths())
}
</script>

<template>
	<section id="synths-list" class="horizontal">
		<el-button
			class="synth-button"
			v-for="(synth, name) in Synth.getSynths()"
			v-bind:class="{ playing: synth.isPlaying(), suspended: Global.suspended.value }"
			:key="name"
			plain
			round
			size="default"
			@click="openDialog(synth)"
		>
			{{ name }}
		</el-button>

		<el-button round size="default" @click="addSynth"> + </el-button>
	</section>

	<SynthDialog
		v-if="currentSynth"
		:key="currentSynth"
		:synth="Synth.getSynth(currentSynth)"
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
	outline: 2px solid transparent;
	transition: outline-color 0.2s;
}

.synth-button.playing {
	outline-color: var(--playing-color);
	box-shadow: 0 0 20px var(--playing-color);
	transition: outline-color 0s;
}

.synth-button.playing.suspended {
	outline-color: var(--suspended-color);
	box-shadow: 0 0 20px var(--suspended-color);
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
			currentSynth: undefined,
			settingsDialogs: new Set<string>(), // Dynamically managed dialogs
		}
	},
	methods: {
		openDialog(synth: Synth) {
			console.log(this.settingsDialogs)
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
			console.log(Synth.getSynths())
		},
	},
}
</script>
