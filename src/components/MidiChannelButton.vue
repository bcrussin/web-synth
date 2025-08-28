<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { MidiChannelOptions } from '@/classes/MidiChannel'
import MidiChannel from '@/classes/MidiChannel'
import type MidiDevice from '@/classes/MidiDevice'
import MidiManager from '@/classes/MidiManager'
import type Synth from '@/classes/Synth'
import { ref, type Ref } from 'vue'

import { ArrowDown } from '@element-plus/icons-vue'

const props = defineProps<{ device: MidiDevice; synth: Synth; channelNumber: number }>()

const dialogChannel: Ref<MidiChannel | undefined> = ref(undefined)
const dialogIsNewChannel: Ref<boolean> = ref(false)
const midiDevice = props.synth.midiDevice as MidiDevice
const channels = getChannels(props.channelNumber)

function getChannels(channelNumber: number) {
  return MidiManager.getChannels(props.device, props.synth, channelNumber)
}

function getFirstChannel(channelNumber: number) {
  return getChannels(channelNumber)?.[0]
}

function getChannelProperty(channel: MidiChannel, property: keyof MidiChannelOptions) {
  return channel?.getProperty(property)
}

function getIndicatorStyles(channel: number) {
  const value = props.device.channelValues[channel]

  const style: any = {}

  style.left = 0
  style.width = value * 100 + '%'

  return style
}

function channelExists(channelNumber: number) {
  return !!getChannels(channelNumber)
}

function getExistingChannels(): MidiChannel[] {
  const channels = []

  for (let i = 0; i < 16; i++) {
    if (getChannels(i)?.length > 0) channels.push(getChannels(i)![0])
  }

  return channels
}

function editChannel(channel?: MidiChannel | number) {
  if (!!channel && typeof channel !== 'number') {
    dialogIsNewChannel.value = false
    dialogChannel.value = channel
    return
  }

  const newChannel = new MidiChannel(props.device, {
    channelNumber: channel ?? 1,
    synth: props.synth,
  })

  dialogIsNewChannel.value = true
  dialogChannel.value = newChannel
}
</script>

<template>
  <div class="channel-button-container">
    <el-button
      v-if="getChannels(channelNumber)?.length <= 1"
      class="channel-button"
      @click="editChannel(getFirstChannel(channelNumber) ?? channelNumber)"
      >{{ getFirstChannel(channelNumber)?.param || 'None' }}</el-button
    >

    <el-dropdown v-else class="channel-button" @command="editChannel" trigger="click">
      <el-button class="channel-button"
        >{{ getChannels(channelNumber).length }} Params
        <el-icon class="el-icon--right"><ArrowDown /></el-icon
      ></el-button>

      <template #dropdown>
        <el-dropdown-item
          v-for="channel in getChannels(channelNumber)"
          :key="channel.channelNumber"
          :value="channel"
          :command="channel"
          >{{ channel.param }}</el-dropdown-item
        >
      </template>
    </el-dropdown>

    <div
      class="channel-value"
      :style="getIndicatorStyles(getFirstChannel(channelNumber)?.channelNumber)"
    ></div>
  </div>

  <MidiParamDialog
    v-if="dialogChannel"
    :channel="dialogChannel"
    :isNewChannel="dialogIsNewChannel"
    @update:model-value="() => (dialogChannel = undefined)"
  ></MidiParamDialog>
</template>

<style scoped>
.channel-button-container {
  position: relative;
  width: 100%;
}

.channel-button {
  width: 100%;
}

.channel-value {
  content: '';
  position: absolute;
  bottom: 0;
  height: 4px;
  background-color: var(--primary-color);
}
</style>
