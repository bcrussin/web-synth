<script setup lang="ts">
import '@/assets/main.css'

import MidiDevice from '@/classes/MidiDevice'
import Synth from '@/classes/Synth'
import { ref, watchEffect } from 'vue'

const props = defineProps<{ synth: Synth }>()

const midiDevice = ref(props.synth.midiDevice?.input?.id)

watchEffect(() => {
	midiDevice.value = props.synth.midiDevice?.input?.id
})

function setMidiDevice(id: string) {
	props.synth.setMidiDevice(id)
}

function setSynthValue(property: string, value: number | string | boolean) {
	props.synth.setProperty(property, value)
}

function changeTranspose(value: number) {
	props.synth.changeTranspose(value)
}

function setTranspose(value: number) {
	props.synth.setTranspose(value)
}

function setMaxPolyphony(value: number) {
	props.synth.setMaxPolyphony(value)
}

function getMaxPolyphony(): number {
	if (props.synth.maxPolyphony == Infinity) return 0

	return props.synth.maxPolyphony
}
</script>

<template>
	<div class="synth-controls">
		<div class="select">
			<el-select placeholder="Input Device" v-model="midiDevice" @change="setMidiDevice($event)">
				<el-option label="None" value=""> </el-option>
				<el-option
					v-for="device in MidiDevice.DEVICES"
					:key="device.input.name"
					:label="device.input.name"
					:value="device.input.id"
				>
				</el-option>
			</el-select>
		</div>
		<div class="selectable">
			<span>Volume:</span>
			<el-slider
				:min="0"
				:max="1"
				:step="0.1"
				name="volume"
				class="control envelope-slider"
				v-bind:model-value="synth?.volume"
				data-param="Synth Volume"
				@input="setSynthValue('volume', $event)"
			></el-slider>
		</div>
		<div>
			<span>Transpose:</span>
			<el-input-number
				:model-value="props.synth.transpose"
				:min="-4"
				:max="4"
				@change="setTranspose"
			/>
		</div>
		<el-divider content-position="left">Polyphony</el-divider>
		<div>
			<span>Max Voices:</span>
			<el-input-number
				:model-value="getMaxPolyphony()"
				:min="0"
				:max="32"
				@change="setMaxPolyphony($event)"
			/>
		</div>
		<el-checkbox
			label="Legato"
			:model-value="props.synth.legato"
			@change="setSynthValue('legato', $event)"
		/>
		<el-checkbox
			label="Glide"
			:model-value="props.synth.glide"
			@change="setSynthValue('glide', $event)"
		/>
		<div>
			<span>Glide Duration (ms):</span>
			<el-input-number
				:model-value="props.synth.glideAmountMs"
				:min="0"
				:max="1000"
				:step="50"
				@change="setSynthValue('glideAmount', $event / 1000)"
			/>
		</div>
		<!-- <div>
			<span>Transpose:</span>
			<el-button @click="changeTranspose(-1)">-</el-button>
			<span>{{ props.synth.transpose }}</span>
			<el-button @click="changeTranspose(1)">+</el-button>
		</div> -->
	</div>
</template>
