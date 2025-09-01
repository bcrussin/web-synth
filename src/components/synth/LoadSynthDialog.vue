<script setup lang="ts">
import type Synth from '@/classes/Synth';
import { SynthSerializer, SynthSerializerCategory } from '@/classes/SynthSerializer';
import { useSynthStore } from '@/stores/synthStore';
import { ref, watch } from 'vue';

const props = defineProps<{ synth: Synth; isVisible: boolean }>();
const emit = defineEmits<{
  (e: 'update:model-value', value: boolean): void
}>()

watch(() => props.isVisible,
  (isVisible) => {
    if (!isVisible) {
      synthName.value = "";
      pastedData.value = "";
      includedCategories.value = categories;
    }
  }
)

const SynthStore = useSynthStore();
const savedSynths = SynthStore.fetchSynths();

const categories = Object.values(SynthSerializerCategory).filter(
  v => typeof v === "number"
) as number[];

const includedCategories = ref(categories)

const synthName = ref("");
const pastedData = ref("");

enum Tab {
  PRESET = "Preset",
  PASTE_DATA = "Paste Data"
}

const currentTab = ref(Tab.PRESET);

function load() {
  let data = {};

  switch(currentTab.value) {
    case Tab.PRESET:
      data = savedSynths[synthName.value];
      break;
    case Tab.PASTE_DATA:
      data = JSON.parse(pastedData.value);
      break;
  }

  SynthSerializer.load(props.synth, data, includedCategories.value)

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
    <el-tabs v-model="currentTab" id="load-dialog-tabs">
      <el-tab-pane :label="Tab.PRESET" :name="Tab.PRESET">
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
      </el-tab-pane>
      <el-tab-pane :label="Tab.PASTE_DATA" :name="Tab.PASTE_DATA">
        <el-input
          id="pasted-data"
          v-model="pastedData"
          :autosize="{ minRows: 3, maxRows: 16 }"
          type="textarea"
          placeholder="Paste synth data..."
        />
      </el-tab-pane>
    </el-tabs>

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
        <el-button type="primary" @click="load()">Load</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
#load-dialog-tabs {
  margin-bottom: 16px;
}

#category-list {
  margin-left: 16px;
  display: flex;
  flex-direction: column;
}

:deep(#pasted-data) {
  resize: none;
}
</style>
