<script setup lang="ts">
import MidiDevice from '@/classes/MidiDevice';
import type Synth from '@/classes/Synth';
import { SynthSerializer, SynthSerializerCategory, type SerializedSynth } from '@/classes/SynthSerializer';
import { useSynthStore } from '@/stores/synthStore';
import { ref, watch, type Ref } from 'vue';

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
const synthPresets = SynthStore.fetchSynths();

const missingMidiDevices: Ref<{ [key: string]: string }> = ref({}); // { missingId: missingName }
const replacedMidiDevices: Ref<{ [key: string]: string }> = ref({}) // { missingId: newId }

const categories = Object.values(SynthSerializerCategory);

const includedCategories = ref(categories)

const synthName = ref("");
const pastedData = ref("");

enum Tab {
  PRESET = "Preset",
  PASTE_DATA = "Paste Data"
}

const currentTab = ref(Tab.PRESET);

function load(checkMissingChannels: boolean = true) {
  let data: SerializedSynth = {};

  switch(currentTab.value) {
    case Tab.PRESET:
      data = synthPresets[synthName.value];
      break;
    case Tab.PASTE_DATA:
      data = JSON.parse(pastedData.value);
      break;
  }

  const missingDevices = new Map<string, string>();

  const midiData = data.midi

  if (!!midiData) {
    midiData.forEach((channel, index) => {

      // Check if device ID currently exists
      if (!MidiDevice.DEVICES[channel.device]) {

        // Use existing device if it has the same name as the missing one
        const deviceWithSameName = MidiDevice.getDeviceByName(channel.deviceName);
        if (!!deviceWithSameName) {
          midiData[index].device = deviceWithSameName.id;
        }

        // If not, check if an existing device has been assigned to that ID
        if (!!replacedMidiDevices.value[channel.device]) {
          midiData[index].device = replacedMidiDevices.value[channel.device];
        } else if (checkMissingChannels && !MidiDevice.DEVICES[channel.device]) {
          // Flag any MIDI devices not accounted for
          missingDevices.set(channel.device, channel.deviceName ?? channel.device);
        }

      }
    })
  }

  if (missingDevices.size > 0) {
    // Keep a list of missing MIDI devices along
    missingMidiDevices.value = Object.fromEntries(
      Array.from(missingDevices.entries()).map(([id, name]) => [
        id,
        name
      ])
    )

    return
  }

  missingMidiDevices.value = {};
  replacedMidiDevices.value = {};
  SynthSerializer.load(props.synth, data, includedCategories.value)
  emit('update:model-value', false);
}

function resetMidiDeviceReplacement() {
  missingMidiDevices.value = {}
  replacedMidiDevices.value = {}
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
              <el-option v-for="(synthPreset, name) in synthPresets" :key="name" :value="name" style="height: fit-content;" class="preset-option">
                <div>{{ name }}</div>
                <div class="preset-tags-container">
                  <el-tag type="primary" v-for="category in SynthSerializer.getPresetCategoryNames(synthPreset)">{{ category }}</el-tag>
                </div>
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

    <!-- Assign existing MIDI devices to any missing devices -->
    <el-dialog
    :model-value="Object.keys(missingMidiDevices).length > 0"
    :title="`Missing MIDI Devices`"
    id="missing-devices-dialog"
    class="dark"
    modal
    @close="() => (resetMidiDeviceReplacement())"
    :style="{
      width: '90vw',
      maxWidth: '30rem',
    }">
      <p id="missing-devices-message">Some of the provided MIDI devices no longer exist. Assign them to an existing device or leave blank to skip channels for that device:</p>

      <div class="device-line" v-for="[key, value] in Object.entries(missingMidiDevices)">
        <span>{{ value }}</span>
        <el-select v-model="replacedMidiDevices[key]">
          <el-option value="" label="None"></el-option>
          <el-option v-for="device in MidiDevice.DEVICES" :value="device.id" :label="device.name"></el-option>
        </el-select>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetMidiDeviceReplacement()">Cancel</el-button>
          <el-button type="primary" @click="load(false)">Continue</el-button>
        </span>
      </template>
    </el-dialog>
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

#missing-devices-message {
  margin-bottom: 16px;
}

#missing-devices-dialog .device-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 8px;
}

#missing-devices-dialog .device-line > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#missing-devices-dialog .device-line > .el-select {
  flex-shrink: 1;
  flex-basis: auto;
  max-width: 50%;
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
