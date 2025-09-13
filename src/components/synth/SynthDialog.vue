<script setup lang="ts">
import Synth from '@/classes/Synth'
import { Close, Delete, Edit, Check } from '@element-plus/icons-vue'
import SynthWaveformSettings from './SynthWaveformSettings.vue'
import SynthSettings from './SynthSettings.vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import SynthPiano from './SynthPiano.vue'
import SynthMidiSettings from './SynthMidiSettings.vue'
import { nextTick, ref, type Ref } from 'vue'
import MidiManager from '@/classes/MidiManager'
import MidiChannel from '@/classes/MidiChannel'
import SaveSynthDialog from './SaveSynthDialog.vue'
import LoadSynthDialog from './LoadSynthDialog.vue'

const props = defineProps<{ synthId: UUID }>()
const synth = Synth.getSynth(props.synthId)

const selectingElement = ref(false)
const currentMidiChannel: Ref<MidiChannel | undefined> = ref(undefined)
const isSaving = ref(false)
const isLoading = ref(false)
const isEditingName = ref(false)

const synthNameInput = ref<HTMLElement | null>(null)

function deleteSynth(close: () => void) {
	close()
	// TODO: Properly wait until dialog closed to delete
	setTimeout(() => {
		synth.delete()
	}, 400)
}

function selectElement(target?: HTMLElement) {
	if (target == undefined) return

	const existingChannels = MidiManager.getChannelsForDeviceAndSynth(synth.midiDevice, synth)

	if (!!synth.midiDevice) {
		currentMidiChannel.value = new MidiChannel(synth.midiDevice, {
			channelNumber: Math.min(existingChannels.length + 1, 16),
			synth: synth,
			param: target.getAttribute('data-param') ?? undefined,
		})
	}
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

function focusSynthName() {
	if (!isEditingName.value && synthNameInput.value) {
		synthNameInput.value.focus()

		nextTick(() => {
			const selection = window.getSelection()
			const range = document.createRange()

			range.selectNodeContents(synthNameInput?.value!)
			selection?.removeAllRanges()
			selection?.addRange(range)
		})
	}

	isEditingName.value = true
}

function saveSynthName() {
	if (!synthNameInput.value) return

	const name = synthNameInput.value.textContent.trim()

	if (!!name && name != synth.name) {
		synth.name = name
	} else {
		synthNameInput.value.textContent = synth.name
	}

	console.log(name, synth.name, !!name)
	isEditingName.value = false

	synthNameInput.value.blur()
}
</script>

<template>
	<el-dialog
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
				<div class="synth-name-container" :id="titleId" :class="titleClass">
					<!-- TODO: Instead of preventing paste, hijack the command and strip newlines before pasting -->
					<h3
						class="synth-name"
						contenteditable="plaintext-only"
						spellcheck="false"
						@focus="focusSynthName"
						@blur="saveSynthName"
						@keydown.stop
						@keydown.enter.prevent="saveSynthName"
						@paste.prevent
						ref="synthNameInput"
					>
						{{ synth.nameRef }}
					</h3>

					<el-button v-if="!isEditingName" @click="focusSynthName()" :icon="Edit" text round>
					</el-button>
				</div>

				<div class="dialog-options">
					<el-button @click="isSaving = true"> Save </el-button>
					<el-button @click="isLoading = true"> Load </el-button>

					<el-button
						v-if="!!synth.midiDevice"
						id="select-element"
						@click="toggleElementSelection()"
						:link="!selectingElement"
						:round="selectingElement"
					>
						<v-icon v-if="!selectingElement" :name="'bi-sliders'"></v-icon>
						<span v-else>Cancel</span>
					</el-button>

					<el-popconfirm
						v-if="synth.name != 'Keyboard'"
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
					:synthId="synth.id"
				></SynthWaveformSettings>
			</el-tab-pane>
			<el-tab-pane label="Effects" lazy>
				<SynthEffects
					:selectingElement="selectingElement"
					@selectElement="selectElement"
					:synthId="synth.id"
				></SynthEffects>
			</el-tab-pane>
			<el-tab-pane label="MIDI" v-if="!!synth.midiDevice" lazy>
				<SynthMidiSettings :synthId="synth.id"></SynthMidiSettings>
			</el-tab-pane>
			<el-tab-pane label="Settings" lazy>
				<SynthSettings
					:selectingElement="selectingElement"
					@selectElement="selectElement"
					:synthId="synth.id"
				></SynthSettings>
			</el-tab-pane>
			<!-- </div> -->
		</el-tabs>

		<div id="piano-container">
			<SynthPiano :synthId="synth.id"></SynthPiano>
		</div>

		<div id="mask" v-if="selectingElement"></div>

		<MidiParamDialog
			v-if="currentMidiChannel"
			:channel="currentMidiChannel"
			:isNewChannel="true"
			@update:model-value="() => (currentMidiChannel = undefined)"
		></MidiParamDialog>

		<SaveSynthDialog
			v-model="isSaving"
			:isVisible="isSaving"
			:synthId="synth.id"
			@close="() => (isSaving = false)"
		></SaveSynthDialog>

		<LoadSynthDialog
			v-model="isLoading"
			:isVisible="isLoading"
			:synthId="synth.id"
			@close="() => (isLoading = false)"
		></LoadSynthDialog>
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

.synth-name-container {
	display: flex;
	align-items: center;
	gap: 8px;
}

.synth-name {
	display: inline-block;
	border-radius: 8px;
	white-space: nowrap;
	overflow: hidden;
}

.synth-name:focus {
	padding: 4px 1.5ch;
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

.selecting .selectable:hover {
	z-index: 1010;
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
