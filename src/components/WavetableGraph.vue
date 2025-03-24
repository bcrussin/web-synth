<script setup lang="ts">
import Synth from '@/classes/Synth'
import '@/assets/main.css'
import { onMounted, ref, watch, type Ref } from 'vue'

const props = defineProps<{ synth: Synth }>()

const wavetable: Ref<number[], number[]> = ref([])
let ctx: CanvasRenderingContext2D | null | undefined
const canvasRef = ref<HTMLCanvasElement | null>(null)

defineExpose({ wavetable, resizeWavetable, setTransparent })

watch(
  () => props.synth.type,
  (newType: string | null) => {
    setTransparent()
  },
)

watch(
  () => props.synth.wavetable,
  (newWaveTable: number[] | null) => {
    if (!!newWaveTable) {
      wavetable.value = newWaveTable
      render()
    }
  },
)

onMounted(() => {
  if (!!props.synth.wavetable) {
    wavetable.value = props.synth.wavetable
    resizeWavetable()
  } else {
    wavetable.value = new Array(length).fill(0)
  }

  ctx = canvasRef.value?.getContext('2d')
  resizeWavetable()
  setTransparent()
})

function resizeWavetable(size?: number) {
  if (wavetable.value == undefined) {
    wavetable.value = new Array(size).fill(0)
    return
  }

  size = size ?? 16

  const len = wavetable.value.length
  if (len > size) {
    wavetable.value = wavetable.value.slice(0, size)
  } else if (len < size) {
    for (let i = len; i < size; i++) {
      wavetable.value.push(0)
    }
  }

  render()
  props.synth.setWavetable(wavetable.value)
}

function render() {
  if (wavetable.value == undefined || canvasRef.value == undefined || ctx == undefined) return

  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  ctx.fillStyle = 'white'
  const barWidth = canvasRef.value.width / wavetable.value.length

  for (let i = 0; i < wavetable.value.length; i++) {
    const x = i * barWidth
    const barHeight = (canvasRef.value.height * (wavetable.value[i] + 1)) / 2
    ctx.fillRect(x, canvasRef.value.height - barHeight, barWidth, barHeight)
  }
}

function edit(e: MouseEvent | Touch) {
  if (wavetable.value == undefined || canvasRef.value == undefined || ctx == undefined) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const px = Math.max(0, Math.min(x / canvasRef.value.width, 1))
  const py = Math.max(0, Math.min(1 - y / canvasRef.value.height, 1))

  const bar = Math.min(Math.floor(px * wavetable.value.length), wavetable.value.length - 1)
  wavetable.value[bar] = py * 2 - 1

  render()

  props.synth.setWavetable(wavetable.value)
  props.synth.setWaveType('custom')
  // setWaveType("custom");
}

function onMouseMove(e: MouseEvent) {
  if (e.buttons & 1) {
    edit(e)
  }
}

function onTouchMove(e: TouchEvent) {
  edit(e.changedTouches[0])
}

function setTransparent(isTransparent?: boolean) {
  if (canvasRef.value == undefined) return

  isTransparent = isTransparent ?? !(!!props.synth.preset || props.synth.type == 'custom')

  if (isTransparent) {
    canvasRef.value.classList.add('transparent')
  } else {
    canvasRef.value.classList.remove('transparent')
  }
}

function copyWavetable() {
  navigator.clipboard.writeText(`[${wavetable.value.toString()}]`)
}

function pasteWavetable() {
  navigator.clipboard.readText().then((clipboard) => {
    try {
      if (!clipboard.startsWith('[')) clipboard = '[' + clipboard
      if (!clipboard.endsWith(']')) clipboard = clipboard + ']'

      const parsed = JSON.parse(clipboard)
      if (Array.isArray(parsed)) {
        props.synth.setWavetable(parsed)
        props.synth.setWaveType('custom')
      }
    } catch (err) {
      console.log(err)
      return
    }
  })
}
</script>

<template>
  <div class="graph-container">
    <canvas
      ref="canvasRef"
      id="wavetable-graph"
      v-on:mousemove="onMouseMove"
      v-on:touchmove="onTouchMove"
    ></canvas>

    <div class="graph-controls">
      <el-button id="copy-wavetable" @click="copyWavetable()">
        <v-icon name="fa-regular-copy" scale="0.8"></v-icon>
      </el-button>
      <el-button id="paste-wavetable" @click="pasteWavetable()">
        <v-icon name="md-contentpaste-round" scale="0.8"></v-icon>
      </el-button>
    </div>
  </div>
</template>

<style>
.graph-container {
  display: flex;
  flex-direction: column;
}

#wavetable-graph {
  border: 2px solid #35d399;
  border-radius: 8px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  background-color: black;
}

#wavetable-graph.transparent {
  opacity: 0.5;
}

.graph-controls {
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  align-items: center;
}

.graph-controls > * {
  flex: 1;
  margin: 0 !important;
  padding: 12px;
}

.graph-controls > *:not(:first-child) {
  border-left: none;
  border-bottom-left-radius: 0;
}

.graph-controls > *:not(:last-child) {
  border-bottom-right-radius: 0;
}
</style>

<!-- <script lang="ts">
export default {
  props: {
    synth: Synth
  },
  data() {
    return {
      wavetable: null,
    }
  },
  mounted() {
    if (!!this.synth?.wavetable) {
      this.wavetable = this.synth.wavetable;
      this.resizeWavetable();
    } else {
      this.wavetable = new Array(length).fill(0);
    }
  },
}
</script> -->
<!--
class WavetableGraph {
  constructor(synth, length, id) {
    this.synth = synth;

    if (!!this.synth.wavetable) {
      this.wavetable = this.synth.wavetable;
      this.resizeWavetable();
    } else {
      this.wavetable = new Array(length).fill(0);
    }

    this.id = id;

    this.canvas = document.getElementById(this.id);
    this.ctx = this.canvas.getContext("2d");

    this.canvas.onmousemove = (e) => {
      if (e.buttons & 1) {
        this.edit(e);
      }
    };
    this.canvas.ontouchmove = (e) => {
      this.edit(e.changedTouches[0]);
    };

    this.render();
  }

  render() {
    if (this.canvas == undefined || this.ctx == undefined) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "white";
    let barWidth = this.canvas.width / this.wavetable.length;

    for (let i = 0; i < this.wavetable.length; i++) {
      let x = i * barWidth;
      let barHeight = (this.canvas.height * (this.wavetable[i] + 1)) / 2;
      this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
    }
  }

  edit(e) {
    let rect = this.canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    let px = Math.max(0, Math.min(x / this.canvas.width, 1));
    let py = Math.max(0, Math.min(1 - y / this.canvas.height, 1));

    let bar = Math.min(
      Math.floor(px * this.wavetable.length),
      this.wavetable.length - 1
    );
    this.wavetable[bar] = py * 2 - 1;
    this.render();

    this.synth.setWavetable(this.wavetable);
    setWaveType("custom");
  }

  setWavetable(wavetable) {
    if (!!wavetable) this.wavetable = [...wavetable];
    this.render();

    this.synth.setWavetable(this.wavetable);
  }

  resizeWavetable(size) {
    if (this.wavetable == undefined) {
      this.wavetable = new Array(size).fill(0);
      return;
    }

    size = size ?? wavetableSize;

    let len = this.wavetable.length;
    if (len > size) {
      this.wavetable = this.wavetable.slice(0, size);
    } else if (len < size) {
      for (let i = len; i < size; i++) {
        this.wavetable.push(0);
      }
    }

    this.render();
    this.synth.setWavetable(this.wavetable);
  }
} -->
