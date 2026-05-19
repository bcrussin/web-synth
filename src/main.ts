import './assets/main.css'
import 'element-plus/dist/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'

import { useDark, useToggle } from '@vueuse/core'

import { OhVueIcon, addIcons } from 'oh-vue-icons'
import {
	FaRegularCopy,
	MdContentpasteRound,
	BiSliders,
	HiBackspace,
	MdSettingsRound,
	HiDatabase,
	FaEllipsisH,
	FaUpload,
	FaQuestion,
	FaDownload,
	MdKeyboardOutlined,
	MdPiano,
} from 'oh-vue-icons/icons'

import Global from './classes/Audio'
import Keyboard from './classes/Keyboard'
import MidiDevice from './classes/MidiDevice'
import { useMidiStore } from './stores/midiStore'

addIcons(
	FaRegularCopy,
	MdContentpasteRound,
	BiSliders,
	HiBackspace,
	MdSettingsRound,
	HiDatabase,
	FaEllipsisH,
	FaUpload,
	FaQuestion,
	FaDownload,
	MdKeyboardOutlined,
	MdPiano,
)

const isDark = useDark()
const toggleDark = useToggle(isDark)

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

app.use(ElementPlus, { size: 'small', zIndex: 3000 })
app.component('v-icon', OhVueIcon)

Global.initialize(new AudioContext())
Keyboard.initialize()
MidiDevice.initialize()

app.mount('#app')
