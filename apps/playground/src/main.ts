import { MotionPlugin } from '@vueuse/motion'
import { createApp } from 'vue'
// eslint-disable-next-line import/no-duplicates
import { createRouter, createWebHashHistory } from 'vue-router'
// eslint-disable-next-line import/no-duplicates
import { routes } from 'vue-router/auto-routes'

import App from './App.vue'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/themes.css'
import 'splitpanes/dist/splitpanes.css'

const router = createRouter({ history: createWebHashHistory(), routes })

createApp(App)
  .use(router)
  .use(MotionPlugin)
  .mount('#app')
