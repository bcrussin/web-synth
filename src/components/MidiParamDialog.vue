<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type MidiDevice from '@/classes/MidiDevice'
import MidiChannel from '@/classes/MidiAssignment'
import type Synth from '@/classes/Synth'
import { useMidiStore } from '@/stores/midiStore'
import { computed, ref, watchEffect } from 'vue'
import MidiManager from '@/classes/MidiManager'
import { SynthParam } from '@/classes/SynthParameters'
import { useAudioStore } from '@/stores/audioStore'
import type MidiAssignment from '@/classes/MidiAssignment'

const props = withDefaults(
	defineProps<{ assignment: MidiAssignment; synthId: UUID; isNewChannel?: boolean }>(),
	{
		isNewChannel: false,
	},
)
const midiStore = useMidiStore()
const audioStore = useAudioStore()
const synth = audioStore.getSynth(props.synthId)

const dialogVisible = ref(true)

// const oututMinMaxArray = computed(() => [props.assignment.outputMin, props.assignment.outputMax])

// function getChannelMinMax() {
// 	const settings = getChannelSettings()

// 	return [settings.min, settings.max]
// }

// function updateChannelMinMax(minMax: [number, number]) {
// 	const data = {
// 		min: minMax[0],
// 		max: minMax[1],
// 	} as MidiChannelOptions

// 	// getChannelSettings()?.setProperties(data)
// 	props.channel.setProperties(data)
// }

function save() {
	if (props.assignment.parameter == undefined) return

	// MidiManager.registerChannel(props.channel)
	audioStore.addMidiAssignment(props.assignment)
	dialogVisible.value = false
}

function deleteChannel() {
	if (props.assignment.parameter == undefined) return

	// MidiManager.unregisterChannel(props.channel)
	audioStore.removeMidiAssignment(props.assignment.id)
	dialogVisible.value = false
}

function assignDevice(deviceId: string) {
	props.assignment.device = audioStore.getMidiDevice(deviceId)
}
</script>

<template>
	<el-dialog
		:title="`Channel ${assignment.channelNumber}`"
		modal
		:model-value="dialogVisible"
		:show-close="true"
		:style="{
			width: '90vw',
			maxWidth: '30rem',
		}"
	>
		<div class="flex-stretch">
			<div class="control-item" id="device-select">
				<span>Device:</span>
				<el-select
					:model-value="assignment.device.id"
					@change="assignDevice($event)"
					class="channel-dropdown"
				>
					<el-option
						v-for="device in audioStore.midiDevices"
						:key="device.id"
						:label="device.name"
						:value="device.id"
					>
					</el-option>
				</el-select>
			</div>

			<div class="control-item" id="channel-select">
				<span>Channel:</span>
				<el-select v-model="assignment.channelNumber" class="channel-dropdown">
					<el-option v-for="channel in 16" :key="channel" :value="channel"
						>{{ channel }}
					</el-option>
				</el-select>
			</div>
		</div>

		<div class="control-item">
			<span>Linked Parameter:</span>
			<el-select v-model="assignment.parameter" class="channel-dropdown" placeholder="None">
				<el-option value="" v-if="props.isNewChannel"> None </el-option>
				<el-option
					v-for="param in synth.params.all()"
					:key="param.id"
					:label="param.displayName"
					:value="param.id"
				>
				</el-option>
			</el-select>
		</div>

		<div class="control-item">
			<span>Output Range:</span>

			<div class="flex-stretch">
				<el-slider
					range
					:min="0"
					:max="1"
					v-model="assignment.outputMinMax"
					:step="0.05"
				></el-slider>
				<el-checkbox class="fixed-width" size="large" v-model="assignment.inverted"
					>Inverted</el-checkbox
				>
			</div>
		</div>

		<template #footer>
			<!-- New Channel Options -->
			<div v-if="props.isNewChannel">
				<el-button @click="() => (dialogVisible = false)">Cancel</el-button>
				<el-button type="primary" @click="save()" :disabled="!props.assignment.parameter"
					>Save</el-button
				>
			</div>

			<!-- Existing Channel Options -->
			<div v-else>
				<el-button @click="() => (dialogVisible = false)">Close</el-button>
				<el-popconfirm
					title="Are you sure you would like to delete this channel assignment?"
					:width="200"
					:hide-icon="true"
					confirm-button-type="danger"
					@confirm="deleteChannel()"
				>
					<template #reference>
						<el-button type="danger">Remove</el-button>
					</template>
				</el-popconfirm>
			</div>
		</template>
	</el-dialog>
</template>

<style scoped>
.control-item {
	margin: 12px 0;
}

.control-item > span {
	font-weight: bold;
	white-space: nowrap;
}

.el-slider {
	padding: 0 8px;
}

.fixed-width {
	flex: 0 0 auto;
}

#channel-select {
	flex: 0 0 90px;
}
</style>
