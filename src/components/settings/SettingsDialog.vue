<script setup lang="ts">
import { ref } from 'vue'
import KeybindsSettings from './KeybindsSettings.vue'

const currentTab = ref('general')

const handleOpen = (key: string, keyPath: string[]) => {
	currentTab.value = key
}
</script>

<template>
	<el-dialog
		title="Global Settings"
		modal
		:model-value="true"
		:style="{
			width: '90vw',
			maxWidth: '40rem',
		}"
	>
		<div class="settings-container">
			<el-menu @select="handleOpen" :default-active="currentTab">
				<el-menu-item index="general">
					<v-icon name="md-settings-round"></v-icon> General
				</el-menu-item>
				<el-menu-item index="keybinds">
					<v-icon name="md-keyboard-outlined"></v-icon> Keybinds
				</el-menu-item>
				<el-menu-item index="midi"> <v-icon name="md-piano"></v-icon> MIDI </el-menu-item>
			</el-menu>

			<div class="tab-view">
				<GeneralSettings v-if="currentTab === 'general'"></GeneralSettings>
				<KeybindsSettings v-else-if="currentTab === 'keybinds'"></KeybindsSettings>
			</div>
		</div>
	</el-dialog>
</template>

<style scoped>
.settings-container {
	display: flex;
	justify-content: stretch;
	align-items: stretch;
}

.settings-container .el-menu-item {
	display: flex;
	gap: 8px;
}

.tab-view {
	flex: 1;
	margin: 8px;
}
</style>
