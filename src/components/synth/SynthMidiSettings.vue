<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import Synth from '@/classes/Synth'
import MidiManager from '@/classes/MidiManager'
import { computed, reactive, ref, watch, type Ref } from 'vue'
import MidiDevice from '@/classes/MidiDevice'
import { useAudioStore } from '@/stores/audioStore'
import { useMidiDevice } from '@/compostables/useMidiDevice'

const props = defineProps<{ synthId: UUID }>()
const audioStore = useAudioStore()
const synth = audioStore.getSynth(props.synthId)
if (!synth.midiDevice) throw new Error('No midi device')

// function getChannels(channelNumber: number) {
// 	if (!synth.midiDevice) return []

// 	return MidiManager.getChannels(synth.midiDevice, synth, channelNumber)
// }

const selectedDevice: Ref<string> = ref(synth.midiDevice?.id)
const selectedDeviceRef = computed(() => {
	const device = audioStore.getMidiDevice(selectedDevice.value)
	return useMidiDevice(device)
})

// const channelExists = computed(() => {
// 	return (channel: number) =>
// 		audioStore.getMidiAssignments({
// 			synthId: synth.id,
// 			deviceId: selectedDevice.value,
// 			channel: channel,
// 		}).length > 0
// })
</script>

<template>
	<el-select v-model="selectedDevice">
		<template #label="{ label, value }">
			<span>{{ audioStore.getMidiDevice(selectedDevice).name }}</span>
		</template>

		<el-option v-for="(device, name) in audioStore.midiDevices" :value="device.id">
			{{ device.name }}
		</el-option>
	</el-select>
	<span class="section-label">Channel Assignments:</span>
	<div class="channel-params-list">
		<template v-for="channelNumber in 16" :key="channelNumber">
			<div class="channel-param" :channelProperties="1">
				<span>{{ channelNumber }}:</span>
				<MidiChannelButton
					v-if="selectedDeviceRef != undefined"
					:synthId="synth.id"
					:channelNumber="channelNumber"
					:deviceId="selectedDevice"
				></MidiChannelButton>
			</div>
		</template>
	</div>
</template>

<style scoped>
.section-label {
	font-weight: bold;
}

.channel-params-list {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	gap: 8px;
}

.channel-param {
	flex: 1 1 20%;
	box-sizing: border-box;

	display: flex;
	gap: 8px;
	min-width: 120px;
}

.channel-param > span {
	flex: 0 0 2.5ch;
}
</style>
