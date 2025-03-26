import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'

import Global from './classes/Audio'

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
	FaDownload,
	MdKeyboardOutlined,
	MdPiano,
} from 'oh-vue-icons/icons'
import Keyboard from './classes/Keyboard'
import MidiDevice from './classes/MidiDevice'

addIcons(
	FaRegularCopy,
	MdContentpasteRound,
	BiSliders,
	HiBackspace,
	MdSettingsRound,
	HiDatabase,
	FaEllipsisH,
	FaUpload,
	FaDownload,
	MdKeyboardOutlined,
	MdPiano,
)

const isDark = useDark()
const toggleDark = useToggle(isDark)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(ElementPlus, { size: 'small', zIndex: 3000 })
app.component('v-icon', OhVueIcon)

Global.initialize(new AudioContext())
Keyboard.initialize()
MidiDevice.initialize()

app.mount('#app')
