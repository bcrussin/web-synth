<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import Global from '@/classes/Audio'
import Synth from '@/classes/Synth'
import { computed, onMounted, reactive, ref, watch, watchEffect } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { vDraggable } from 'vue-draggable-plus'
import ConvolverEffect from '@/components/synth-effects/ConvolverEffect.vue'
import OverdriveEffect from '@/components/synth-effects/OverdriveEffect.vue'
import PhaserEffect from '@/components/synth-effects/PhaserEffect.vue'

const effects: { [key: string]: string } = {
	convolver: 'Reverb',
	chorus: 'Chorus',
	delay: 'Delay',
	overdrive: 'Overdrive',
	// phaser: 'Phaser', Not currently functional
}

const props = defineProps<{ synthId: UUID }>()
const synth = Synth.getSynth(props.synthId)

const selectedEffect = ref(null)

function newEffect(effect: string): void {
	synth.addEffect(effect)
	selectedEffect.value = null
}

function getEffectName(name: string): string {
	return effects[name?.toLowerCase()] ?? ''
}

function deleteEffect(e: Event, index: number): void {
	e.stopPropagation()
	e.stopImmediatePropagation()
	e.preventDefault()
	synth.deleteEffect(index)
}
</script>

<template>
	<div class="effects-list">
		<el-select @change="newEffect($event)" style="margin-bottom: 8px" placeholder="New Effect">
			<el-option v-for="option in effects" :key="option" :value="option">{{ option }}</el-option>
		</el-select>

		<el-collapse
			accordion
			class="effects-collapse"
			v-model="selectedEffect"
			v-draggable="[
				synth.effects,
				{
					animation: 150,
				},
			]"
			@end="synth.updateEffectNodes()"
		>
			<el-collapse-item
				class="effect-item"
				v-for="(effect, index) in synth.effects"
				:key="effect.name"
			>
				<template #title>
					<div class="effect-title flex-split">
						<span>{{ getEffectName(effect.name) }}</span>
						<div>
							<el-button
								class="delete-effect"
								type="danger"
								:icon="Delete"
								circle
								size="large"
								@click.stop.prevent="deleteEffect($event, index)"
							/>
							<el-switch
								v-model="effect.bypass"
								:active-value="false"
								:inactive-value="true"
								@click.stop.prevent=""
							/>
						</div>
					</div>
				</template>

				<ConvolverEffect
					:synthId="synth.id"
					:effectIndex="index"
					v-if="effect.name == 'Convolver'"
				></ConvolverEffect>

				<ChorusEffect
					:synthId="synth.id"
					:effectIndex="index"
					v-else-if="effect.name == 'Chorus'"
				></ChorusEffect>

				<DelayEffect
					:synthId="synth.id"
					:effectIndex="index"
					v-else-if="effect.name == 'Delay'"
				></DelayEffect>

				<OverdriveEffect
					:synthId="synth.id"
					:effectIndex="index"
					v-else-if="effect.name == 'Overdrive'"
				></OverdriveEffect>

				<PhaserEffect
					:synthId="synth.id"
					:effectIndex="index"
					v-else-if="effect.name == 'Phaser'"
				></PhaserEffect>
			</el-collapse-item>
		</el-collapse>
	</div>
</template>

<style scoped>
.effects-list {
	display: flex;
	flex-direction: column;
}

.effect-item {
	border: 1px solid #88888860;
	margin: 0 0;
	padding: 0 8px;
	transition: margin 0.4s;
}

.effect-title {
	cursor: move !important;
	padding-right: 8px;
}

.effect-item:not(.is-active) + .effect-item:not(.is-active) {
	border-top: none;
}

.effect-item.is-active {
	margin: 8px 0;
}

.effect-item:first-child {
	margin-top: 0 !important;
	border-top-left-radius: 8px;
	border-top-right-radius: 8px;
}

.effect-item:last-child {
	margin-bottom: 0 !important;
	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;
}

.effect-card {
	display: flex;
	flex-direction: column;
	place-content: center;
}

.delete-effect {
	margin-right: 8px;
	padding: 4px;
	aspect-ratio: 1;
	width: fit-content;
	height: fit-content;
	opacity: 0;
	visibility: hidden;
	transition:
		opacity 0.2s,
		visibility 0.2s;
}

.effect-item.is-active .delete-effect {
	opacity: 1;
	visibility: visible;
}
</style>
