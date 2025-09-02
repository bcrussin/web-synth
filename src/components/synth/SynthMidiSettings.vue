<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import Synth from '@/classes/Synth'
import MidiManager from '@/classes/MidiManager'
import { reactive, ref, type Ref } from 'vue';
import MidiDevice from '@/classes/MidiDevice';

const props = defineProps<{ synth: Synth }>()

if (!props.synth.midiDevice) throw new Error("No midi device");

function getChannels(channelNumber: number) {
  if (!props.synth.midiDevice) return []

  return MidiManager.getChannels(props.synth.midiDevice, props.synth, channelNumber)
}

const currentDevice: Ref<string> = ref(props.synth.midiDevice?.id);

function channelExists(channelNumber: number) {
  return !!getChannels(channelNumber)
}

function selectDevice(deviceName: string): void {
  currentDevice.value = deviceName;
}
</script>

<template>
  <el-select v-model="currentDevice">
    <template #label="{label, value}">
      <span>{{ MidiDevice.DEVICES[currentDevice].name }}</span>
    </template>

    <el-option v-for="(device, name) in MidiDevice.DEVICES" :value="device.id">
      {{ device.name }}
    </el-option>
  </el-select>
  <span class="section-label">Channel Settings:</span>
  <div class="channel-params-list">
    <template v-for="channelNumber in 16" :key="channelNumber">
      <div
        class="channel-param"
        v-if="channelExists(channelNumber)"
        :channelProperties="1"
        :key="channelNumber"
      >
        <span>{{ channelNumber }}:</span>
        <MidiChannelButton v-if="MidiDevice.DEVICES[currentDevice] != undefined" :synth="props.synth" :channelNumber="channelNumber" :device="MidiDevice.DEVICES[currentDevice]"></MidiChannelButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.section-label {
  font-weight: bold;
}

.channel-params-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
}

.channel-param {
  flex: 1 1 20%;
  box-sizing: border-box;

  display: flex;
  gap: 8px;
  min-width: 120px;
}

.channel-param > span {
  flex: 0 0 2.5ch;
}
</style>
