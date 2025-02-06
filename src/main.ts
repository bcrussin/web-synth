import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'

import Global from './classes/Audio'

import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(ElementPlus, { size: 'small', zIndex: 3000 })

Global.initialize(new AudioContext())

app.mount('#app')
