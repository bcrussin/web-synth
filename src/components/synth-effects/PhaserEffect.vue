<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import Global from '@/classes/Audio'
import Synth from '@/classes/Synth'
import { ref, watchEffect } from 'vue'
import Tuna from 'tunajs'

interface Phaser extends Tuna.TunaAudioNode {
	rate: number
	depth: number
	feedback: number
	stereoPhase: number
	baseModulationFrequency: number
	output: GainNode
}

const props = defineProps<{ synthId: UUID; effectIndex: number }>()
const synth = Synth.getSynth(props.synthId)

function getEffect() {
	return synth.getEffect(props.effectIndex) as Phaser
}

function setPropertyValue(property: string, value: number) {
	synth.setEffectProperty(props.effectIndex, property, value, true)
}

function setProperty(property: string, value: number) {
	synth.setEffectProperty(props.effectIndex, property, value)
}
</script>

<template>
	<div class="effect-property">
		<span>Rate:</span>
		<el-slider
			:min="0"
			:max="1"
			:step="0.1"
			:model-value="getEffect().rate"
			@input="setProperty('rate', $event)"
		>
		</el-slider>
	</div>
	<div class="effect-property">
		<span>Depth:</span>
		<el-slider
			:min="0"
			:max="1"
			:step="0.1"
			:model-value="getEffect().depth"
			@input="setProperty('depth', $event)"
		>
		</el-slider>
	</div>
	<div class="effect-property">
		<span>Feedback:</span>
		<el-slider
			:min="0"
			:max="10"
			:step="0.1"
			:model-value="getEffect().feedback"
			@input="setProperty('feedback', $event)"
		>
		</el-slider>
	</div>
	<div class="effect-property">
		<span>Stereo Phase:</span>
		<el-slider
			:min="0"
			:max="180"
			:step="1"
			:model-value="getEffect().stereoPhase"
			@input="setProperty('stereoPhase', $event)"
		>
		</el-slider>
	</div>
	<div class="effect-property">
		<span>Modulation Frequency:</span>
		<el-slider
			:min="500"
			:max="1500"
			:step="5"
			:model-value="getEffect().baseModulationFrequency"
			@input="setProperty('baseModulationFrequency', $event)"
		>
		</el-slider>
	</div>
</template>

<style scoped>
.effect-property {
	display: flex;
	flex-direction: row;
	place-content: center;
	gap: 8px;
}

.effect-property span {
	white-space: nowrap;
}

.el-slider {
	margin: 0 16px;
}
</style>
