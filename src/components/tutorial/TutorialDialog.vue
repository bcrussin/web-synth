<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { FilterNodeMethodFunction } from 'element-plus'
import {
	computed,
	onMounted,
	ref,
	shallowRef,
	type Component,
	type Ref,
	type ShallowRef,
} from 'vue'

const dialogVisible = ref(true)
const navRef: Ref<any | null> = ref(null)

const currentPageId: Ref<number | undefined> = ref()
const currentNode: Ref<TreeNode | undefined> = ref()
const currentPage: ShallowRef<Component | undefined> = shallowRef()
const isLoadingPage = ref(false)

const modules: Record<string, Function> = import.meta.glob('./pages/**/*.vue')

async function handleNodeClick(data: TreeNode) {
	if (data.pageName == undefined) {
		// setPage(currentNode.value?.id!)
		return
	}

	currentNode.value = navRef.value.getCurrentNode()
	currentPageId.value = currentNode.value?.id
	isLoadingPage.value = true

	try {
		const { default: Component } = await modules[`./pages/${data.pageName}.vue`]()

		currentPage.value = Component
	} catch (err) {
		currentPage.value = undefined
		console.error('Load error:', err)
	} finally {
		isLoadingPage.value = false
	}
}

function setPage(pageId: number) {
	navRef.value?.setCurrentKey(pageId)
	handleNodeClick(navRef.value.getCurrentNode())
}

function changePage(delta: number) {
	const currentKey = navRef.value?.getCurrentKey()
	setPage(currentKey + delta)
}

function getPage(pageId: number) {
	const node = navRef.value?.getNode(pageId)
	return node
}

function getNextPage() {
	if (currentPageId.value == null) return null
	return getPage(currentPageId.value + 1)
}

function getPrevPage() {
	if (currentPageId.value == null) return null
	return getPage(currentPageId.value - 1)
}

interface TreeNode {
	id?: number
	label: string
	children?: TreeNode[]
	pageName?: string
}

const navTree: TreeNode[] = [
	{
		label: 'Introduction',
		pageName: 'introduction',
	},
	{
		label: 'Playing Notes',
		pageName: 'playing-notes',
	},
	{
		label: 'Synth Dialog',
		children: [
			{
				label: 'Waveform',
				pageName: 'synth-dialog/waveform',
			},
			{
				label: 'Effects',
				pageName: 'synth-dialog/effects',
			},
			{
				label: 'MIDI Channels',
				pageName: 'synth-dialog/midi-channels',
			},
			{
				label: 'Settings',
				pageName: 'synth-dialog/settings',
			},
		],
	},
]

function initTree(tree: TreeNode[], currentId: number = 0) {
	tree.forEach((item) => {
		if (item.pageName != null) item.id = currentId++

		if (item.children?.length) {
			currentId = initTree(item.children, currentId) + 1
		}
	})

	return currentId
}

initTree(navTree)
</script>

<template>
	<el-dialog
		title="Help"
		modal
		@opened="setPage(0)"
		:model-value="dialogVisible"
		:show-close="true"
		:style="{
			width: '90vw',
			maxWidth: '50rem',
		}"
	>
		<div class="dialog-content">
			<aside class="left-sidebar">
				<el-tree
					ref="navRef"
					style="max-width: 600px"
					:data="navTree"
					node-key="id"
					@node-click="handleNodeClick"
					highlight-current
					default-expand-all
				/>
			</aside>

			<el-divider class="sidebar-divider" direction="vertical"></el-divider>

			<main>
				<div class="page-content" v-loading="isLoadingPage">
					<component v-if="!!currentPage" :is="currentPage"></component>
					<div v-else-if="currentPageId != null">Page not found</div>
				</div>

				<footer class="nav-buttons">
					<el-button class="previous" v-if="getPrevPage()" @click="changePage(-1)">
						<div>Previous</div>
						<div class="nav-link">{{ getPrevPage()?.label }}</div>
					</el-button>

					<el-button class="next" v-if="getNextPage()" @click="changePage(1)">
						<div>Next</div>
						<div class="nav-link">{{ getNextPage()?.label }}</div>
					</el-button>
				</footer>
			</main>
		</div>

		<!-- <template #footer>
			<el-button @click="() => (dialogVisible = false)">Close</el-button>
		</template> -->
	</el-dialog>
</template>

<style scoped>
.dialog-content {
	display: flex;
	align-items: stretch;
	gap: 16px;
}

.left-sidebar {
	flex: 0 0 auto;
	width: 10rem;
	max-width: 30%;
}

main {
	flex: 1;
	display: flex;
	flex-direction: column;
}

:deep(.page-content) {
	flex: 1;
	max-height: 50vh;
	overflow: auto;

	h1,
	h2,
	h3,
	h4 {
		margin: 0.5em 0;
		font-weight: bold;
	}

	p {
		margin: 0.25em 0;
	}

	& > *:first-child {
		margin-top: 0;
	}
}

.nav-buttons {
	display: flex;
	justify-content: space-between;
	margin-top: 16px;

	button {
		height: fit-content;

		&.next {
			margin-left: auto;
		}
	}

	.nav-link {
		color: var(--el-color-primary);
	}
}

:deep(.nav-buttons button > span) {
	display: flex;
	flex-direction: column;

	.previous & {
		align-items: flex-start;
	}

	.next & {
		align-items: flex-end;
	}
}

:deep(.el-tree-node__expand-icon.is-leaf) {
	width: 0;
}

:deep(.el-tree-node__label) {
	padding-right: 8px;
}

.sidebar-divider {
	height: unset;
}
</style>
