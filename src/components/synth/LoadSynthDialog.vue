<script setup lang="ts">
import type Synth from '@/classes/Synth';
import { SynthSerializer, SynthSerializerCategory } from '@/classes/SynthSerializer';
import { useSynthStore } from '@/stores/synthStore';
import { ref } from 'vue';

const props = defineProps<{ synth: Synth }>();
const emit = defineEmits<{
  (e: 'update:model-value', value: boolean): void
}>()

const SynthStore = useSynthStore();
const savedSynths = SynthStore.fetchSynths();

const synthName = ref("");

function load() {
  SynthSerializer.load(props.synth, savedSynths[synthName.value])

  emit('update:model-value', false);
}

</script>

<template>
  <el-dialog
    :title="`Load Synth: ${synth.name}`"
    id="load-dialog"
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
        <span>Synth:</span>
        <el-select v-model="synthName">
          <el-option v-for="(synth, name) in savedSynths" :value="name">
            {{ name }}
          </el-option>
        </el-select>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:model-value', false)">Cancel</el-button>
        <el-button type="primary" @click="load()">Load</el-button>
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
</style>
