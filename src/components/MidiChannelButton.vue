<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import MidiChannel, {
	type IMidiAssignment,
	type MidiAssignmentFields,
} from '@/classes/MidiAssignment'
import type MidiDevice from '@/classes/MidiDevice'
import MidiManager from '@/classes/MidiManager'
import Synth from '@/classes/Synth'
import { computed, ref, toValue, watch, watchEffect, type Reactive, type Ref } from 'vue'

import { ArrowDown } from '@element-plus/icons-vue'
import { useAudioStore } from '@/stores/audioStore'
import { useMidiDevice } from '@/compostables/useMidiDevice'
import MidiAssignment from '@/classes/MidiAssignment'
import { SynthParam } from '@/classes/SynthParameters'

const props = defineProps<{ synthId: UUID; deviceId: string; channelNumber: number }>()
const audioStore = useAudioStore()
const synth = audioStore.getSynth(props.synthId)

const dialogChannel: Ref<IMidiAssignment | undefined> = ref(undefined)
const dialogIsNewChannel: Ref<boolean> = ref(false)

const midiDevice = computed(() => audioStore.getMidiDevice(props.deviceId))
// const midiDeviceRef = useMidiDevice(midiDevice.value)

const indicatorStyles = computed(() => {
	return (channel: number) => {
		const channelValues = midiDevice.value.state.channelValues
		const value = channelValues[channel]

		const style: any = {}

		style.left = 0
		style.width = value * 100 + '%'

		return style
	}
})

const channelAssignments = computed(() => {
	const a = audioStore.getMidiAssignments({
		deviceId: props.deviceId,
		synthId: synth.id,
		channel: props.channelNumber,
	})
	console.log(a)
	return a
})

const firstAssignment = computed(() => channelAssignments.value?.[0])
// function getChannelAssignments(channelNumber: number): IMidiAssignment[] {
// 	return audioStore.getMidiAssignments({
// 		deviceId: props.deviceId,
// 		synthId: synth.id,
// 		channel: channelNumber,
// 	})
// 	// return MidiManager.getChannels(midiDevice.value, synth, channelNumber)
// }

function editChannel(channel?: IMidiAssignment | number) {
	if (!!channel && typeof channel !== 'number') {
		dialogIsNewChannel.value = false
		dialogChannel.value = channel
		return
	}

	const newChannel = new MidiAssignment(midiDevice.value, {
		parameter: SynthParam.Attack,
		channelNumber: channel ?? 1,
		synth: synth,
	})

	dialogIsNewChannel.value = true
	dialogChannel.value = newChannel
}
</script>

<template>
	<div class="channel-button-container">
		<el-button
			v-if="channelAssignments?.length <= 1"
			class="channel-button"
			@click="editChannel(firstAssignment ?? channelNumber)"
			>{{ firstAssignment?.parameter || 'None' }}</el-button
		>

		<el-dropdown v-else class="channel-button" @command="editChannel" trigger="click">
			<el-button class="channel-button"
				>{{ channelAssignments.length }} Params
				<el-icon class="el-icon--right"><ArrowDown /></el-icon
			></el-button>

			<template #dropdown>
				<el-dropdown-item
					v-for="channel in channelAssignments"
					:key="channel.channelNumber"
					:value="channel"
					:command="channel"
					>{{ channel.parameter }}</el-dropdown-item
				>
			</template>
		</el-dropdown>

		<div class="channel-value" :style="indicatorStyles(channelNumber)"></div>
	</div>

	<MidiParamDialog
		v-if="dialogChannel"
		:assignment="dialogChannel"
		:synthId="synth.id"
		:isNewChannel="dialogIsNewChannel"
		@update:model-value="() => (dialogChannel = undefined)"
	></MidiParamDialog>
</template>

<style scoped>
.channel-button-container {
	position: relative;
	width: 100%;
	min-width: 0;
}

.channel-button {
	width: 100%;
}

:deep(.channel-button span) {
	display: block;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.channel-value {
	content: '';
	position: absolute;
	bottom: 0;
	height: 4px;
	background-color: var(--primary-color);
}
</style>
