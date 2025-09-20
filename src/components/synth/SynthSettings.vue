<script setup lang="ts">
import '@/assets/main.css'

import MidiDevice from '@/classes/MidiDevice'
import Synth from '@/classes/Synth'
import { RefreshLeft } from '@element-plus/icons-vue'
import { computed, ref, watchEffect } from 'vue'

const props = defineProps<{ synthId: UUID }>()
const synth = Synth.getSynth(props.synthId)

const midiDevice = ref(synth.midiDevice?.input?.id)

watchEffect(() => {
	midiDevice.value = synth.midiDevice?.input?.id
})

function setMidiDevice(id: string) {
	synth.setMidiDevice(id)
}

function setSynthValue(property: string, value: number | string | boolean) {
	synth.setProperty(property, value)
}

function changeTranspose(value: number) {
	synth.changeTranspose(value)
}

function setTranspose(value: number) {
	synth.setTranspose(value)
}

function setMaxPolyphony(value: number) {
	synth.setMaxPolyphony(value)
}

function getMaxPolyphony(): number {
	if (synth.maxPolyphony == Infinity) return 0

	return synth.maxPolyphony
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

		<el-divider content-position="left">Transpose</el-divider>
		<div class="transpose-input selectable">
			<span>Octaves:</span>
			<el-input-number
				class="control"
				v-model="synth.octaves"
				data-param="Synth Transpose (Octaves)"
			/>
		</div>
		<div class="transpose-input selectable">
			<span>Semitones:</span>
			<el-input-number
				class="control"
				v-model="synth.semitones"
				data-param="Synth Transpose (Semitones)"
			/>
		</div>
		<el-button
			:icon="RefreshLeft"
			@click="setTranspose(0)"
			:disabled="synth.transpose == 0"
			circle
			text
		></el-button>

		<el-divider content-position="left">Polyphony</el-divider>
		<div class="selectable">
			<span>Max Voices:</span>
			<el-input-number
				data-param="Synth Max Polyphony"
				class="control"
				:model-value="getMaxPolyphony()"
				:min="0"
				:max="32"
				@change="setMaxPolyphony($event)"
			/>
		</div>
		<el-checkbox
			label="Legato"
			:model-value="synth.legato"
			@change="setSynthValue('legato', $event)"
		/>
		<el-checkbox
			label="Glide"
			:model-value="synth.glide"
			@change="setSynthValue('glide', $event)"
		/>
		<div class="selectable">
			<span>Glide Duration (ms):</span>
			<el-input-number
				data-param="Synth Glide Amount"
				class="control"
				:model-value="synth.glideAmountMs"
				:min="0"
				:max="1000"
				:step="50"
				@change="setSynthValue('glideAmount', $event / 1000)"
			/>
		</div>
		<!-- <div>
			<span>Transpose:</span>
			<el-button @click="changeTranspose(-1)">-</el-button>
			<span>{{ synth.transpose }}</span>
			<el-button @click="changeTranspose(1)">+</el-button>
		</div> -->
	</div>
</template>

<style scoped>
.transpose-input .el-input-number {
	width: fit-content;
}

.transpose-input :deep(.el-input__inner) {
	width: 4ch; /* 3 digits + minus sign + a bit of breathing room */
}
</style>
