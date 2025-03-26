<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type MidiDevice from '@/classes/MidiDevice'
import type { MidiChannelOptions } from '@/classes/MidiChannel'
import MidiChannel from '@/classes/MidiChannel'
import type Synth from '@/classes/Synth'
import { useMidiStore } from '@/stores/midiStore'
import { ref, watchEffect } from 'vue'
import MidiManager from '@/classes/MidiManager'

const props = withDefaults(defineProps<{ channel: MidiChannel; isNewChannel?: boolean }>(), {
	isNewChannel: false,
})
const midiStore = useMidiStore()

const dialogVisible = ref(true)

const midiDevice = props.channel.device as MidiDevice
const settings = getChannelSettings()

function getChannelSettings(): MidiChannel {
	return props.channel //MidiManager.getChannel(props.synth.midiDevice, props.synth, props.channel)!
}

function setChannelProperty(property: keyof MidiChannelOptions, value: any) {
	props.channel.setProperty(property, value)
	// if (getChannelSettings() == undefined) return

	// getChannelSettings()?.setProperty(property, value)
}

function getChannelMinMax() {
	const settings = getChannelSettings()

	return [settings.min, settings.max]
}

function updateChannelMinMax(minMax: [number, number]) {
	const data = {
		min: minMax[0],
		max: minMax[1],
	} as MidiChannelOptions

	// getChannelSettings()?.setProperties(data)
	props.channel.setProperties(data)
}

function save() {
	if (props.channel.param == undefined) return

	MidiManager.registerChannel(props.channel)
	dialogVisible.value = false
}

function deleteChannel() {
	if (props.channel.param == undefined) return

	MidiManager.unregisterChannel(props.channel)
	dialogVisible.value = false
}
</script>

<template>
	<el-dialog
		:title="`Channel ${channel.channelNumber}`"
		modal
		:model-value="dialogVisible"
		:show-close="true"
		:style="{
			width: '90vw',
			maxWidth: '30rem',
		}"
	>
		<div class="flex-stretch">
			<div class="control-item" id="channel-select">
				<span>Channel:</span>
				<el-select
					:model-value="settings.channelNumber"
					@change="setChannelProperty('channelNumber', $event)"
					class="channel-dropdown"
				>
					<el-option v-for="channel in 16" :key="channel" :value="channel"
						>{{ channel }}
					</el-option>
				</el-select>
			</div>

			<div class="control-item">
				<span>Linked Parameter:</span>
				<el-select
					:model-value="settings.param"
					@change="setChannelProperty('param', $event)"
					class="channel-dropdown"
					placeholder="None"
				>
					<el-option value="" v-if="props.isNewChannel"> None </el-option>
					<el-option
						v-for="param in midiStore.params"
						:key="param.displayName"
						:label="param.displayName"
						:value="param.displayName"
					>
					</el-option>
				</el-select>
			</div>
		</div>
		<div class="control-item">
			<span>Output Range:</span>

			<div class="flex-stretch">
				<el-slider
					range
					:min="0"
					:max="1"
					:model-value="getChannelMinMax()"
					:step="0.05"
					@input="updateChannelMinMax($event)"
				></el-slider>
				<el-checkbox class="fixed-width" size="large" v-model="settings.inverted"
					>Inverted</el-checkbox
				>
			</div>
		</div>

		<template #footer>
			<!-- New Channel Options -->
			<div v-if="props.isNewChannel">
				<el-button @click="() => (dialogVisible = false)">Cancel</el-button>
				<el-button type="primary" @click="save()" :disabled="!props.channel.param">Save</el-button>
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
