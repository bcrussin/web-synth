<script setup lang="ts">
import Synth from '@/classes/Synth'
import { SynthSerializer, SynthSerializerCategory } from '@/classes/SynthSerializer'
import { useSynthStore } from '@/stores/synthStore'
import { computed, ref, watch } from 'vue'

const props = defineProps<{ synthId: UUID; isVisible: boolean }>()
const emit = defineEmits<{
	(e: 'update:model-value', value: boolean): void
}>()

const synth = Synth.getSynth(props.synthId)

watch(
	() => props.isVisible,
	(isVisible) => {
		if (!isVisible) {
			presetName.value = ''
			includedCategories.value = categories
		}
	},
)

const SynthStore = useSynthStore()
const savedSynths = SynthStore.fetchSynths()

const presetName = ref('')

// Search for any preset names containing query string
function filterPresetNames(query: string, callback: any) {
	const names = Object.keys(savedSynths)
		.filter((name) => name.toLowerCase().includes(query.toLowerCase()))
		.map((name) => ({ value: name }))

	callback(names)
}

// Enable only the categories included in the selected preset
function selectPreset(name: string) {
	const presetCategories = SynthSerializer.getPresetCategories(savedSynths[name])
	if (presetCategories.length > 0) {
		includedCategories.value = categories.filter((category) => {
			return presetCategories.includes(category)
		})
	}
}

const categories = Object.values(SynthSerializerCategory)

const includedCategories = ref(categories)

async function copy() {
	const data = SynthSerializer.serialize(synth, includedCategories.value)

	await navigator.clipboard.writeText(JSON.stringify(data))

	emit('update:model-value', false)
}

function save() {
	const data = SynthSerializer.serialize(synth, includedCategories.value)
	const name = !!presetName.value ? presetName.value : synth.name

	SynthStore.saveSynth(name, data)

	emit('update:model-value', false)
}
</script>

<template>
	<el-dialog
		:title="`Save as Preset`"
		id="save-dialog"
		class="dark"
		modal
		:model-value="true"
		:style="{
			width: '90vw',
			maxWidth: '30rem',
		}"
	>
		<div class="flex-stretch">
			<div class="control-item" id="preset-name">
				<span>Preset Name:</span>
				<el-autocomplete
					v-model="presetName"
					:placeholder="synth.name"
					:fetch-suggestions="filterPresetNames"
					clearable
					@select="(e: any) => selectPreset(e.value)"
				>
					<template #default="{ item }">
						<div class="preset-option">
							<div>{{ item.value }}</div>
							<div class="preset-tags-container">
								<el-tag
									type="primary"
									v-for="category in SynthSerializer.getPresetCategoryNames(
										savedSynths[item.value],
									)"
									>{{ category }}</el-tag
								>
							</div>
						</div>
					</template>
				</el-autocomplete>
			</div>
		</div>

		<div class="flex-stretch">
			<div class="control-item" id="categories">
				<span>Categories:</span>

				<el-checkbox-group v-model="includedCategories" id="category-list">
					<el-checkbox
						v-for="category in categories"
						:label="SynthSerializer.getCategoryName(category)"
						:value="category"
					/>
				</el-checkbox-group>
			</div>
		</div>

		<template #footer>
			<span class="dialog-footer">
				<el-button @click="$emit('update:model-value', false)">Cancel</el-button>
				<el-button @click="copy()" id="copy-button">Copy to Clipboard</el-button>
				<el-button type="primary" @click="save()">Save</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<style scoped>
#save-dialog .control-item {
	margin-bottom: 16px;
}

#category-list {
	margin-left: 16px;
	display: flex;
	flex-direction: column;
}

.preset-option {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 4px;
	line-height: initial;
	padding-top: 8px;
	padding-bottom: 8px;
}

.preset-tags-container {
	display: flex;
	align-items: center;
	gap: 4px;
}
</style>
