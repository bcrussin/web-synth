<script setup lang="ts">
import { ref } from 'vue'
import TutorialDialog from './TutorialDialog.vue'

const dialogVisible = ref(false)
</script>

<template>
	<el-button text round @click="dialogVisible = true" v-bind="$attrs">
		<v-icon :name="'fa-question'"></v-icon>
	</el-button>

	<TutorialDialog v-if="dialogVisible" @update:model-value="() => (dialogVisible = false)" />
</template>
