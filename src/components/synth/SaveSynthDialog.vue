<script setup lang="ts">
import type Synth from '@/classes/Synth';
import { SynthSerializer, SynthSerializerCategory } from '@/classes/SynthSerializer';
import { useSynthStore } from '@/stores/synthStore';
import { computed, ref } from 'vue';

const props = defineProps<{ synth: Synth }>();
const emit = defineEmits<{
  (e: 'update:model-value', value: boolean): void
}>()

const SynthStore = useSynthStore();
const savedSynths = SynthStore.fetchSynths();

const presetName = ref("");

function filterPresetNames(query: string, callback: any) {
  const names = Object.keys(savedSynths)
    .filter(name => name.toLowerCase().includes(query.toLowerCase()))
    .map(name => ({ value: name }));

  callback(names);
}

const categories = Object.values(SynthSerializerCategory).filter(
  v => typeof v === "number"
) as number[];

const includedCategories = ref(categories)

async function copy() {
  const data = SynthSerializer.serialize(props.synth);

  await navigator.clipboard.writeText(JSON.stringify(data));

  emit('update:model-value', false);
}

function save() {
  const data = SynthSerializer.serialize(props.synth);
  const name = !!presetName.value ? presetName.value : props.synth.name;

  SynthStore.saveSynth(name, data);

  emit('update:model-value', false);
}

</script>

<template>
  <el-dialog
    :title="`Save as Preset: ${synth.name}`"
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
        <el-autocomplete v-model="presetName" :placeholder="props.synth.name" :fetch-suggestions="filterPresetNames" clearable></el-autocomplete>
      </div>
    </div>

    <div class="flex-stretch">
      <div class="control-item" id="categories">
        <span>Categories:</span>

        <el-checkbox-group v-model="includedCategories" id="category-list">
          <el-checkbox v-for="category in categories" :label="SynthSerializer.getCategoryName(category)" :value="category" />
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
</style>
