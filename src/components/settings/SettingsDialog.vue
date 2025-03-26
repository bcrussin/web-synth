<script setup lang="ts"></script>

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
    <el-menu>
      <el-menu-item index="general">General</el-menu-item>
      <el-menu-item index="midi">MIDI</el-menu-item>
    </el-menu>
  </el-dialog>
</template>
